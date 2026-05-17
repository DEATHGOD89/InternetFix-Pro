const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dir = path.join(__dirname, '../public/speedtest');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const file = path.join(dir, '25mb.bin');
if (!fs.existsSync(file)) {
  console.log("Generating 25mb.bin for static download tests...");
  // Use a 25MB file to balance generation speed and CDN chunking
  const buffer = crypto.randomBytes(25 * 1024 * 1024);
  fs.writeFileSync(file, buffer);
  console.log("Generated 25mb.bin successfully.");
}
