import fs from "node:fs";
import path from "node:path";

const publicDir = path.resolve(".output/public");
const assetsDir = path.join(publicDir, "assets");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
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
    files.find((f) => f.startsWith("styles-") && f.endsWith(".css")) ||
    files.find((f) => f.endsWith(".css")) ||
    "";
}

const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Clip N Copy — Stationery, Books & Printing Store</title>
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    ${cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}" />` : ""}
  </head>
  <body>
    <div id="root"></div>
    ${jsFile ? `<script type="module" src="/assets/${jsFile}"></script>` : ""}
  </body>
</html>
`;

fs.writeFileSync(path.join(publicDir, "index.html"), htmlContent, "utf-8");
console.log("Generated .output/public/index.html with JS:", jsFile, "CSS:", cssFile);

const redirectsContent = `/*    /index.html   200\n`;
fs.writeFileSync(path.join(publicDir, "_redirects"), redirectsContent, "utf-8");
console.log("Generated .output/public/_redirects");
