// scripts/generate-icons.js
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tailles d'icônes à générer
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Chemin vers votre logo source
const sourceImage = path.join(__dirname, '..', 'logo.png');

// Dossier de destination
const outputDir = path.join(__dirname, '..', 'public', 'icons');

console.log('🚀 Démarrage de la génération des icônes...');
console.log(`📁 Logo source: ${sourceImage}`);
console.log(`📁 Dossier destination: ${outputDir}`);

// Vérifier si le dossier source existe
if (!fs.existsSync(sourceImage)) {
  console.error('❌ Logo source non trouvé !');
  console.log(`📁 Veuillez placer votre logo à : ${sourceImage}`);
  console.log('📝 Ou exécutez d\'abord : npm run create-logo');
  process.exit(1);
}

// Créer le dossier de destination s'il n'existe pas
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`📁 Dossier créé : ${outputDir}`);
}

console.log('🎨 Génération des icônes GROUP BUROK EMPIRE...');

// Fonction principale
async function generateIcons() {
  try {
    // Vérifier que sharp est disponible
    console.log('📦 Vérification de sharp...');
    const image = sharp(sourceImage);
    const metadata = await image.metadata();
    console.log(`📐 Image source: ${metadata.width}x${metadata.height}`);

    // Générer chaque icône
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      console.log(`🔄 Génération de l'icône ${size}x${size}...`);
      
      await image
        .clone()
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({
          quality: 90,
          compressionLevel: 9
        })
        .toFile(outputPath);
      
      console.log(`✅ Icon ${size}x${size} générée`);
    }
    
    console.log('✨ Génération terminée avec succès !');
    console.log(`📁 Icons disponibles dans: ${outputDir}`);
  } catch (error) {
    console.error('❌ Erreur lors de la génération:', error.message);
    console.error('📝 Détails:', error.stack);
    process.exit(1);
  }
}

// Exécuter la génération
generateIcons();