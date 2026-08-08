const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps', 'web', 'components', 'landing', 'mobile-hero-slider.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// Replace minHeight: "88svh" with height: "65svh" to prevent height collapse and layout overlap
content = content.replace(/minHeight:\s*"88svh"/g, 'height: "65svh"');

// Restore line endings
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done fixing mobile hero slider height!");
