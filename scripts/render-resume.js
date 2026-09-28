const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const envPath = path.join(root, '.env');
const templatePath = path.join(root, 'template-en.md');
const outputPath = path.join(root, 'template-en.local.md');

if (!fs.existsSync(envPath)) {
    console.error('Missing .env. Copy .env.example to .env and fill in your contact details.');
    process.exit(1);
}

const values = {};
for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');
    if (separator < 1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
    }
    values[key] = value;
}

const required = ['CV_NAME', 'CV_PHONE', 'CV_EMAIL', 'CV_LINKEDIN', 'CV_PORTFOLIO'];
const missing = required.filter((key) => !values[key]);
if (missing.length) {
    console.error(`Missing values in .env: ${missing.join(', ')}`);
    process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');
const rendered = template.replace(/\{\{(CV_[A-Z_]+)\}\}/g, (placeholder, key) => {
    if (!values[key]) {
        console.error(`No value provided for ${placeholder}`);
        process.exit(1);
    }
    return values[key];
});

fs.writeFileSync(outputPath, rendered, 'utf8');
console.log(`Created ${path.basename(outputPath)}. Open it in VS Code to preview or export the PDF.`);
