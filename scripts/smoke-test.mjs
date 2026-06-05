import { existsSync, readFileSync } from 'node:fs';

const requiredFiles = [
  'index.html',
  'src/main.jsx',
  'src/api/pioneiroClient.js',
  'Dockerfile',
  '.github/workflows/ci.yml'
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`Required file not found: ${file}`);
  }
}

const client = readFileSync('src/api/pioneiroClient.js', 'utf8');

if (!client.includes('pioneiroApi')) {
  throw new Error('Local client export not found: pioneiroApi');
}

if (!client.includes('pioneiropro_')) {
  throw new Error('Local storage namespace not found: pioneiropro_');
}

console.log('Smoke test passed: Pioneiro Pro structure is valid.');
