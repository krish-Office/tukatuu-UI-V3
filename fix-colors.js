const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  // Fix dark background with dark text
  content = content.replace(/(bg-mint-[6789]00\b[^\s"'`]*)\s+text-mint-900/g, '$1 text-white');
  content = content.replace(/text-mint-900\s+(bg-mint-[6789]00\b)/g, 'text-white $1');
  
  // Fix fill/text on logos if any
  content = content.replace(/fill-mint-[6789]00\s+text-mint-[6789]00/g, 'fill-mint-800 text-white');

  // Fix button text colors
  content = content.replace(/(bg-mint-600.*?)text-mint-900/g, '$1text-white');
  
  // If there are 'text-mint-50' replacing text-slate-100 where it should be text-mint-900 or something else, wait.
  // Actually, standard green buttons should be `bg-mint-600 text-white`.
  
  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
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
console.log('Color fixes applied!');
