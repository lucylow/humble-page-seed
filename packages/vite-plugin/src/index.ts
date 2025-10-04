import { CompatGuardLinter } from '@compatguard/core';

interface CompatGuardVitePluginOptions {
  targetBaseline?: string;
  // Add other options as needed
}

export default function compatGuardVitePlugin(opts: CompatGuardVitePluginOptions = {}) {
  const linter = new CompatGuardLinter(opts.targetBaseline || '2024');
  return {
    name: 'compatguard-vite',
    async configResolved() { await linter.initialize(); console.log('compatguard vite plugin initialized (stub)'); }
  };
}

