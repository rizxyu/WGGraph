const fs = require('fs');
const path = require('path');
const Obfuscator = require('javascript-obfuscator');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');

if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
}

const htmlPath = path.join(srcDir, 'index.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const scriptRegex = /<script\s+src="([^"]+)"><\/script>/g;
let combinedJs = '';
let match;

console.log('Membaca file-file JavaScript...');

while ((match = scriptRegex.exec(html)) !== null) {
    const jsPath = path.join(srcDir, match[1]);
    if (fs.existsSync(jsPath)) {
        combinedJs += fs.readFileSync(jsPath, 'utf8') + '\n';
    } else {
        console.warn('File tidak ditemukan:', jsPath);
    }
}

console.log('Mengunci (Obfuscating) kode...');

const obfuscated = Obfuscator.obfuscate(combinedJs, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 1,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.5,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    disableConsoleOutput: true,
    selfDefending: false
}).getObfuscatedCode();

fs.writeFileSync(path.join(distDir, 'bundle.js'), obfuscated);

console.log('Membuat index.html untuk Production...');

let cleanHtml = html.replace(scriptRegex, '');
cleanHtml = cleanHtml.replace('</body>', '    <script src="bundle.js"></script>\n</body>');
fs.writeFileSync(path.join(distDir, 'index.html'), cleanHtml);

fs.copyFileSync(path.join(srcDir, 'styles.css'), path.join(distDir, 'styles.css'));

console.log('✅ BUILD CEP SUKSES! File aman di dalam folder dist/');