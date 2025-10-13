/**
 * Build Verification Script for BitMind
 * Checks if the build output is correct for deployment
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

console.log('🔍 Verifying BitMind build output...\n');

let errors = 0;
let warnings = 0;

// Check 1: dist folder exists
if (!existsSync('./dist')) {
  console.error('❌ dist/ folder not found. Run "npm run build" first.');
  errors++;
} else {
  console.log('✅ dist/ folder exists');
}

// Check 2: index.html exists
const indexPath = './dist/index.html';
if (!existsSync(indexPath)) {
  console.error('❌ dist/index.html not found');
  errors++;
} else {
  console.log('✅ dist/index.html exists');
  
  // Check index.html content
  const indexContent = readFileSync(indexPath, 'utf-8');
  if (!indexContent.includes('id="root"')) {
    console.error('❌ index.html missing root div');
    errors++;
  } else {
    console.log('✅ index.html has root div');
  }
  
  if (!indexContent.includes('BitMind')) {
    console.warn('⚠️  index.html missing BitMind title');
    warnings++;
  }
}

// Check 3: assets folder exists
const assetsPath = './dist/assets';
if (!existsSync(assetsPath)) {
  console.error('❌ dist/assets/ folder not found');
  errors++;
} else {
  console.log('✅ dist/assets/ folder exists');
  
  // Count files
  const files = readdirSync(assetsPath);
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));
  
  console.log(`   📦 ${jsFiles.length} JavaScript files`);
  console.log(`   🎨 ${cssFiles.length} CSS files`);
  
  if (jsFiles.length === 0) {
    console.error('❌ No JavaScript files in dist/assets/');
    errors++;
  }
  
  if (cssFiles.length === 0) {
    console.warn('⚠️  No CSS files in dist/assets/');
    warnings++;
  }
}

// Check 4: Calculate total size
if (existsSync('./dist')) {
  const getDirectorySize = (dir) => {
    let size = 0;
    const files = readdirSync(dir);
    
    for (const file of files) {
      const filePath = join(dir, file);
      const stats = statSync(filePath);
      
      if (stats.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        size += stats.size;
      }
    }
    
    return size;
  };
  
  const totalSize = getDirectorySize('./dist');
  const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
  console.log(`\n📊 Total build size: ${sizeMB} MB`);
  
  if (totalSize > 50 * 1024 * 1024) {
    console.warn('⚠️  Build size is large (>50MB), consider optimization');
    warnings++;
  }
}

// Check 5: Backend build (optional)
if (existsSync('./dist/api')) {
  console.log('\n🔧 Backend files found:');
  console.log('✅ dist/api/ exists');
  
  if (existsSync('./dist/api/server.js')) {
    console.log('✅ dist/api/server.js exists');
  } else {
    console.warn('⚠️  dist/api/server.js not found (backend might use different entry)');
    warnings++;
  }
  
  if (existsSync('./dist/api/package.json')) {
    console.log('✅ dist/api/package.json exists');
  }
} else {
  console.log('\n💡 Backend not included in build (frontend-only)');
}

// Summary
console.log('\n' + '='.repeat(50));
if (errors === 0 && warnings === 0) {
  console.log('✅ Build verification passed! Ready to deploy.');
  console.log('\n📤 Deploy the "dist" folder to Lovable');
} else if (errors === 0) {
  console.log(`⚠️  Build verification passed with ${warnings} warning(s)`);
  console.log('You can still deploy, but check the warnings above.');
} else {
  console.log(`❌ Build verification failed with ${errors} error(s)`);
  console.log('Fix the errors before deploying.');
  process.exit(1);
}
console.log('='.repeat(50));

