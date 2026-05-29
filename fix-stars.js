const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Replace <Star ... fill-mint-X ... /> with fill-amber-400 text-amber-400
  content = content.replace(/<Star[^>]*className="([^"]*?)fill-mint-[^\s"]+([^"]*?)"/g, (match, p1, p2) => {
    let classes = p1 + p2;
    // remove text-mint-*
    classes = classes.replace(/text-mint-[^\s"]+/g, '');
    // remove fill-mint-*
    classes = classes.replace(/fill-mint-[^\s"]+/g, '');
    return `<Star size={12} className="${classes.trim()} fill-amber-400 text-amber-400"`;
  });
  
  // also handle other star sizes
  content = content.replace(/<Star[^>]*className=\{`([^`]*?)fill-mint-[^`]+([^`]*?)`\}/g, (match, p1, p2) => {
    let classes = p1 + p2;
    classes = classes.replace(/text-mint-[^\s`]+/g, '');
    classes = classes.replace(/fill-mint-[^\s`]+/g, '');
    return `<Star className={\`${classes.trim()} fill-amber-400 text-amber-400\`}`;
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated Stars ${filePath}`);
  }
}

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

traverse('./src');
console.log('Star fixes applied!');
