// generate-assets.js
// Usage:
// 1) npm install sharp --save-dev
// 2) node ./scripts/generate-assets.js

const fs = require('fs');
const path = require('path');
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('This script requires sharp. Install with: npm install sharp --save-dev');
  process.exit(1);
}

const root = path.resolve(__dirname, '..');
const src = path.join(root, 'assets', 'images', 'icon.png');
if (!fs.existsSync(src)) {
  console.error('Source icon not found at', src);
  process.exit(1);
}

const outDir = path.join(root, 'assets', 'images');
const screenshotsDir = path.join(root, 'assets', 'screenshots');
if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

async function gen() {
  try {
    console.log('Generating assets from', src);

    // Play store icon 512x512
    await sharp(src)
      .resize(512, 512, { fit: 'cover' })
      .png()
      .toFile(path.join(outDir, 'play-store-icon.png'));
    console.log('Created play-store-icon.png');

    // Feature graphic 1024x500
    await sharp(src)
      .resize(1024, 500, { fit: 'cover' })
      .png()
      .toFile(path.join(outDir, 'feature-graphic.png'));
    console.log('Created feature-graphic.png');

    // Adaptive icon background (1080x1080) - solid background using center crop
    await sharp(src)
      .resize(1080, 1080, { fit: 'cover' })
      .png()
      .toFile(path.join(outDir, 'adaptive-icon-bg.png'));
    console.log('Created adaptive-icon-bg.png');

    // Helper to write a file only if it doesn't already exist (so we don't replace
    // user-provided screenshots). Other generated images (icons, feature graphic)
    // will still be recreated.
    async function writeIfAbsent(targetPath, pipelineFactory, friendlyName) {
      if (fs.existsSync(targetPath)) {
        console.log(`Skipping existing ${friendlyName || path.relative(root, targetPath)}`);
        return;
      }
      await pipelineFactory().toFile(targetPath);
      console.log(`Created ${friendlyName || path.relative(root, targetPath)}`);
    }

    // Generate 3 phone screenshots (1080x1920) by center-cropping the icon as placeholder
    // for (let i = 1; i <= 3; i++) {
    //   const target = path.join(screenshotsDir, `phone-${i}.png`);
    //   await writeIfAbsent(
    //     target,
    //     () => sharp(src).resize(1080, 1920, { fit: 'cover' }).png(),
    //     `screenshots/phone-${i}.png`
    //   );
    // }

    // Tablet screenshot placeholder 1200x1920
    // const tabletTarget = path.join(screenshotsDir, `tablet-1.png`);
    // await writeIfAbsent(
    //   tabletTarget,
    //   () => sharp(src).resize(1200, 1920, { fit: 'cover' }).png(),
    //   'screenshots/tablet-1.png'
    // );

    console.log('All assets generated. Replace screenshots with real app screenshots when available.');
  } catch (err) {
    console.error('Asset generation failed:', err);
    process.exit(1);
  }
}

gen();
