const fs = require('fs');
const path = require('path');

const imageMap = JSON.parse(fs.readFileSync(path.join(__dirname, 'image-map.json'), 'utf8'));
const routePath = path.join(__dirname, '..', 'frontend', 'src', 'app', 'api', 'products', 'route.ts');
let routeContent = fs.readFileSync(routePath, 'utf8');

let replacedCount = 0;
Object.entries(imageMap).forEach(([pName, localUrl]) => {
  const lines = routeContent.split('\n');
  const updatedLines = lines.map(line => {
    if (line.toLowerCase().includes(`name: '${pName}'`)) {
      replacedCount++;
      return line.replace(/image_url:\s*'[^']+'/, `image_url: '${localUrl}'`);
    }
    return line;
  });
  routeContent = updatedLines.join('\n');
});

fs.writeFileSync(routePath, routeContent);
console.log(`✅ Successfully updated ${replacedCount} product image URLs in route.ts to local assets!`);
