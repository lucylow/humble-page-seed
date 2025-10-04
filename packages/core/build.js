import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
const pkg = path.basename(process.cwd());
console.log(`Building package: ${pkg} (stub)`);
// Simple copy of src to dist
const src = path.resolve('src');
const dist = path.resolve('dist');
try {
  if (fs.existsSync(dist)) { fs.rmSync(dist, { recursive: true }); }
  fs.mkdirSync(dist);
  if (fs.existsSync(src)) {
    // copy files
    const files = fs.readdirSync(src);
    for (const file of files) {
      const s = path.join(src, file);
      const d = path.join(dist, file);
      fs.copyFileSync(s, d);
    }
  } else {
    fs.writeFileSync(path.join(dist, 'index.js'), '// no src files\n');
  }
  console.log('Done.');
} catch (e) {
  console.error('Build failed (stub)', e);
  process.exit(1);
}
