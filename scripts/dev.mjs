import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'npm.cmd' : 'npm';

const apiProcess = spawn(process.execPath, ['server/chat-server.mjs'], {
  stdio: 'inherit',
  env: process.env
});

const webProcess = spawn(`${npmCommand} run dev:web`, {
  stdio: 'inherit',
  env: process.env,
  shell: true
});

const shutdown = (code = 0) => {
  if (!apiProcess.killed) {
    apiProcess.kill();
  }
  if (!webProcess.killed) {
    webProcess.kill();
  }
  process.exit(code);
};

apiProcess.on('exit', (code) => {
  if (code && code !== 0) {
    shutdown(code);
  }
});

webProcess.on('exit', (code) => {
  shutdown(code || 0);
});

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
