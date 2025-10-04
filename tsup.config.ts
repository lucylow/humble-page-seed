import { defineConfig } from 'tsup';
import fs from 'fs';
import path from 'path';

const packagesDir = path.join(__dirname, 'packages');
const packages = fs.readdirSync(packagesDir).filter(name => {
  const pkgPath = path.join(packagesDir, name);
  return fs.statSync(pkgPath).isDirectory() && fs.existsSync(path.join(pkgPath, 'package.json'));
});

export default packages.map(pkg => {
  const pkgPath = path.join(packagesDir, pkg);
  const pkgJson = JSON.parse(fs.readFileSync(path.join(pkgPath, 'package.json'), 'utf8'));

  return defineConfig({
    entry: [path.join(pkgPath, 'src', 'index.ts')],
    outDir: path.join(pkgPath, 'dist'),
    format: ['cjs', 'esm'],
    splitting: false,
    sourcemap: true,
    clean: true,
    dts: true, // Generate .d.ts files
    external: Object.keys(pkgJson.dependencies || {}).concat(Object.keys(pkgJson.peerDependencies || {})),
  });
});

