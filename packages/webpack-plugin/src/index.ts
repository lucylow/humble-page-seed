import { CompatGuardLinter } from '@compatguard/core';
import { Compiler } from 'webpack';

interface CompatGuardWebpackPluginOptions {
  targetBaseline?: string;
  // Add other options as needed
}

export class CompatGuardWebpackPlugin {
  private opts: CompatGuardWebpackPluginOptions;
  private linter: CompatGuardLinter;

  constructor(opts: CompatGuardWebpackPluginOptions = {}) {
    this.opts = opts;
    this.linter = new CompatGuardLinter(opts.targetBaseline || '2024');
  }

  apply(compiler: Compiler) {
    compiler.hooks.done.tap('CompatGuardWebpackPlugin', async () => {
      await this.linter.initialize();
      console.log('CompatGuardWebpackPlugin ran (stub).');
    });
  }
}

export default CompatGuardWebpackPlugin;

