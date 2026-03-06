const fs = require('fs');
const path = require('path');

const BASE = 'C:/Users/Admin/Documents/Dev/IR Bot/client/src';

function writeFile(relPath, content) {
  const fullPath = path.join(BASE, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log('Written: ' + relPath + ' (' + content.length + ' bytes)');
}

// Read all file contents from the companion data file
const data = JSON.parse(fs.readFileSync('C:/Users/Admin/Documents/Dev/IR Bot/_gen_data.json', 'utf8'));

for (const [relPath, content] of Object.entries(data)) {
  writeFile(relPath, content);
}

console.log('All files written successfully!');
