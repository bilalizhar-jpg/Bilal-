const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Remove dark: classes
  content = content.replace(/dark:[a-zA-Z0-9_/\-\[\]#:]+/g, '');
  
  // Clean up multiple spaces left by removing classes
  content = content.replace(/ +/g, ' ');
  content = content.replace(/ \}/g, '}');
  content = content.replace(/ "/g, '"');
  content = content.replace(/" /g, '"');
  content = content.replace(/ `/g, '`');
  content = content.replace(/` /g, '`');

  // Remove useTheme import
  content = content.replace(/import\s*\{\s*useTheme\s*\}\s*from\s*['"][^'"]+['"];?\n?/g, '');
  
  // Remove const { isDark } = useTheme();
  content = content.replace(/const\s*\{\s*isDark\s*(?:,\s*toggleTheme)?\s*\}\s*=\s*useTheme\(\);\n?/g, '');
  content = content.replace(/const\s*\{\s*(?:toggleTheme\s*,\s*)?isDark\s*\}\s*=\s*useTheme\(\);\n?/g, '');
  content = content.replace(/const\s*\{\s*theme\s*,\s*isDark\s*\}\s*=\s*useTheme\(\);\n?/g, '');

  // Replace isDark ternaries
  // Pattern: ${isDark ? 'dark-classes' : 'light-classes'}
  content = content.replace(/\$\{isDark\s*\?\s*['"]([^'"]*)['"]\s*:\s*['"]([^'"]*)['"]\}/g, '$2');
  
  // Pattern: isDark ? 'dark-classes' : 'light-classes'
  content = content.replace(/isDark\s*\?\s*['"]([^'"]*)['"]\s*:\s*['"]([^'"]*)['"]/g, "'$2'");

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

walkDir('/src');
console.log('Done');
