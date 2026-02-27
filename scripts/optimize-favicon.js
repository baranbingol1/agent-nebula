const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Determine paths
const frontendPublicDir = path.join(__dirname, '..', 'frontend', 'public');
const sourceImage = path.join(frontendPublicDir, 'favicon.png');
const out32 = path.join(frontendPublicDir, 'favicon-32x32.png');
const out180 = path.join(frontendPublicDir, 'apple-touch-icon.png');
const out192 = path.join(frontendPublicDir, 'android-chrome-192x192.png');
const out512 = path.join(frontendPublicDir, 'android-chrome-512x512.png');

console.log('Optimizing favicon for standard sizes...');

try {
    const sharp = require('sharp');

    async function resizeImages() {
        console.log('Generating 32x32 favicon...');
        await sharp(sourceImage).resize(32, 32).toFile(out32);

        console.log('Generating 180x180 Apple Touch Icon...');
        await sharp(sourceImage).resize(180, 180).toFile(out180);

        console.log('Generating 192x192 Android Icon...');
        await sharp(sourceImage).resize(192, 192).toFile(out192);

        console.log('Generating 512x512 Android Icon...');
        await sharp(sourceImage).resize(512, 512).toFile(out512);

        console.log('Favicons generated successfully.');
    }

    resizeImages().then(() => {
        // Optional: cleanup sharp node_modules if we don't want to leave it
    });

} catch (error) {
    console.error('Error optimizing icons:', error);
}
