const ABSOLUTE_URL_PATTERN = /^(https?:)?\/\//i;
const SPECIAL_URI_PATTERN = /^(data:|blob:)/i;
const VISIONS_OF_LIGHT_CLOUDFRONT_URL =
  'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/visions-of-light-cover.mp4';
const NEED_FOR_SPEED_CLOUDFRONT_URL =
  'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/R34.mp4';
const ART_OF_WAR_CLOUDFRONT_URL =
  'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/Art%20of%20War.mp4';
const ART_OF_ANIME_CLOUDFRONT_URL =
  'https://pub-404a20f41ee84d6a8e87c77f2be7452c.r2.dev/Campfire.mp4';

const MEDIA_FALLBACKS: Record<string, string[]> = {
  [VISIONS_OF_LIGHT_CLOUDFRONT_URL]: ['/media/visions-of-light-cover.mp4'],
  [NEED_FOR_SPEED_CLOUDFRONT_URL]: ['/media/R34.mp4'],
  [ART_OF_WAR_CLOUDFRONT_URL]: ['/media/Art of War.mp4'],
  [ART_OF_ANIME_CLOUDFRONT_URL]: ['/media/Campfire.mp4'],
};

const normalizeBasePath = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '/';
  }

  const withLeadingSlash = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash : `${withLeadingSlash}/`;
};

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const getConfiguredMediaBase = (): string => {
  const configured = import.meta.env.VITE_MEDIA_BASE_URL?.trim();
  if (!configured) {
    return '';
  }

  try {
    return trimTrailingSlash(new URL(configured).toString());
  } catch {
    return trimTrailingSlash(configured);
  }
};

const getRuntimeMediaBase = (): string => {
  const basePath = normalizeBasePath(import.meta.env.BASE_URL ?? '/');

  if (typeof window === 'undefined') {
    return trimTrailingSlash(basePath);
  }

  return trimTrailingSlash(new URL(basePath, window.location.origin).toString());
};

const getMediaBase = (): string => getConfiguredMediaBase() || getRuntimeMediaBase();

export const resolveMediaUrl = (value: string): string => {
  const source = value.trim();
  if (!source || ABSOLUTE_URL_PATTERN.test(source) || SPECIAL_URI_PATTERN.test(source)) {
    return source;
  }

  const mediaBase = getMediaBase();
  const cleanPath = source.replace(/^\/+/, '');

  try {
    return new URL(cleanPath, `${mediaBase}/`).toString();
  } catch {
    return `${mediaBase}/${cleanPath}`;
  }
};

export const getMediaCandidates = (value: string): string[] => {
  const source = value.trim();
  const primary = resolveMediaUrl(source);
  const fallbackCandidates = [
    ...(MEDIA_FALLBACKS[source] ?? []),
    ...(MEDIA_FALLBACKS[primary] ?? []),
  ].map(resolveMediaUrl);

  const uniqueCandidates = new Set<string>([primary, ...fallbackCandidates].filter(Boolean));
  return Array.from(uniqueCandidates);
};
