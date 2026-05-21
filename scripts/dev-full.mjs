import fs from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const userAgent = process.env.npm_config_user_agent ?? '';
const packageManager =
  userAgent.startsWith('pnpm/') || fs.existsSync(path.join(rootDir, 'pnpm-lock.yaml'))
    ? 'pnpm'
    : 'npm';

const buildScriptCommand = (scriptName) =>
  packageManager === 'pnpm' ? `pnpm ${scriptName}` : `npm run ${scriptName}`;

const startProcess = (command) =>
  spawn(command, {
    stdio: 'inherit',
    shell: true,
  });

const processes = [startProcess(buildScriptCommand('api:dev')), startProcess(buildScriptCommand('dev'))];
let isShuttingDown = false;

const stopAll = (signal = 'SIGTERM') => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  for (const child of processes) {
    if (!child.killed) {
      child.kill(signal);
    }
  }
};

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => stopAll(signal));
}

for (const child of processes) {
  child.on('exit', (code) => {
    if (isShuttingDown) {
      return;
    }

    stopAll();
    process.exit(code ?? 0);
  });
}
