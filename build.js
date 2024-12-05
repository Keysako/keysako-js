const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { minify } = require('terser');
const { promisify } = require('util');
const { execSync } = require('child_process');

// Convert fs functions to promises
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);
const exists = promisify(fs.exists);

async function calculateHash(content) {
    const hash = crypto.createHash('sha384');
    hash.update(content);
    return hash.digest('base64');
}

async function exportGithubEnv(name, value) {
    const envFile = process.env.GITHUB_ENV;
    if (envFile) {
        await writeFile(envFile, `${name}=${value}\n`, { flag: 'a' });
    }
}

async function writeFiles(code, sourceMap, type, version, majorVersion) {
    const ext = type === 'esm' ? '.esm.js' : '.min.js';
    const versionedDir = path.join(__dirname, 'dist', `v${majorVersion}`);
    
    // Ensure versioned directory exists
    await mkdir(versionedDir, { recursive: true });

    const versionedFile = path.join(versionedDir, `keysako-connect-${version}${ext}`);
    const latestFile = path.join(versionedDir, `keysako-connect${ext}`);
    
    await writeFile(versionedFile, code);
    await writeFile(latestFile, code);

    if (sourceMap) {
        await writeFile(`${versionedFile}.map`, JSON.stringify(sourceMap));
        await writeFile(`${latestFile}.map`, JSON.stringify(sourceMap));
    }

    return versionedDir;
}

async function generateChecksums(versionedDir, version) {
    const files = [
        `keysako-connect-${version}.min.js`,
        `keysako-connect-${version}.esm.js`,
        'keysako-connect.min.js',
        'keysako-connect.esm.js'
    ];

    const checksums = await Promise.all(
        files.map(async (file) => {
            const filePath = path.join(versionedDir, file);
            if (await exists(filePath)) {
                const content = await readFile(filePath);
                const hash = await calculateHash(content);
                return `${file} sha384-${hash}`;
            }
            return null;
        })
    );

    const validChecksums = checksums.filter(Boolean);
    const checksumsContent = validChecksums.join('\n');
    await writeFile(path.join(versionedDir, 'checksums.txt'), checksumsContent);
    return checksumsContent;
}

async function build() {
    try {
        // Create dist directory
        await mkdir(path.join(__dirname, 'dist'), { recursive: true });

        // Get version from package.json
        const packageJson = JSON.parse(
            await readFile(path.join(__dirname, 'package.json'), 'utf8')
        );
        const version = process.env.VERSION || packageJson.version;
        const majorVersion = version.split('.')[0];

        // Compile TypeScript
        console.log('Compiling TypeScript...');
        execSync('npm run build:ts', { stdio: 'inherit' });

        // Read compiled JS file
        const inputFile = path.join(__dirname, 'dist', 'index.js');
        const code = await readFile(inputFile, 'utf8');

        console.log('Creating UMD build...');
        // Minify with Terser for UMD build
        const minified = await minify(code, {
            sourceMap: {
                filename: `keysako-connect-${version}.min.js`,
                url: `keysako-connect-${version}.min.js.map`
            },
            format: {
                comments: false
            }
        });

        // Write UMD files
        const versionedDir = await writeFiles(minified.code, minified.map, 'umd', version, majorVersion);

        // Calculate hash for the minified file
        const cdnHash = await calculateHash(minified.code);

        console.log('Creating ESM build...');
        // Create ESM build
        const esmMinified = await minify(code, {
            sourceMap: {
                filename: `keysako-connect-${version}.esm.js`,
                url: `keysako-connect-${version}.esm.js.map`
            },
            module: true,
            format: {
                comments: false
            }
        });

        // Write ESM files
        await writeFiles(esmMinified.code, esmMinified.map, 'esm', version, majorVersion);

        console.log('Generating checksums...');
        // Generate and write checksums
        const checksums = await generateChecksums(versionedDir, version);

        // Export variables for GitHub Actions
        await exportGithubEnv('CDN_HASH', cdnHash);
        await exportGithubEnv('CHECKSUMS', checksums);
        await exportGithubEnv('VERSION', version);
        await exportGithubEnv('MAJOR_VERSION', majorVersion);

        // Copy and process index.html
        console.log('Processing index.html...');
        const htmlContent = await readFile(path.join(__dirname, 'src', 'index.html'), 'utf8');
        const processedHtml = htmlContent
            .replace(/\{\{\s*env\.CDN_HASH\s*\}\}/g, cdnHash)
            .replace(/\{\{\s*env\.VERSION\s*\}\}/g, version)
            .replace(/\{\{\s*env\.MAJOR_VERSION\s*\}\}/g, majorVersion);

        await writeFile(path.join(__dirname, 'dist', 'index.html'), processedHtml);

        // Copy and process configurator.html
        console.log('Processing configurator.html...');
        const configContent = await readFile(path.join(__dirname, 'configurator.html'), 'utf8');
        const processedConfig = configContent
            .replace(/\{\{\s*env\.CDN_HASH\s*\}\}/g, cdnHash)
            .replace(/\{\{\s*env\.VERSION\s*\}\}/g, version)
            .replace(/\{\{\s*env\.MAJOR_VERSION\s*\}\}/g, majorVersion);

        await writeFile(path.join(__dirname, 'dist', 'configurator.html'), processedConfig);

        console.log('Build completed successfully');
        console.log('Version:', version);
        console.log('Major Version:', majorVersion);
        console.log('CDN Hash:', cdnHash);
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
