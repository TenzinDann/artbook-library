import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { timingSafeEqual } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const DEFAULT_PORT = 8787;

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value, fallback = false) => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return fallback;
  }
  const normalized = String(value).trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
};

const parseList = (value) =>
  String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const defaultOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  `http://localhost:${DEFAULT_PORT}`,
  `http://127.0.0.1:${DEFAULT_PORT}`
];

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.ogg': 'video/ogg',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webm': 'video/webm',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

const COLLECTION_CONTEXT = [
  '- Visions of Light by Elena Rostova: A breathtaking collection of ethereal landscapes and light studies.',
  '- Explore the Galaxy by Kenji Sato: Concept art from the acclaimed cyberpunk universe.',
  '- Need for Speed by David Chen: Black and white photography of brutalist architecture.',
  '- Art of War by David Chen: Black and white photography of brutalist architecture.',
  '- Art of Anime by David Chen: Black and white photography of brutalist architecture.'
].join('\n');

const SYSTEM_INSTRUCTION = `You are the Curator for the "Artbook Library", a serene and immersive collection of visual arts.
Your tone is calm, inviting, knowledgeable, and sophisticated. Avoid overly technical jargon.

Here is our current artbook collection:
${COLLECTION_CONTEXT}

Answer visitor questions about the artists, books, and exhibition philosophy.
Keep answers concise (usually under 3 sentences) for chat UI readability.
If asked about items outside the collection, gently steer them back to the curated artbooks.`;

const rateLimitBuckets = new Map();
let redisRateLimitFailed = false;

const loadEnvFile = (filePath) => {
  if (!existsSync(filePath)) {
    return;
  }

  const content = readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex < 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = line.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
};

loadEnvFile(path.join(ROOT_DIR, '.env.local'));
loadEnvFile(path.join(ROOT_DIR, '.env'));

const REQUEST_TIMEOUT_MS = parsePositiveInt(process.env.CHAT_TIMEOUT_MS, 15000);
const RETRY_ATTEMPTS = parsePositiveInt(process.env.CHAT_RETRY_ATTEMPTS, 1);
const MAX_HISTORY_ITEMS = parsePositiveInt(process.env.CHAT_HISTORY_LIMIT, 20);
const MAX_MESSAGE_LENGTH = parsePositiveInt(process.env.CHAT_MESSAGE_MAX_LENGTH, 2000);
const RATE_LIMIT_WINDOW_MS = parsePositiveInt(process.env.CHAT_RATE_LIMIT_WINDOW_MS, 60000);
const RATE_LIMIT_MAX_REQUESTS = parsePositiveInt(process.env.CHAT_RATE_LIMIT_MAX_REQUESTS, 20);
const ENABLE_LOCAL_FALLBACK =
  String(process.env.CHAT_ENABLE_LOCAL_FALLBACK ?? 'true').toLowerCase() !== 'false';
const RATE_LIMIT_REDIS_URL =
  process.env.RATE_LIMIT_REDIS_URL?.trim() || process.env.UPSTASH_REDIS_REST_URL?.trim() || '';
const RATE_LIMIT_REDIS_TOKEN =
  process.env.RATE_LIMIT_REDIS_TOKEN?.trim() || process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || '';
const USE_REDIS_RATE_LIMIT = Boolean(RATE_LIMIT_REDIS_URL && RATE_LIMIT_REDIS_TOKEN);

const fallbackModels = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
const configuredModels = [
  ...parseList(process.env.GEMINI_MODELS),
  process.env.GEMINI_MODEL?.trim() || ''
]
  .filter(Boolean)
  .concat(fallbackModels);

const MODEL_CANDIDATES = Array.from(new Set(configuredModels));
const CHAT_API_TOKEN = process.env.CHAT_API_TOKEN?.trim() || '';
const IS_PRODUCTION = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const REQUIRE_API_TOKEN = parseBoolean(process.env.CHAT_REQUIRE_TOKEN, IS_PRODUCTION);
const allowedOrigins = parseList(process.env.CHAT_ALLOWED_ORIGINS);
const ORIGIN_ALLOWLIST = new Set(
  (allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins).map((origin) =>
    origin.toLowerCase()
  )
);

if (REQUIRE_API_TOKEN && !CHAT_API_TOKEN) {
  console.error(
    'CHAT_API_TOKEN is required when CHAT_REQUIRE_TOKEN=true or NODE_ENV=production.'
  );
  process.exit(1);
}

const getErrorMessage = (error) => {
  if (error instanceof Error && typeof error.message === 'string') {
    return error.message;
  }
  return String(error ?? '');
};

const isOriginAllowed = (origin) => {
  if (!origin) {
    return true;
  }
  if (ORIGIN_ALLOWLIST.has('*')) {
    return true;
  }
  return ORIGIN_ALLOWLIST.has(origin.toLowerCase());
};

const getCorsHeaders = (origin) => {
  const headers = { Vary: 'Origin' };

  if (origin && isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Credentials'] = 'true';
  }

  return headers;
};

const sendJson = (res, statusCode, payload, extraHeaders = {}) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...extraHeaders
  });
  res.end(JSON.stringify(payload));
};

const getRequestBody = (req, maxBytes = 256 * 1024) =>
  new Promise((resolve, reject) => {
    let raw = '';

    req.on('data', (chunk) => {
      raw += chunk;
      if (Buffer.byteLength(raw, 'utf8') > maxBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });

    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });

const sanitizeHistory = (history) => {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .map((item) => ({
      role: item?.role === 'model' ? 'model' : 'user',
      text: typeof item?.text === 'string' ? item.text.trim().slice(0, MAX_MESSAGE_LENGTH) : ''
    }))
    .filter((item) => item.text.length > 0)
    .slice(-MAX_HISTORY_ITEMS);
};

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
};

const cleanupRateLimits = (now) => {
  const cutoff = now - RATE_LIMIT_WINDOW_MS * 2;
  for (const [ip, entry] of rateLimitBuckets.entries()) {
    if (entry.windowStart < cutoff) {
      rateLimitBuckets.delete(ip);
    }
  }
};

const checkRateLimitMemory = (ip, now = Date.now()) => {
  const existing = rateLimitBuckets.get(ip);
  if (!existing || now - existing.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(ip, { windowStart: now, count: 1 });
    if (rateLimitBuckets.size > 5000) {
      cleanupRateLimits(now);
    }
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.max(
      1,
      Math.ceil((existing.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000)
    );
    return { allowed: false, retryAfter };
  }

  existing.count += 1;
  return { allowed: true, retryAfter: 0 };
};

const redisCommand = async (args) => {
  const response = await fetch(RATE_LIMIT_REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RATE_LIMIT_REDIS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });

  if (!response.ok) {
    throw new Error(`Redis REST error: ${response.status}`);
  }

  const payload = await response.json();
  if (payload && Object.prototype.hasOwnProperty.call(payload, 'result')) {
    return payload.result;
  }

  return payload;
};

const checkRateLimitRedis = async (ip, now = Date.now()) => {
  const windowBucket = Math.floor(now / RATE_LIMIT_WINDOW_MS);
  const key = `chat:rl:${ip}:${windowBucket}`;
  const countRaw = await redisCommand(['INCR', key]);
  const count = Number(countRaw);

  if (!Number.isFinite(count)) {
    throw new Error('Invalid Redis INCR response');
  }

  if (count === 1) {
    await redisCommand(['EXPIRE', key, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)]);
  }

  if (count > RATE_LIMIT_MAX_REQUESTS) {
    const ttlRaw = await redisCommand(['TTL', key]);
    const ttl = Number(ttlRaw);
    return { allowed: false, retryAfter: Number.isFinite(ttl) && ttl > 0 ? ttl : 1 };
  }

  return { allowed: true, retryAfter: 0 };
};

const checkRateLimit = async (ip, now = Date.now()) => {
  if (USE_REDIS_RATE_LIMIT) {
    try {
      return await checkRateLimitRedis(ip, now);
    } catch {
      if (!redisRateLimitFailed) {
        redisRateLimitFailed = true;
        console.error('Redis rate limit backend failed, falling back to in-memory limiter.');
      }
    }
  }

  return checkRateLimitMemory(ip, now);
};

const hasValidApiToken = (req) => {
  if (!CHAT_API_TOKEN) {
    return !REQUIRE_API_TOKEN;
  }

  const authHeader = req.headers.authorization;
  if (typeof authHeader !== 'string') {
    return false;
  }

  const matched = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!matched) {
    return false;
  }

  const provided = Buffer.from(matched[1], 'utf8');
  const expected = Buffer.from(CHAT_API_TOKEN, 'utf8');
  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(provided, expected);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = (promise, timeoutMs) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Upstream timeout after ${timeoutMs}ms`)), timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });

const isRetryableUpstreamError = (error) => {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('timeout') ||
    message.includes('deadline exceeded') ||
    message.includes('temporar') ||
    message.includes('rate limit') ||
    message.includes('resource exhausted') ||
    message.includes('429') ||
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('network')
  );
};

const buildContents = (history, newMessage) => [
  ...history.map((item) => ({
    role: item.role,
    parts: [{ text: item.text }]
  })),
  {
    role: 'user',
    parts: [{ text: newMessage }]
  }
];

const extractTextFromResponse = (response) => {
  if (typeof response?.text === 'string' && response.text.trim()) {
    return response.text.trim();
  }

  const parts = response?.candidates?.[0]?.content?.parts;
  if (Array.isArray(parts)) {
    const merged = parts
      .map((part) => (typeof part?.text === 'string' ? part.text : ''))
      .join('')
      .trim();
    if (merged) {
      return merged;
    }
  }

  return '';
};

const sendToGemini = async (apiKey, history, newMessage) => {
  const ai = new GoogleGenAI({ apiKey });
  let lastError = null;

  for (const model of MODEL_CANDIDATES) {
    for (let attempt = 0; attempt <= RETRY_ATTEMPTS; attempt += 1) {
      try {
        const result = await withTimeout(
          ai.models.generateContent({
            model,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION
            },
            contents: buildContents(history, newMessage)
          }),
          REQUEST_TIMEOUT_MS
        );
        const text = extractTextFromResponse(result);
        if (!text) {
          throw new Error('Empty Gemini response');
        }

        return text;
      } catch (error) {
        lastError = error;
        const shouldRetry = attempt < RETRY_ATTEMPTS && isRetryableUpstreamError(error);
        if (shouldRetry) {
          await sleep(Math.min(1500, 250 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error('Failed to generate response from Gemini.');
};

const buildLocalFallbackReply = (message) => {
  const text = message.toLowerCase();

  if (text.includes('anime') || text.includes('cartoon')) {
    return 'Art of Anime mirrors Need for Speed with brutalist forms and strong geometry in black-and-white style. It pairs well with slower, contemplative browsing.';
  }
  if (text.includes('art of war') || /\bwar\b/.test(text)) {
    return 'Art of War mirrors Need for Speed with brutalist forms and strong geometry in black-and-white style. It sits between Need for Speed and Art of Anime in the sequence.';
  }
  if (text.includes('neon') || text.includes('cyber') || text.includes('galaxy')) {
    return 'Explore the Galaxy is a concept-art exhibition with dense city mood and futuristic tone. It is ideal if you want something cinematic and high contrast.';
  }
  if (text.includes('silent') || text.includes('monolith') || text.includes('architecture') || text.includes('need for speed')) {
    return 'Need for Speed focuses on brutalist forms and strong geometry in black-and-white style. It pairs well with slower, contemplative browsing.';
  }
  if (text.includes('vision') || text.includes('light') || text.includes('illustration')) {
    return 'Visions of Light explores atmosphere and natural illumination through ethereal landscapes. It is a gentle starting point for the collection.';
  }
  if (text.includes('which') || text.includes('recommend') || text.includes('start')) {
    return 'A great route is Visions of Light, then Explore the Galaxy, then Need for Speed, then Art of War, and finally Art of Anime for a parallel architectural finish.';
  }

  return 'The curator service is briefly in offline mode, but you can still explore all five exhibitions from Home and Gallery. Ask about a specific title for focused guidance.';
};

const handleChat = async (req, res, corsHeaders) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    sendJson(
      res,
      503,
      { code: 'SERVICE_UNAVAILABLE', error: 'Chat service is temporarily unavailable.' },
      corsHeaders
    );
    return;
  }

  let payload;
  try {
    const rawBody = await getRequestBody(req);
    payload = JSON.parse(rawBody || '{}');
  } catch {
    sendJson(res, 400, { code: 'INVALID_REQUEST', error: 'Invalid request body.' }, corsHeaders);
    return;
  }

  const newMessage = typeof payload?.newMessage === 'string' ? payload.newMessage.trim() : '';
  if (!newMessage) {
    sendJson(res, 400, { code: 'EMPTY_MESSAGE', error: 'Message cannot be empty.' }, corsHeaders);
    return;
  }

  if (newMessage.length > MAX_MESSAGE_LENGTH) {
    sendJson(
      res,
      400,
      { code: 'MESSAGE_TOO_LONG', error: `Message is too long (max ${MAX_MESSAGE_LENGTH} chars).` },
      corsHeaders
    );
    return;
  }

  const history = sanitizeHistory(payload?.history);

  try {
    const text = await sendToGemini(apiKey, history, newMessage);
    sendJson(res, 200, { text }, corsHeaders);
  } catch (error) {
    console.error('Gemini API Error:', getErrorMessage(error));
    if (ENABLE_LOCAL_FALLBACK) {
      const fallbackText = buildLocalFallbackReply(newMessage);
      sendJson(res, 200, { text: fallbackText, degraded: true }, corsHeaders);
      return;
    }
    sendJson(
      res,
      502,
      { code: 'UPSTREAM_ERROR', error: 'Chat service is temporarily unavailable.' },
      corsHeaders
    );
  }
};

const decodePathnameSafely = (rawPathname) => {
  try {
    return decodeURIComponent(rawPathname);
  } catch {
    return null;
  }
};

const DIST_ROOT = path.resolve(DIST_DIR);

const isPathInsideDirectory = (baseDir, targetPath) => {
  const relative = path.relative(baseDir, targetPath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
};

const resolveFilePath = (urlPathname) => {
  const rawPathname = urlPathname.split('?')[0];
  const decodedPathname = decodePathnameSafely(rawPathname);
  if (decodedPathname === null) {
    return null;
  }

  const normalized = decodedPathname.replace(/\\/g, '/');

  let requestedPath = normalized;
  if (requestedPath === '/') {
    requestedPath = '/index.html';
  } else if (requestedPath.endsWith('/')) {
    requestedPath = `${requestedPath}index.html`;
  }

  const candidate = path.resolve(DIST_DIR, `.${requestedPath}`);
  if (!isPathInsideDirectory(DIST_ROOT, candidate)) {
    return null;
  }

  return candidate;
};

const getStaticResponseHeaders = (filePath, contentLength) => {
  const ext = path.extname(filePath).toLowerCase();
  return {
    'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
    'Accept-Ranges': 'bytes',
    'Content-Length': String(contentLength)
  };
};

// Support single byte-range requests so browsers can seek through local video files.
const parseByteRange = (rangeHeader, fileSize) => {
  if (!rangeHeader) {
    return null;
  }

  const normalized = rangeHeader.trim();
  if (!normalized.startsWith('bytes=')) {
    return 'invalid';
  }

  const ranges = normalized.slice('bytes='.length).split(',');
  if (ranges.length !== 1) {
    return 'invalid';
  }

  const [rawStart = '', rawEnd = ''] = ranges[0].split('-').map((part) => part.trim());
  if ((!rawStart && !rawEnd) || (rawStart && !/^\d+$/.test(rawStart)) || (rawEnd && !/^\d+$/.test(rawEnd))) {
    return 'invalid';
  }

  if (fileSize <= 0) {
    return 'unsatisfiable';
  }

  let start;
  let end;

  if (!rawStart) {
    const suffixLength = Number(rawEnd);
    if (!Number.isFinite(suffixLength) || suffixLength <= 0) {
      return 'invalid';
    }
    start = Math.max(fileSize - suffixLength, 0);
    end = fileSize - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd ? Number(rawEnd) : fileSize - 1;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || start >= fileSize) {
    return 'unsatisfiable';
  }

  return {
    start,
    end: Math.min(end, fileSize - 1)
  };
};

const serveStatic = async (req, res, pathname) => {
  if (!existsSync(DIST_DIR)) {
    sendJson(res, 503, {
      error: 'Static build not found. Run `npm run build` before `npm run start`.'
    });
    return true;
  }

  const filePath = resolveFilePath(pathname);
  if (!filePath) {
    sendJson(res, 400, { error: 'Invalid path.' });
    return true;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      return false;
    }

    const rangeHeader = Array.isArray(req.headers.range) ? req.headers.range[0] : req.headers.range;
    const parsedRange = parseByteRange(rangeHeader, fileStat.size);

    if (parsedRange === 'invalid' || parsedRange === 'unsatisfiable') {
      res.writeHead(416, {
        ...getStaticResponseHeaders(filePath, 0),
        'Content-Range': `bytes */${fileStat.size}`
      });
      res.end();
      return true;
    }

    if (parsedRange) {
      const { start, end } = parsedRange;
      const contentLength = end - start + 1;
      res.writeHead(206, {
        ...getStaticResponseHeaders(filePath, contentLength),
        'Content-Range': `bytes ${start}-${end}/${fileStat.size}`
      });

      if (req.method === 'HEAD') {
        res.end();
        return true;
      }

      await pipeline(createReadStream(filePath, { start, end }), res);
      return true;
    }

    res.writeHead(200, getStaticResponseHeaders(filePath, fileStat.size));

    if (req.method === 'HEAD') {
      res.end();
      return true;
    }

    await pipeline(createReadStream(filePath), res);
    return true;
  } catch {
    return false;
  }
};

const server = createServer(async (req, res) => {
  const method = req.method || 'GET';
  const requestUrl = req.url || '/';
  const pathname = requestUrl.split('?')[0];
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  const corsHeaders = getCorsHeaders(origin);

  if (pathname === '/api/chat') {
    if (origin && !isOriginAllowed(origin)) {
      sendJson(res, 403, { code: 'ORIGIN_FORBIDDEN', error: 'Request origin not allowed.' }, corsHeaders);
      return;
    }

    if (method === 'OPTIONS') {
      res.writeHead(204, {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });
      res.end();
      return;
    }

    if (method !== 'POST') {
      sendJson(res, 405, { code: 'METHOD_NOT_ALLOWED', error: 'Method not allowed.' }, corsHeaders);
      return;
    }

    if (!hasValidApiToken(req)) {
      sendJson(res, 401, { code: 'UNAUTHORIZED', error: 'Unauthorized.' }, corsHeaders);
      return;
    }

    const clientIp = getClientIp(req);
    const limit = await checkRateLimit(clientIp);
    if (!limit.allowed) {
      sendJson(
        res,
        429,
        { code: 'RATE_LIMITED', error: 'Too many requests. Please try again shortly.' },
        { ...corsHeaders, 'Retry-After': String(limit.retryAfter) }
      );
      return;
    }

    await handleChat(req, res, corsHeaders);
    return;
  }

  if (pathname === '/api/health') {
    if (method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed.' }, corsHeaders);
      return;
    }

    sendJson(res, 200, { ok: true }, corsHeaders);
    return;
  }

  if (method !== 'GET' && method !== 'HEAD') {
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  const served = await serveStatic(req, res, pathname);
  if (served) {
    return;
  }

  // Multi-page fallback: if route has no extension, attempt /index.html under that route.
  if (!path.extname(pathname)) {
    const fallbackPath = pathname.endsWith('/') ? pathname : `${pathname}/`;
    const fallbackServed = await serveStatic(req, res, fallbackPath);
    if (fallbackServed) {
      return;
    }
  }

  sendJson(res, 404, { error: 'Not found.' });
});

const port = Number(process.env.PORT || DEFAULT_PORT);
server.listen(port, '0.0.0.0', () => {
  console.log(`Chat server listening on http://127.0.0.1:${port}`);
});
