const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  content = content.replace(/bg-mint-50\/\d+/g, 'bg-slate-900/50');
  content = content.replace(/bg-mint-100\/\d+/g, 'bg-slate-800/50');
  content = content.replace(/bg-mint-[2-4]00(\/\d+)?/g, 'bg-slate-700/50');
  content = content.replace(/bg-mint-9[0-5]0\/\d+/g, 'bg-slate-950/80');
  
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
console.log('Done 2!');
