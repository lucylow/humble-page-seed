import { cpSync, existsSync, mkdirSync, rmSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, '..');
const backendDistSrc = join(rootDir, 'backend', 'dist');
const frontendDistDest = join(rootDir, 'dist', 'api');
const frontendDist = join(rootDir, 'dist');

console.log('📦 Copying backend build to frontend dist...');
console.log('   Backend source:', backendDistSrc);
console.log('   Frontend dest:', frontendDistDest);

// Check if frontend dist exists
if (!existsSync(frontendDist)) {
  console.error('❌ Frontend dist folder not found. Run build first.');
  console.error('   Expected at:', frontendDist);
  process.exit(1);
}

// Check if backend dist exists
if (!existsSync(backendDistSrc)) {
  console.error('❌ Backend dist folder not found. Run backend:build first.');
  console.error('   Expected at:', backendDistSrc);
  process.exit(1);
}

// Clean up old api directory if it exists
if (existsSync(frontendDistDest)) {
  console.log('🧹 Cleaning old api directory...');
  rmSync(frontendDistDest, { recursive: true, force: true });
}

// Create the api directory in dist
mkdirSync(frontendDistDest, { recursive: true });

// Copy backend dist to frontend dist/api
try {
  cpSync(backendDistSrc, frontendDistDest, { recursive: true });
  console.log('✅ Backend files copied successfully to dist/api');
  
  // Also copy backend package.json for production dependencies
  const backendPackageJson = join(rootDir, 'backend', 'package.json');
  const destPackageJson = join(frontendDistDest, 'package.json');
  if (existsSync(backendPackageJson)) {
    cpSync(backendPackageJson, destPackageJson);
    console.log('✅ Backend package.json copied successfully');
  }
  
  // Copy prisma schema if it exists
  const prismaDir = join(rootDir, 'backend', 'prisma');
  const destPrismaDir = join(frontendDistDest, 'prisma');
  if (existsSync(prismaDir)) {
    cpSync(prismaDir, destPrismaDir, { recursive: true });
    console.log('✅ Prisma schema copied successfully');
  }
  
  console.log('');
  console.log('🎉 Unified build complete!');
  console.log('   Deploy the "dist" folder with both frontend and backend.');
  console.log('   Backend API available at: /api/*');
} catch (error) {
  console.error('❌ Error copying backend files:', error.message);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}

