import fs from "node:fs";
import path from "node:path";

const rootPublicDir = path.resolve("public");
const outputPublicDir = path.resolve(".output/public");
const assetsDir = path.join(outputPublicDir, "assets");

if (!fs.existsSync(outputPublicDir)) {
  fs.mkdirSync(outputPublicDir, { recursive: true });
}

// Ensure favicon copies exist in rootPublicDir and outputPublicDir
const logoWebpPath = path.join(rootPublicDir, "logo.webp");
if (fs.existsSync(logoWebpPath)) {
  fs.copyFileSync(logoWebpPath, path.join(rootPublicDir, "favicon.ico"));
  fs.copyFileSync(logoWebpPath, path.join(rootPublicDir, "favicon.webp"));
  fs.copyFileSync(logoWebpPath, path.join(rootPublicDir, "favicon.png"));
}

// Copy all root public files into .output/public/ (e.g. logo.webp, favicon.ico, sw.js)
if (fs.existsSync(rootPublicDir)) {
  const publicFiles = fs.readdirSync(rootPublicDir);
  for (const file of publicFiles) {
    const srcPath = path.join(rootPublicDir, file);
    const destPath = path.join(outputPublicDir, file);
    const stat = fs.statSync(srcPath);
    if (stat.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

let jsFile = "";
let cssFile = "";

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  jsFile =
    files.find((f) => f.startsWith("index-") && f.endsWith(".js")) ||
    files.find((f) => f.endsWith(".js")) ||
    "";
  cssFile =
    files.find((f) => f.startsWith("index-") && f.endsWith(".css")) ||
    files.find((f) => f.endsWith(".css")) ||
    "";
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Clip N Copy — Stationery, Books & Printing Store</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
      rel="stylesheet"
    />
    <link rel="icon" type="image/webp" href="/logo.webp" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <link rel="shortcut icon" type="image/webp" href="/logo.webp" />
    <link rel="apple-touch-icon" href="/logo.webp" />
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
  </head>
  <body>
    <div id="root"></div>
    ${jsFile ? `<script type="module" src="/assets/${jsFile}"></script>` : ""}
  </body>
</html>
`;

fs.writeFileSync(path.join(outputPublicDir, "index.html"), htmlContent, "utf-8");
console.log("Generated .output/public/index.html with JS:", jsFile, "CSS:", cssFile);

const redirectsContent = `/*    /index.html   200\n`;
fs.writeFileSync(path.join(outputPublicDir, "_redirects"), redirectsContent, "utf-8");
console.log("Generated .output/public/_redirects");
