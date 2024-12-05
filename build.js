const { minify } = require('terser');
const fs = require('fs').promises;
const path = require('path');

async function build() {
    try {
        // Read the compiled JS file
        const inputFile = path.join(__dirname, 'dist', 'index.js');
        const code = await fs.readFile(inputFile, 'utf8');

        // Minify with Terser
        const minified = await minify(code, {
            compress: {
                dead_code: true,
                drop_console: true,
                drop_debugger: true,
                passes: 2,
                keep_fnames: true,
                keep_classnames: true
            },
            mangle: {
                keep_classnames: true,
                keep_fnames: true
            },
            format: {
                comments: false
            },
            module: true,
            sourceMap: {
                filename: "keysako-connect.min.js",
                url: "keysako-connect.min.js.map"
            }
        });

        // Write minified file
        const outputFile = path.join(__dirname, 'dist', 'keysako-connect.min.js');
        await fs.writeFile(outputFile, minified.code);

        // Write source map if generated
        if (minified.map) {
            const mapFile = path.join(__dirname, 'dist', 'keysako-connect.min.js.map');
            await fs.writeFile(mapFile, minified.map);
        }

        console.log('Build completed successfully!');
        
        // Log size comparison
        const originalSize = Buffer.byteLength(code, 'utf8');
        const minifiedSize = Buffer.byteLength(minified.code, 'utf8');
        const reduction = ((originalSize - minifiedSize) / originalSize * 100).toFixed(1);
        
        console.log(`Original size: ${(originalSize / 1024).toFixed(1)} KB`);
        console.log(`Minified size: ${(minifiedSize / 1024).toFixed(1)} KB`);
        console.log(`Reduction: ${reduction}%`);
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
