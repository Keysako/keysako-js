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
    const versionedDir = path.join(__dirname, '..', 'dist', `v${majorVersion}`);
    
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

    const checksums = [];
    for (const file of files) {
        const filePath = path.join(versionedDir, file);
        if (await exists(filePath)) {
            const content = await readFile(filePath);
            const hash = await calculateHash(content);
            checksums.push(`${file} sha384-${hash}`);
        }
    }

    await writeFile(path.join(versionedDir, 'checksums.txt'), checksums.join('\n'));
}

async function build() {
    try {
        // Create dist directory
        await mkdir(path.join(__dirname, '..', 'dist'), { recursive: true });

        // Get version from package.json
        const packageJson = JSON.parse(
            await readFile(path.join(__dirname, '..', 'package.json'), 'utf8')
        );
        const version = process.env.VERSION || packageJson.version;
        const majorVersion = version.split('.')[0];

        // Compile TypeScript
        console.log('Compiling TypeScript...');
        execSync('npm run build:ts', { stdio: 'inherit', cwd: path.join(__dirname, '..') });

        // Read compiled JS file from the core package
        const inputFile = path.join(__dirname, '..', 'packages', 'core', 'dist', 'index.js');
        
        // Check if file exists
        if (!fs.existsSync(inputFile)) {
            throw new Error(`Core package compiled file not found: ${inputFile}`);
        }
        
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
            },
            toplevel: false,
            compress: {
                toplevel: false
            },
            mangle: {
                toplevel: false
            },
            nameCache: null,
            ie8: false,
            keep_classnames: true,
            keep_fnames: true,
            safari10: false
        });

        // Ajouter un wrapper UMD pour exposer KeysakoIdentity comme objet global
        const umdCode = `
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.KeysakoIdentity = {}));
})(this, (function (exports) { 'use strict';
    ${minified.code.replace(/export\s*\{[^}]*\};?/g, '')}
    
    // Exposer les classes et fonctions
    exports.KeysakoButton = KeysakoButton;
    exports.TokenManager = TokenManager;
    exports.IdentityProvider = IdentityProvider;
    exports.logoSvg = logoSvg;
    exports.parseJwt = parseJwt;
    exports.isMobileDevice = isMobileDevice;
    
    Object.defineProperty(exports, '__esModule', { value: true });
}));`;

        // Write UMD files
        const versionedDir = await writeFiles(umdCode, minified.map, 'umd', version, majorVersion);

        // Calculate hash for the minified file
        const cdnHash = await calculateHash(umdCode);

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
            },
            keep_classnames: true,
            keep_fnames: true
        });

        // Ajouter les exports explicites pour le fichier ESM
        const esmCode = `${esmMinified.code.replace(/export\s*\{[^}]*\};?/g, '')}

// Exports explicites
export { KeysakoButton, TokenManager, IdentityProvider, logoSvg, parseJwt, isMobileDevice };`;

        // Write ESM files
        await writeFiles(esmCode, esmMinified.map, 'esm', version, majorVersion);

        console.log('Generating checksums...');
        // Generate and write checksums
        await generateChecksums(versionedDir, version);

        // Export variables for GitHub Actions
        await exportGithubEnv('CDN_HASH', cdnHash);
        await exportGithubEnv('VERSION', version);
        await exportGithubEnv('MAJOR_VERSION', majorVersion);

        // Skip HTML processing as the files have been moved to packages
        console.log('Skipping HTML processing as files have been moved to packages structure');

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
