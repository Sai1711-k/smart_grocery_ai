const fs = require('fs');
const path = require('path');

const cleanMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'clean-image-map.json'), 'utf8'));

// Update utils.ts
const utilsPath = path.join(__dirname, '..', 'frontend', 'src', 'lib', 'utils.ts');
let utilsContent = fs.readFileSync(utilsPath, 'utf8');

const dictEntries = Object.entries(cleanMap).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
utilsContent = utilsContent.replace(/const EXACT_ITEM_IMAGES: Record<string, string> = \{[\s\S]*?\n\};/, `const EXACT_ITEM_IMAGES: Record<string, string> = {\n${dictEntries}\n};`);

fs.writeFileSync(utilsPath, utilsContent);
console.log('✅ Updated utils.ts with sanitized image URLs!');

// Update route.ts
const routePath = path.join(__dirname, '..', 'frontend', 'src', 'app', 'api', 'products', 'route.ts');
let routeContent = fs.readFileSync(routePath, 'utf8');

let replacedCount = 0;
Object.entries(cleanMap).forEach(([pName, cleanUrl]) => {
  const lines = routeContent.split('\n');
  const updatedLines = lines.map(line => {
    // Match product line by name
    const cleanPName = pName.replace(/[^a-z0-9]+/g, ' ').trim();
    if (line.toLowerCase().replace(/[^a-z0-9]+/g, ' ').includes(cleanPName)) {
      replacedCount++;
      return line.replace(/image_url:\s*'[^']+'/, `image_url: '${cleanUrl}'`);
    }
    return line;
  });
  routeContent = updatedLines.join('\n');
});

fs.writeFileSync(routePath, routeContent);
console.log(`✅ Updated ${replacedCount} image URLs in route.ts with sanitized paths!`);
