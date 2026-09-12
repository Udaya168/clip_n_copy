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
    <div id="root">
      <div style="position:fixed;inset:0;z-index:9999;display:flex;min-height:100vh;width:100%;flex-direction:column;align-items:center;justify-content:center;background-color:#ffffff;padding:1rem;font-family:sans-serif;user-select:none;">
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
          <img src="/logo.webp" alt="Clip N Copy" style="width:160px;height:auto;object-fit:contain;margin-bottom:1rem;" />
          <p style="font-size:0.875rem;font-weight:600;color:#475569;letter-spacing:0.025em;margin-bottom:0.625rem;margin-top:0;">Loading...</p>
          <div style="display:flex;align-items:center;justify-content:center;">
            <svg style="width:1rem;height:1rem;color:#0647E8;animation:spin 1s linear infinite;" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
              <circle style="opacity:0.25;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path style="opacity:0.75;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
    ${jsFile ? `<script type="module" src="/assets/${jsFile}"></script>` : ""}
  </body>
</html>
`;

fs.writeFileSync(path.join(outputPublicDir, "index.html"), htmlContent, "utf-8");
console.log("Generated .output/public/index.html with JS:", jsFile, "CSS:", cssFile);

const redirectsContent = `/*    /index.html   200\n`;
fs.writeFileSync(path.join(outputPublicDir, "_redirects"), redirectsContent, "utf-8");
console.log("Generated .output/public/_redirects");
