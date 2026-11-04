#!/usr/bin/env node
/**
 * Runs Lighthouse N times (mobile and desktop) against a URL and keeps the median run, as docs/AUDIT.md
 * did for version-a. Also summarises the network: requests and transfer size by resource type.
 *
 *   node lighthouse.mjs <url> <out-dir> <prefix> [runs=3]
 *   → <out-dir>/<prefix>-{mobile,desktop}.report.{html,json} (median run) and <prefix>-{mobile,desktop}-median.json
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [url, outDir, prefix, runsArg] = process.argv.slice(2);
const RUNS = Number(runsArg ?? 3);
mkdirSync(outDir, { recursive: true });

const summarise = (lhr) => {
  const audit = (id) => lhr.audits[id];
  const items = audit('network-requests').details.items;
  const byType = {};
  for (const item of items) {
    const type = item.resourceType ?? 'Other';
    byType[type] ??= { requests: 0, transferKiB: 0, resourceKiB: 0 };
    byType[type].requests += 1;
    byType[type].transferKiB += (item.transferSize ?? 0) / 1024;
    byType[type].resourceKiB += (item.resourceSize ?? 0) / 1024;
  }
  for (const type of Object.values(byType)) {
    type.transferKiB = Number(type.transferKiB.toFixed(1));
    type.resourceKiB = Number(type.resourceKiB.toFixed(1));
  }
  return {
    scores: Object.fromEntries(Object.entries(lhr.categories).map(([k, c]) => [k, Math.round(c.score * 100)])),
    lcpMs: Math.round(audit('largest-contentful-paint').numericValue),
    fcpMs: Math.round(audit('first-contentful-paint').numericValue),
    cls: Number(audit('cumulative-layout-shift').numericValue.toFixed(3)),
    tbtMs: Math.round(audit('total-blocking-time').numericValue),
    siMs: Math.round(audit('speed-index').numericValue),
    totalKiB: Number((audit('total-byte-weight').numericValue / 1024).toFixed(1)),
    requests: items.length,
    byType,
    lcpElement: audit('largest-contentful-paint-element')?.details?.items?.[0]?.items?.[0]?.node?.snippet ?? null,
    renderBlocking: (audit('render-blocking-resources')?.details?.items ?? audit('render-blocking-insight')?.details?.items ?? []).map((i) => i.url),
    failedAudits: Object.values(lhr.audits)
      .filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicable')
      .map((a) => `${a.id} (${a.score})`),
  };
};

for (const form of ['mobile', 'desktop']) {
  const runs = [];
  for (let i = 1; i <= RUNS; i += 1) {
    const base = join(outDir, `${prefix}-${form}-run${i}`);
    const flags = ['--yes', 'lighthouse@13.6.0', url, '--quiet', '--output=json', '--output=html', `--output-path=${base}`, '--chrome-flags=--headless=new'];
    if (form === 'desktop') flags.push('--preset=desktop');
    execFileSync('npx', flags, { stdio: 'inherit', shell: true });
    const lhr = JSON.parse(readFileSync(`${base}.report.json`, 'utf8'));
    runs.push({ base, summary: summarise(lhr) });
    console.log(`${form} run ${i}: perf ${runs.at(-1).summary.scores.performance} · LCP ${runs.at(-1).summary.lcpMs} ms`);
  }
  // Median by LCP (then performance score), as in version-a's audit.
  const sorted = [...runs].sort((a, b) => a.summary.lcpMs - b.summary.lcpMs);
  const median = sorted[Math.floor(sorted.length / 2)];
  for (const ext of ['json', 'html']) renameSync(`${median.base}.report.${ext}`, join(outDir, `${prefix}-${form}.report.${ext}`));
  for (const run of runs) for (const ext of ['json', 'html']) rmSync(`${run.base}.report.${ext}`, { force: true });
  writeFileSync(join(outDir, `${prefix}-${form}-median.json`), `${JSON.stringify({ url, runs: runs.map((r) => r.summary), median: median.summary }, null, 2)}\n`);
  console.log(`${form} median →`, JSON.stringify(median.summary, null, 1));
}
