const fs = require('fs');
const path = require('path');

const mappings = {
  'bg-slate-900/30': 'bg-mint-50/30',
  'bg-slate-800/50': 'bg-mint-100/50',
  'bg-slate-900/50': 'bg-mint-50',
  'bg-slate-800': 'bg-mint-100',
  'bg-slate-700/50': 'bg-mint-200/50',
  'bg-slate-700': 'bg-mint-200',
  'bg-slate-600': 'bg-mint-300',
  'bg-slate-500': 'bg-mint-400',
  'bg-blue-500': 'bg-mint-500',
  'bg-blue-600': 'bg-mint-600',
  'bg-blue-700': 'bg-mint-700',
  'bg-blue-800': 'bg-mint-800',
  'bg-blue-900': 'bg-mint-900',
  
  'hover:bg-slate-800': 'hover:bg-mint-50',
  'hover:bg-slate-700': 'hover:bg-mint-100',
  'hover:bg-slate-600': 'hover:bg-mint-200',
  'hover:bg-blue-500': 'hover:bg-mint-600',
  'hover:bg-blue-600': 'hover:bg-mint-700',
  'hover:bg-blue-700': 'hover:bg-mint-800',
  'hover:bg-blue-800': 'hover:bg-mint-900',

  'text-slate-100': 'text-mint-50',
  'text-slate-200': 'text-mint-100',
  'text-slate-300': 'text-mint-200',
  'text-slate-400': 'text-mint-400',
  'text-blue-400': 'text-mint-700',
  'text-white': 'text-mint-900',

  'hover:text-slate-100': 'hover:text-mint-50',
  'hover:text-slate-300': 'hover:text-mint-600',
  'hover:text-blue-300': 'hover:text-mint-700',

  'border-white/10': 'border-mint-100',
  'border-white/20': 'border-mint-200',
  'border-slate-700': 'border-mint-300',
  'border-slate-600': 'border-mint-400',
  'border-blue-500': 'border-mint-500',
  'border-blue-600': 'border-mint-600',
  
  'hover:border-white/20': 'hover:border-mint-200',
  'hover:border-white/30': 'hover:border-mint-300',
  
  'glass-panel': 'bg-white'
};

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [slateClass, newClass] of Object.entries(mappings)) {
    const escapedClass = escapeRegExp(slateClass);
    const regex = new RegExp(`(?<=[\\s"'\\\`])(${escapedClass})(?=[\\s"'\\\`])`, 'g');
    content = content.replace(regex, newClass);
  }
  
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
console.log('Revert done!');
