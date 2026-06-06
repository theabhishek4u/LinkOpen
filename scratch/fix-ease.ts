import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (file: string) => void) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        walk(fullPath, callback);
      }
    } else {
      if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
        callback(fullPath);
      }
    }
  });
}

const srcDir = path.join(process.cwd(), 'src');

walk(srcDir, (file) => {
  let content = fs.readFileSync(file, 'utf-8');
  let changed = false;

  // Regex to find ease: [ ... ] and add as const if not present
  // Matches: ease: [0.25, 0.46, 0.45, 0.94]
  // Does not match: ease: [0.25, 0.46, 0.45, 0.94] as const
  const regex = /ease:\s*\[([\s\d.,-]+)\](?!\s+as\s+const)/g;

  if (regex.test(content)) {
    content = content.replace(regex, 'ease: [$1] as const');
    changed = true;
  }

  if (changed) {
    console.log(`Fixing ${file}`);
    fs.writeFileSync(file, content);
  }
});
