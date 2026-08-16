import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const EXTS = ['.png', '.jpg', '.jpeg'];
const DIRS_TO_SEARCH = ['public', 'src'];
const CODE_EXTS = ['.ts', '.tsx', '.css', '.html', '.json'];

// Helper to recursively find files
function findFiles(dir, exts, isCode = false) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.output') {
        results = results.concat(findFiles(fullPath, exts, isCode));
      }
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (exts.includes(ext)) {
        results.push(fullPath);
      }
    }
  }
  return results;
}

async function run() {
  console.log('Finding images...');
  const images = [];
  for (const dir of DIRS_TO_SEARCH) {
    if (fs.existsSync(dir)) {
      images.push(...findFiles(dir, EXTS, false));
    }
  }
  
  console.log(`Found ${images.length} images.`);
  
  const conversions = [];
  
  for (const imgPath of images) {
    const dir = path.dirname(imgPath);
    const ext = path.extname(imgPath);
    const basename = path.basename(imgPath, ext);
    const newPath = path.join(dir, `${basename}.webp`);
    
    // Store original name and new name for regex replacement
    // E.g. "logo.png" -> "logo.webp"
    const originalName = path.basename(imgPath);
    const newName = `${basename}.webp`;
    
    conversions.push({ imgPath, newPath, originalName, newName });
    
    console.log(`Converting ${originalName} -> ${newName}`);
    try {
      await sharp(imgPath).webp({ quality: 90 }).toFile(newPath);
      fs.unlinkSync(imgPath); // Delete original
    } catch (err) {
      console.error(`Failed to convert ${imgPath}`, err);
    }
  }
  
  console.log('Updating references in code files...');
  let codeFiles = [];
  for (const dir of DIRS_TO_SEARCH.concat(['.'])) {
    if (dir === '.' || fs.existsSync(dir)) {
      if (dir === '.') {
        const rootFiles = fs.readdirSync('.').filter(f => fs.statSync(f).isFile() && CODE_EXTS.includes(path.extname(f)));
        codeFiles.push(...rootFiles.map(f => path.join('.', f)));
      } else {
        codeFiles.push(...findFiles(dir, CODE_EXTS, true));
      }
    }
  }
  
  for (const codeFile of codeFiles) {
    let content = fs.readFileSync(codeFile, 'utf8');
    let changed = false;
    
    for (const { originalName, newName } of conversions) {
      // Escape for regex
      const escapedOriginal = originalName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // We want to replace occurrences of the filename. 
      // It's mostly safe to do a global replace for something like "logo.png" to "logo.webp"
      const regex = new RegExp(`\\b${escapedOriginal}\\b`, 'g');
      if (regex.test(content) || content.includes(originalName)) {
        content = content.replace(regex, newName);
        // Fallback for strict literal matches if boundaries fail
        content = content.split(originalName).join(newName);
        changed = true;
      }
    }
    
    if (changed) {
      console.log(`Updated references in ${codeFile}`);
      fs.writeFileSync(codeFile, content, 'utf8');
    }
  }
  
  console.log('Done.');
}

run();
