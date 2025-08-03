#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("🚀 Building Giga-Speed Extension for Production...");

// Create production directory
const prodDir = "production";
if (!fs.existsSync(prodDir)) {
  fs.mkdirSync(prodDir);
}

// Copy necessary files
const filesToCopy = [
  "manifest.json",
  "src/javascript/script.js",
  "src/css/styles.css",
  "src/images/icon16.png",
  "src/images/icon48.png",
  "src/images/icon128.png",
];

filesToCopy.forEach((file) => {
  const sourcePath = file;
  const destPath = path.join(prodDir, file);

  // Create directory structure
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Copy file
  fs.copyFileSync(sourcePath, destPath);
  console.log(`✅ Copied: ${file}`);
});

// Create ZIP file for Chrome Web Store
console.log("\n📦 Creating ZIP file for Chrome Web Store...");
console.log('💡 Use the "production" folder to create your ZIP file');
console.log("💡 Or use: zip -r giga-speed-extension.zip production/");

console.log("\n🎉 Production build complete!");
console.log("\n📋 Next steps:");
console.log("1. Go to https://chrome.google.com/webstore/devconsole/");
console.log('2. Click "Add new item"');
console.log("3. Upload the ZIP file");
console.log("4. Fill in store details");
console.log("5. Submit for review");
