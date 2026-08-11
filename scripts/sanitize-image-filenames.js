const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'frontend', 'public', 'images', 'products');
if (!fs.existsSync(publicDir)) {
  console.log('Public dir does not exist');
  process.exit(1);
}

const files = fs.readdirSync(publicDir);
const newMap = {};

files.forEach(file => {
  if (!file.endsWith('.png') && !file.endsWith('.jpg')) return;

  // Clean filename: lowercase, replace spaces & special chars with underscores
  const ext = path.extname(file);
  const base = path.basename(file, ext);
  const cleanBase = base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  const newFileName = `${cleanBase}${ext}`;
  const oldPath = path.join(publicDir, file);
  const newPath = path.join(publicDir, newFileName);

  if (file !== newFileName) {
    fs.renameSync(oldPath, newPath);
  }

  // Extract item name for mapping
  // e.g. "01_red_delicious_apple" -> "red delicious apple"
  const nameWithoutNumber = cleanBase.replace(/^\d+_/g, '').replace(/_/g, ' ');
  newMap[nameWithoutNumber] = `/images/products/${newFileName}`;
});

fs.writeFileSync(path.join(__dirname, 'clean-image-map.json'), JSON.stringify(newMap, null, 2));
console.log(`✅ Successfully sanitized ${Object.keys(newMap).length} image filenames!`);
