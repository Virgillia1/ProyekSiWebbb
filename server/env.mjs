import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const envFiles = [
  path.join(rootDir, '.env.local'),
  path.join(rootDir, 'src', '.env.local'),
  path.join(rootDir, '.env'),
  path.join(rootDir, 'src', '.env'),
];

const parseEnvLine = (line) => {
  const trimmed = line.trim();

  if (!trimmed || trimmed.startsWith('#')) {
    return null;
  }

  const separatorIndex = trimmed.indexOf('=');

  if (separatorIndex === -1) {
    return null;
  }

  const key = trimmed.slice(0, separatorIndex).trim();
  let value = trimmed.slice(separatorIndex + 1).trim();

  if (!key) {
    return null;
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
};

export const loadProjectEnv = () => {
  for (const envFile of envFiles) {
    if (!fs.existsSync(envFile)) {
      continue;
    }

    const content = fs.readFileSync(envFile, 'utf8');

    for (const line of content.split(/\r?\n/)) {
      const parsed = parseEnvLine(line);

      if (!parsed || process.env[parsed.key]) {
        continue;
      }

      process.env[parsed.key] = parsed.value;
    }
  }
};

export const getDatabaseUrl = () =>
  process.env.DATABASE_URL ?? null;

export { rootDir };
