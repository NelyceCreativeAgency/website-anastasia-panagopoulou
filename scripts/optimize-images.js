#!/usr/bin/env node
// scripts/optimize-images.js
// Converts PNG/JPEG images to WebP and updates all HTML/CSS/JS references.
// Run: node scripts/optimize-images.js

const sharp = require('sharp');
const fs    = require('fs');
const path  = require('path');

const ROOT       = path.resolve(__dirname, '..');
const IMAGES_DIR = path.join(ROOT, 'Images');
const QUALITY    = 82;

// ─── helpers ────────────────────────────────────────────────────────────────

function* walkImages(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { yield* walkImages(full); continue; }
    if (/\.(png|jpe?g)$/i.test(entry.name)) yield full;
  }
}

function* walkText(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'scripts') continue;
      yield* walkText(full);
      continue;
    }
    if (/\.(html|css|js)$/i.test(entry.name)) yield full;
  }
}

// Replace .png/.jpg/.jpeg → .webp only inside local Images/ paths
// Does NOT touch external https:// URLs (they never contain "Images/")
function updateRefs(content) {
  return content.replace(/(Images\/[^"'()]*)\.(png|jpe?g)/g, '$1.webp');
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  const images = [...walkImages(IMAGES_DIR)];
  if (images.length === 0) {
    console.log('No images to convert — all good!');
  }

  for (const src of images) {
    const dst = src.replace(/\.(png|jpe?g)$/i, '.webp');
    if (!fs.existsSync(dst)) {
      await sharp(src).webp({ quality: QUALITY }).toFile(dst);
      const before = (fs.statSync(src).size / 1024).toFixed(1);
      const after  = (fs.statSync(dst).size / 1024).toFixed(1);
      console.log(`✓ ${path.relative(ROOT, src)} → .webp  (${before}KB → ${after}KB)`);
    }
    fs.unlinkSync(src);
  }

  // Update references in all HTML / CSS / JS files
  let updatedFiles = 0;
  for (const file of walkText(ROOT)) {
    const original = fs.readFileSync(file, 'utf8');
    const updated  = updateRefs(original);
    if (updated !== original) {
      fs.writeFileSync(file, updated);
      console.log(`📝 ${path.relative(ROOT, file)}`);
      updatedFiles++;
    }
  }

  console.log(`\n✅ Done — ${images.length} image(s) converted, ${updatedFiles} file(s) updated.`);
}

main().catch(err => { console.error('Error:', err.message); process.exit(1); });
