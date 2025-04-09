/**
 * Script pour préparer les fichiers pour le déploiement CDN
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Obtenir la version depuis package.json
const packageJson = require('../package.json');
const version = packageJson.version;
const majorVersion = version.split('.')[0];

// Créer les répertoires de destination
const distDir = path.resolve(__dirname, '../dist');
const versionedDir = path.resolve(distDir, `v${majorVersion}`);

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

if (!fs.existsSync(versionedDir)) {
  fs.mkdirSync(versionedDir, { recursive: true });
}

// Copier les fichiers du package core
const coreDistDir = path.resolve(__dirname, '../packages/core/dist');
const filesToCopy = [
  { source: 'keysako-connect.js', target: `keysako-connect-${version}.js` },
  { source: 'keysako-connect.min.js', target: `keysako-connect-${version}.min.js` }
];

// Vérifier si les fichiers sources existent
let allFilesExist = true;
filesToCopy.forEach(file => {
  const sourceFile = path.resolve(coreDistDir, file.source);
  if (!fs.existsSync(sourceFile)) {
    console.error(`Erreur: Le fichier source ${sourceFile} n'existe pas`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  console.error('Certains fichiers sources n\'existent pas. Assurez-vous de compiler le package core avec "npm run build" dans le répertoire packages/core.');
  process.exit(1);
}

// Copier les fichiers avec version et sans version
filesToCopy.forEach(file => {
  const sourceFile = path.resolve(coreDistDir, file.source);
  
  // Copier avec le nom de version (pour l'archivage)
  const versionedFile = path.resolve(versionedDir, file.target);
  fs.copyFileSync(sourceFile, versionedFile);
  console.log(`Copié: ${file.source} -> ${file.target}`);
  
  // Copier avec le nom sans version (pour l'accès à la dernière version)
  const latestFile = path.resolve(versionedDir, file.source);
  fs.copyFileSync(sourceFile, latestFile);
  console.log(`Copié: ${file.source} -> ${file.source} (latest)`);
  
  // Copier les fichiers map s'ils existent
  const sourceMapFile = `${sourceFile}.map`;
  if (fs.existsSync(sourceMapFile)) {
    const versionedMapFile = `${versionedFile}.map`;
    fs.copyFileSync(sourceMapFile, versionedMapFile);
    console.log(`Copié: ${file.source}.map -> ${file.target}.map`);
    
    const latestMapFile = `${latestFile}.map`;
    fs.copyFileSync(sourceMapFile, latestMapFile);
    console.log(`Copié: ${file.source}.map -> ${file.source}.map (latest)`);
  }
});

// Générer les checksums pour les fichiers
const checksumFile = path.resolve(versionedDir, 'checksums.txt');
let checksums = '';

filesToCopy.forEach(file => {
  const versionedFile = path.resolve(versionedDir, file.target);
  const latestFile = path.resolve(versionedDir, file.source);
  
  if (fs.existsSync(versionedFile)) {
    const fileContent = fs.readFileSync(versionedFile);
    const sha384 = crypto.createHash('sha384').update(fileContent).digest('base64');
    checksums += `${file.target} sha384-${sha384}\n`;
  }
  
  if (fs.existsSync(latestFile)) {
    const fileContent = fs.readFileSync(latestFile);
    const sha384 = crypto.createHash('sha384').update(fileContent).digest('base64');
    checksums += `${file.source} sha384-${sha384}\n`;
  }
});

fs.writeFileSync(checksumFile, checksums);
console.log(`Checksums générés dans: ${checksumFile}`);

// Générer un fichier d'exemple HTML
const exampleHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Keysako Identity Example</title>
</head>
<body>
  <h1>Keysako Identity Example</h1>
  
  <div id="keysako-button-container"></div>
  
  <script src="./v${majorVersion}/keysako-connect.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      const container = document.getElementById('keysako-button-container');
      const button = KeysakoIdentity.createButton({
        clientId: 'your-client-id',
        redirectUri: window.location.origin,
        theme: 'light'
      });
      
      container.appendChild(button);
      
      button.addEventListener('success', function(event) {
        console.log('Authentication successful:', event.detail);
      });
      
      button.addEventListener('error', function(event) {
        console.error('Authentication failed:', event.detail);
      });
    });
  </script>
</body>
</html>`;

fs.writeFileSync(path.resolve(distDir, 'index.html'), exampleHtml);
console.log('Exemple HTML généré');

console.log('Préparation CDN terminée avec succès!');
