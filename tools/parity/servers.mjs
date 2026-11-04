/**
 * Starts version-a (production build, `next start`) and version-b (`php artisan serve`) unless they
 * are already listening, and stops the ones it started.
 *
 *   A_URL (default http://localhost:3000)   B_URL (default http://127.0.0.1:8000)
 *   PHP_BINARY (default "php")              — path to php if it is not on PATH
 */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');

export const A_URL = process.env.A_URL ?? 'http://localhost:3000';
export const B_URL = process.env.B_URL ?? 'http://127.0.0.1:8000';

async function isUp(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(2000) });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitUntilUp(url, name, timeoutMs = 90_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isUp(url)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`${name} did not answer at ${url} within ${timeoutMs / 1000}s`);
}

/** One quoted command line (npx and php are .cmd/.bat shims on Windows, which need a shell). */
function start(command, args, cwd) {
  const line = [command, ...args].map((part) => (/\s/.test(part) ? `"${part}"` : part)).join(' ');
  return spawn(line, { cwd, stdio: 'ignore', shell: true, windowsHide: true });
}

/** Returns a function that stops whatever was started here. */
export async function ensureServers() {
  const started = [];

  if (!(await isUp(A_URL))) {
    const versionA = join(ROOT, 'version-a');
    if (!existsSync(join(versionA, '.next', 'BUILD_ID'))) {
      throw new Error('version-a has no production build: run `npm run build` in version-a first.');
    }
    const port = new URL(A_URL).port || '3000';
    started.push(start('npx', ['next', 'start', '-p', port], versionA));
    await waitUntilUp(A_URL, 'version-a');
  }

  if (!(await isUp(B_URL))) {
    const versionB = join(ROOT, 'version-b');
    if (!existsSync(join(versionB, 'public', 'build', 'rev-manifest.json'))) {
      throw new Error('version-b has no front-end build: run `npm run build` in version-b first.');
    }
    const { hostname, port } = new URL(B_URL);
    started.push(start(process.env.PHP_BINARY ?? 'php', ['artisan', 'serve', `--host=${hostname}`, `--port=${port || '8000'}`], versionB));
    await waitUntilUp(B_URL, 'version-b');
  }

  return () => {
    for (const child of started) {
      if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
      else child.kill();
    }
  };
}
