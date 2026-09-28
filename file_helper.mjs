import fs from 'fs';
const file = process.argv[2];
const b64 = process.argv[3];
const mode = process.argv[4] || 'append';
if (mode === 'write') {
  fs.writeFileSync(file, Buffer.from(b64, 'base64').toString('utf8'), 'utf8');
} else {
  fs.appendFileSync(file, Buffer.from(b64, 'base64').toString('utf8'), 'utf8');
}
console.log('Processed:', file);
