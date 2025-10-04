#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs/promises';
import path from 'path';
import { CompatGuardLinter } from '@compatguard/core';

const program = new Command();
program.name('compatguard').version('1.0.0');

program.command('lint <paths...>')
  .option('-b, --baseline <year>', 'Target baseline', '2024')
  .option('--fix', 'Attempt auto-fix', false)
  .description('Lint files for Baseline compatibility')
  .action(async (paths, opts) => {
    console.log('🔍 CompatGuard CLI - lint', paths, opts);
    const linter = new CompatGuardLinter(opts.baseline);
    await linter.initialize();
    // naive expansion: treat paths as file globs (not implemented)
    for (const p of paths) {
      try {
        const content = await fs.readFile(p, 'utf-8');
        const res = await linter.lintCode(content, 'javascript', {});
        console.log(`Results for ${p}:`, res.diagnostics.length, 'diagnostics');
      } catch (e: unknown) {
        if (e instanceof Error) {
          console.warn("Skipping", p, e.message);
        } else {
          console.warn("Skipping", p, e);
        }
      }
    }
  });

program.command('init').description('Write example .compatguardrc.json').action(async () => {
  const cfg = { targetBaseline: '2024', frameworks: ['react','vue','svelte'] };
  await fs.writeFile(path.resolve('.compatguardrc.json'), JSON.stringify(cfg, null, 2));
  console.log('Wrote .compatguardrc.json');
});

program.parse(process.argv);
