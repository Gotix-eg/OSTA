const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'apps', 'web', 'app', 'globals.css');
let content = fs.readFileSync(filePath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Set global variables to default brand yellow/gold theme values
content = content.replace(
  `--color-bg:       #FDE28A;`,
  `--color-bg:       #f5bd18;`
);
content = content.replace(
  `--color-bg-card:  rgba(255, 255, 255, 0.75);`,
  `--color-bg-card:  #ffffff;`
);
content = content.replace(
  `--color-border:   oklch(55% 0.13 85 / 0.2);`,
  `--color-border:   rgba(0, 0, 0, 0.12);`
);
content = content.replace(
  `--color-muted:    oklch(35% 0.02 60);`,
  `--color-muted:    #3d3830;`
);
content = content.replace(
  `--color-subtle:   oklch(50% 0.02 60);`,
  `--color-subtle:   #5a5248;`
);

// 2. Remove the desktop dark theme overrides completely
const desktopOverridesTarget = `/* ──────────────────────────────────────────────────────────────────────────────
   DESKTOP DARK THEME — Override Tailwind classes that use explicit colors
   This ensures text is readable on the dark desktop background
   ────────────────────────────────────────────────────────────────────────────── */
@media (min-width: 768px) {
  /* Invert onyx text classes for dark background readability */
  .text-onyx-950 { color: oklch(93% 0.005 60) !important; }
  .text-onyx-900 { color: oklch(88% 0.005 60) !important; }
  .text-onyx-800 { color: oklch(80% 0.005 60) !important; }
  .text-onyx-700 { color: oklch(70% 0.005 60) !important; }
  .text-onyx-600 { color: oklch(60% 0.005 60) !important; }

  /* Background overrides for dark desktop */
  .bg-background  { background-color: oklch(10% 0.005 60) !important; }
  .bg-gold-100    { background-color: oklch(15% 0.005 60) !important; }
  .bg-gold-50     { background-color: oklch(13% 0.005 60) !important; }
  .bg-white\\/5    { background-color: rgba(255,255,255,0.05) !important; }
  .bg-white\\/10   { background-color: rgba(255,255,255,0.08) !important; }

  /* Border overrides */
  .border-gold-700\\/10 { border-color: rgba(255,255,255,0.08) !important; }
  .border-gold-700\\/20 { border-color: rgba(255,255,255,0.12) !important; }

  /* Input/form fields on dark desktop */
  input, textarea, select {
    background: rgba(255, 255, 255, 0.06);
    color: oklch(93% 0.005 60);
    border-color: rgba(255, 255, 255, 0.12);
  }
  input::placeholder, textarea::placeholder {
    color: oklch(58% 0.005 60);
  }
}`;

if (content.includes(desktopOverridesTarget)) {
  content = content.replace(desktopOverridesTarget, '');
  console.log("Desktop overrides removed successfully!");
} else {
  // Try regex or fallback
  console.log("Desktop overrides target not found, trying fallback matching...");
  const startIdx = content.indexOf('DESKTOP DARK THEME');
  if (startIdx !== -1) {
    const sectionStart = content.lastIndexOf('/*', startIdx);
    const blockStart = content.indexOf('@media (min-width: 768px)', startIdx);
    if (blockStart !== -1) {
      let openBraces = 0;
      let blockEnd = -1;
      for (let i = blockStart; i < content.length; i++) {
        if (content[i] === '{') openBraces++;
        else if (content[i] === '}') {
          openBraces--;
          if (openBraces === 0) {
            blockEnd = i;
            break;
          }
        }
      }
      if (blockEnd !== -1) {
        content = content.substring(0, sectionStart) + content.substring(blockEnd + 1);
        console.log("Fallback: Desktop overrides removed successfully!");
      }
    }
  }
}

// 3. Remove the mobile yellow/text overrides inside max-width media query
const mobileStartIdx = content.indexOf('MOBILE TOUCH TARGETS');
if (mobileStartIdx !== -1) {
  const blockStart = content.indexOf('@media (max-width: 767px)', mobileStartIdx);
  if (blockStart !== -1) {
    let openBraces = 0;
    let blockEnd = -1;
    for (let i = blockStart; i < content.length; i++) {
      if (content[i] === '{') openBraces++;
      else if (content[i] === '}') {
        openBraces--;
        if (openBraces === 0) {
          blockEnd = i;
          break;
        }
      }
    }
    if (blockEnd !== -1) {
      // Keep only button, a, input, textarea, select, and hide-scrollbar styles
      const cleanedMobileBlock = `@media (max-width: 767px) {
  button, a, [role="button"] {
    min-height: 48px;
    min-width: 48px;
  }

  input, textarea, select {
    font-size: 16px !important;
  }

  /* Utility to hide native scrollbars */
  .hide-scrollbar::-webkit-scrollbar {
    display: none !important;
  }
  .hide-scrollbar {
    -ms-overflow-style: none !important;
    scrollbar-width: none !important;
  }
}`;
      content = content.substring(0, blockStart) + cleanedMobileBlock + content.substring(blockEnd + 1);
      console.log("Mobile overrides cleaned successfully!");
    }
  }
}

// Restore line endings
content = content.replace(/\n/g, '\r\n');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Done cleaning globals.css!");
