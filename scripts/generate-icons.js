#!/usr/bin/env node
/**
 * Icon Generator Script
 * Generates PNG icons from the SVG source using Node.js canvas or sharp
 *
 * Usage: node scripts/generate-icons.js
 *
 * Prerequisites:
 * - npm install sharp (optional, for better quality)
 * OR
 * - npm install canvas
 *
 * If neither is available, this script will output instructions.
 */

const fs = require('fs');
const path = require('path');

const SIZES = [16, 48, 128];
const ICONS_DIR = path.join(__dirname, '..', 'icons');
const SVG_PATH = path.join(ICONS_DIR, 'icon.svg');

async function generateWithSharp() {
  try {
    const sharp = require('sharp');
    const svgBuffer = fs.readFileSync(SVG_PATH);

    for (const size of SIZES) {
      const outputPath = path.join(ICONS_DIR, `icon${size}.png`);
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputPath);
      console.log(`Generated: ${outputPath}`);
    }
    return true;
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      return false;
    }
    throw e;
  }
}

async function generatePlaceholder() {
  console.log('Creating placeholder icons...');
  console.log('For better quality icons, install sharp: npm install sharp');
  console.log('Then run: node scripts/generate-icons.js');

  // Create minimal valid PNG files as placeholders
  // These are 1x1 blue pixels that will work but look very basic
  const PNG_HEADER = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A  // PNG signature
  ]);

  for (const size of SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon${size}.png`);
    // Write a message file instead
    fs.writeFileSync(
      outputPath + '.txt',
      `Placeholder for ${size}x${size} icon.\n` +
      `To generate proper icons:\n` +
      `1. npm install sharp\n` +
      `2. node scripts/generate-icons.js\n` +
      `OR use an online SVG to PNG converter with icons/icon.svg`
    );
    console.log(`Created placeholder info: ${outputPath}.txt`);
  }
}

async function main() {
  if (!fs.existsSync(SVG_PATH)) {
    console.error(`SVG not found: ${SVG_PATH}`);
    process.exit(1);
  }

  const success = await generateWithSharp();
  if (!success) {
    await generatePlaceholder();
  }
}

main().catch(console.error);
