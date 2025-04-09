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
let minJsSha384 = '';

filesToCopy.forEach(file => {
  const versionedFile = path.resolve(versionedDir, file.target);
  const latestFile = path.resolve(versionedDir, file.source);
  
  if (fs.existsSync(versionedFile)) {
    const fileContent = fs.readFileSync(versionedFile);
    const sha384 = crypto.createHash('sha384').update(fileContent).digest('base64');
    checksums += `${file.target} sha384-${sha384}\n`;
    
    // Stocker le hash SHA-384 du fichier minifié pour l'utiliser dans les templates
    if (file.source === 'keysako-connect.min.js') {
      minJsSha384 = sha384;
    }
  }
  
  if (fs.existsSync(latestFile)) {
    const fileContent = fs.readFileSync(latestFile);
    const sha384 = crypto.createHash('sha384').update(fileContent).digest('base64');
    checksums += `${file.source} sha384-${sha384}\n`;
  }
});

fs.writeFileSync(checksumFile, checksums);
console.log(`Checksums générés dans: ${checksumFile}`);

// Fonction pour gérer les templates HTML
function processTemplate(templateName, outputName) {
  // Lire le template
  let templateContent = '';
  const templatePath = path.resolve(__dirname, `../templates/${templateName}`);
  const templatesDir = path.resolve(__dirname, '../templates');
  
  // Si le répertoire templates n'existe pas, le créer
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
  }
  
  // Si le fichier template n'existe pas, copier le fichier actuel comme template
  if (!fs.existsSync(templatePath)) {
    const currentFilePath = path.resolve(__dirname, `../${templateName}`);
    if (fs.existsSync(currentFilePath)) {
      templateContent = fs.readFileSync(currentFilePath, 'utf8');
      
      // Remplacer les valeurs hardcodées par des placeholders
      templateContent = templateContent.replace(/https:\/\/cdn\.keysako\.com\/v\d+\/keysako-connect\.min\.js/g, 
        'https://cdn.keysako.com/v{{ MAJOR_VERSION }}/keysako-connect.min.js');
      templateContent = templateContent.replace(/<script type="module" src="https:\/\/cdn\.keysako\.com\/v\d+\/keysako-connect\.min\.js".*?><\/script>/g, 
        '<script type="module" src="https://cdn.keysako.com/v{{ MAJOR_VERSION }}/keysako-connect.min.js" integrity="sha384-{{ CDN_HASH }}" crossorigin="anonymous"></script>');
      
      fs.writeFileSync(templatePath, templateContent);
      console.log(`Template ${templateName} créé à partir du fichier existant`);
    } else {
      console.error(`Erreur: Le fichier ${templateName} n'existe pas à ${currentFilePath}`);
      return false;
    }
  } else {
    templateContent = fs.readFileSync(templatePath, 'utf8');
  }
  
  // Générer le fichier avec les valeurs actuelles
  let outputContent = templateContent;
  outputContent = outputContent.replace(/{{ MAJOR_VERSION }}/g, majorVersion);
  outputContent = outputContent.replace(/{{ CDN_HASH }}/g, minJsSha384);
  outputContent = outputContent.replace(/{{ VERSION }}/g, version);
  
  fs.writeFileSync(path.resolve(distDir, outputName), outputContent);
  console.log(`Fichier ${outputName} généré`);
  
  return true;
}

// Générer les fichiers HTML à partir des templates
processTemplate('index.html', 'index.html');
processTemplate('configurator.html', 'configurator.html');

console.log('Préparation CDN terminée avec succès!');
