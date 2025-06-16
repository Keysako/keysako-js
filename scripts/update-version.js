/**
 * Script pour mettre à jour la version de tous les packages
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

// Define __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get version from command line arguments
const version = process.argv[2];

if (!version) {
  console.log('Usage: node scripts/update-version.js 1.2.3');
  process.exit(1);
}

// Validate version format (semver)
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  console.error('❌ Invalid version format. Use semver format like 1.2.3');
  process.exit(1);
}

console.log(`🚀 Releasing version ${version}...`);

try {
  // Function to update package.json version
  async function updatePackageVersion(packagePath) {
    const fullPath = path.resolve(__dirname, '..', packagePath);

    if (!(await fs.promises.stat(fullPath).catch(() => false))) {
      console.log(`⚠️  Package not found: ${packagePath}`);
      return;
    }

    const packageJsonContent = await fs.promises.readFile(fullPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    packageJson.version = version;

    // Update @keysako/core dependency version if it exists
    if (packageJson.dependencies && packageJson.dependencies['@keysako/core']) {
      packageJson.dependencies['@keysako/core'] = `^${version}`;
    }
    if (packageJson.devDependencies && packageJson.devDependencies['@keysako/core']) {
      packageJson.devDependencies['@keysako/core'] = `^${version}`;
    }
    if (packageJson.peerDependencies && packageJson.peerDependencies['@keysako/core']) {
      packageJson.peerDependencies['@keysako/core'] = `^${version}`;
    }

    await fs.promises.writeFile(fullPath, JSON.stringify(packageJson, null, 2) + '\n');
    console.log(`✅ Updated ${packagePath}`);
  }

  // Update root package.json
  await updatePackageVersion('package.json');

  // Update all packages in packages/ directory
  const packagesDir = path.resolve(__dirname, '..', 'packages');
  if (await fs.promises.stat(packagesDir).catch(() => false)) {
    const packageDirs = await fs.promises.readdir(packagesDir);
    const packages = [];

    for (const dir of packageDirs) {
      const packagePath = path.join(packagesDir, dir);
      const stat = await fs.promises.stat(packagePath).catch(() => null);
      const packageJsonPath = path.join(packagePath, 'package.json');
      const hasPackageJson = await fs.promises.stat(packageJsonPath).catch(() => false);

      if (stat && stat.isDirectory() && hasPackageJson) {
        packages.push(dir);
      }
    }

    for (const pkg of packages) {
      await updatePackageVersion(`packages/${pkg}/package.json`);
    }
  }

  // Build and test
  console.log('📦 Building packages...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('🧪 Running tests...');
  execSync('npm test', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Error during release process:', error.message);
  process.exit(1);
}
