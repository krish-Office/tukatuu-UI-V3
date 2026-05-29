const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Protect code block from matches where it's actually correct (e.g. inside dark green banner cards)
  // But let's first perform the targeted button replacements
  
  // 1. Rebuild unreadable checkout buttons
  content = content.replace(/bg-mint-100\s+hover:bg-mint-200\s+text-mint-100/g, 'bg-mint-800 hover:bg-mint-900 text-white');
  content = content.replace(/bg-mint-200\s+text-mint-100/g, 'bg-mint-800 text-white hover:bg-mint-900');
  content = content.replace(/bg-white\s+text-mint-100\s+hover:bg-mint-50/g, 'bg-mint-800 text-white hover:bg-mint-900');
  
  // 2. Rebuild unreadable order details buttons
  content = content.replace(/bg-white\s+border\s+border-mint-200\s+hover:bg-mint-50\s+text-mint-100/g, 'bg-white border border-mint-200 hover:bg-mint-50 text-mint-850');
  
  // 3. Fix unreadable badge text
  content = content.replace(/bg-mint-200\s+text-mint-100\s+text-\[10px\]/g, 'bg-mint-100 text-mint-800 text-[10px]');
  
  // 4. Fix labels specifically
  content = content.replace(/(label\s+[^>]*\b)text-mint-100(\b[^>]*>)/g, '$1text-mint-850$2');
  content = content.replace(/(label\s+[^>]*\b)text-mint-200(\b[^>]*>)/g, '$1text-mint-800$2');
  
  // 5. Fix headers specifically
  content = content.replace(/(h[1-6]\s+[^>]*\b)text-mint-100(\b[^>]*>)/g, '$1text-mint-900$2');
  content = content.replace(/(h[1-6]\s+[^>]*\b)text-mint-200(\b[^>]*>)/g, '$1text-mint-800$2');
  
  // 6. Fix paragraph descriptions specifically
  content = content.replace(/(p\s+[^>]*\b)text-mint-100(\b[^>]*>)/g, (match, prefix, suffix) => {
    // If it's a dark background container, keep it light, otherwise turn it dark
    if (prefix.includes('bg-mint-800') || prefix.includes('bg-mint-900') || prefix.includes('bg-mint-950') || prefix.includes('bg-mint-700')) {
      return match;
    }
    return prefix + 'text-mint-800' + suffix;
  });
  
  content = content.replace(/(p\s+[^>]*\b)text-mint-200(\b[^>]*>)/g, (match, prefix, suffix) => {
    if (prefix.includes('bg-mint-800') || prefix.includes('bg-mint-900') || prefix.includes('bg-mint-950') || prefix.includes('bg-mint-700')) {
      return match;
    }
    return prefix + 'text-mint-700' + suffix;
  });

  // 7. General text replacements while ignoring components that have dark backgrounds
  content = content.replace(/(className\s*=\s*["'`][^"'`]*\b)text-mint-100(\b[^"'`]*["'`])/g, (match, prefix, suffix) => {
    if (prefix.includes('bg-mint-800') || prefix.includes('bg-mint-900') || prefix.includes('bg-mint-950') || prefix.includes('bg-mint-700') || prefix.includes('fill-') || prefix.includes('ring-')) {
      return match;
    }
    return prefix + 'text-mint-800' + suffix;
  });

  content = content.replace(/(className\s*=\s*["'`][^"'`]*\b)text-mint-200(\b[^"'`]*["'`])/g, (match, prefix, suffix) => {
    if (prefix.includes('bg-mint-800') || prefix.includes('bg-mint-900') || prefix.includes('bg-mint-950') || prefix.includes('bg-mint-700') || prefix.includes('fill-') || prefix.includes('ring-')) {
      return match;
    }
    return prefix + 'text-mint-700' + suffix;
  });

  // 8. Handle a specific unreadable initial circle in orders list page
  content = content.replace(/ring-white\s+bg-mint-100\s+text-xs\s+font-medium\s+text-mint-100/g, 'ring-white bg-mint-100 text-xs font-semibold text-mint-800');

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
console.log('Global text color repairs complete!');
