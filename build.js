const { minify } = require('terser');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

async function calculateHash(content) {
    const hash = crypto.createHash('sha384');
    hash.update(content);
    return hash.digest('base64');
}

async function generateChecksums(files) {
    let checksums = '';
    for (const [filename, content] of Object.entries(files)) {
        const hash = await calculateHash(content);
        checksums += `${hash}  ${filename}\n`;
    }
    return checksums;
}

async function exportGithubEnv(name, value) {
    // Si on est dans GitHub Actions
    if (process.env.GITHUB_ENV) {
        // Échapper les caractères spéciaux pour GitHub Actions
        const escapedValue = value.replace(/[|&;$%@"<>()+,]/g, '\\$&');
        await fs.appendFile(process.env.GITHUB_ENV, `${name}<<EOF\n${escapedValue}EOF\n`);
    }
}

async function build() {
    try {
        // Read the compiled JS file
        const inputFile = path.join(__dirname, 'dist', 'index.js');
        const code = await fs.readFile(inputFile, 'utf8');

        const files = {};

        // Minify with Terser for UMD build
        const minified = await minify(code, {
            compress: {
                dead_code: true,
                drop_console: true,
                drop_debugger: true,
                passes: 2
            },
            mangle: true,
            format: {
                comments: false,
                ecma: 2015
            },
            sourceMap: {
                filename: "keysako-connect.min.js",
                url: "keysako-connect.min.js.map"
            }
        });

        // Write minified UMD file
        const outputFile = path.join(__dirname, 'dist', 'keysako-connect.min.js');
        await fs.writeFile(outputFile, minified.code);
        files['keysako-connect.min.js'] = minified.code;

        // Write source map if generated
        if (minified.map) {
            const mapFile = path.join(__dirname, 'dist', 'keysako-connect.min.js.map');
            await fs.writeFile(mapFile, minified.map);
            files['keysako-connect.min.js.map'] = minified.map;
        }

        // Create ESM build
        const esmMinified = await minify(code, {
            compress: {
                dead_code: true,
                drop_console: true,
                drop_debugger: true,
                passes: 2
            },
            mangle: true,
            format: {
                comments: false,
                ecma: 2015
            },
            sourceMap: {
                filename: "keysako-connect.esm.js",
                url: "keysako-connect.esm.js.map"
            }
        });

        // Write ESM file
        const esmOutputFile = path.join(__dirname, 'dist', 'keysako-connect.esm.js');
        await fs.writeFile(esmOutputFile, esmMinified.code);
        files['keysako-connect.esm.js'] = esmMinified.code;

        // Write ESM source map if generated
        if (esmMinified.map) {
            const esmMapFile = path.join(__dirname, 'dist', 'keysako-connect.esm.js.map');
            await fs.writeFile(esmMapFile, esmMinified.map);
            files['keysako-connect.esm.js.map'] = esmMinified.map;
        }

        // Generate and write checksums
        const checksums = await generateChecksums(files);
        await fs.writeFile(path.join(__dirname, 'dist', 'checksums.txt'), checksums);

        // Calculate CDN hash
        const cdnHash = await calculateHash(minified.code);

        // Update README with the hash for CDN
        const readmePath = path.join(__dirname, 'README.md');
        const readme = await fs.readFile(readmePath, 'utf8');
        const updatedReadme = readme.replace(/sha384-[a-zA-Z0-9+/=]+/g, `sha384-${cdnHash}`);
        await fs.writeFile(readmePath, updatedReadme);

        // Export variables for GitHub Actions
        await exportGithubEnv('CDN_HASH', cdnHash);
        await exportGithubEnv('CHECKSUMS', checksums);

        console.log('Build completed successfully!');
        console.log('\nFile integrity hashes:');
        console.log(checksums);
        
        // Log size comparison
        const originalSize = Buffer.byteLength(code, 'utf8');
        const minifiedSize = Buffer.byteLength(minified.code, 'utf8');
        const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`\nOriginal size: ${(originalSize / 1024).toFixed(1)} KB`);
        console.log(`Minified size: ${(minifiedSize / 1024).toFixed(1)} KB`);
        console.log(`Reduction: ${reduction}%`);
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
