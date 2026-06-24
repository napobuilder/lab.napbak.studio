const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'MasterAnalyzer.jsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Find the closing line '}' that follows the last '};' of the return
// We want to keep up to and including the line with just '}'
// That's the line at index 1170 (1-indexed line 1171) in original count
// But now the file may be different - find the pattern instead

const closingPattern = /^\s*\}\s*$/; // just a closing brace
let lastFunctionClose = -1;
let foundReturnClose = false;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.trim() === '};' || (line.trim() === '}' && !foundReturnClose)) {
    // Look for '  );' followed by '}' 
    if (i > 0 && lines[i-1].trim() === ');') {
      lastFunctionClose = i;
      foundReturnClose = true;
      break;
    }
  }
}

console.log(`Found function close at line: ${lastFunctionClose + 1}`);
console.log(`Total lines: ${lines.length}`);

if (lastFunctionClose > 0) {
  const trimmed = lines.slice(0, lastFunctionClose + 1).join('\n') + '\n';
  fs.writeFileSync(filePath, trimmed, 'utf8');
  console.log(`Written. New line count: ${trimmed.split('\n').length}`);
} else {
  console.log('Pattern not found, no changes made');
}
