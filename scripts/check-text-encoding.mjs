import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const ignoredDirectories = new Set([
  '.git',
  '.next',
  '.turbo',
  'coverage',
  'dist',
  'node_modules',
  'out',
]);
const textExtensions = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.prisma',
  '.sql',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);
const firstLatinMarker = String.fromCharCode(0x00c3);
const secondLatinMarker = String.fromCharCode(0x00c2);
const punctuationMarker = String.fromCharCode(0x00e2);
const replacementSequence = String.fromCharCode(0x00ef, 0x00bf, 0x00bd);
const replacementMarker = String.fromCharCode(0xfffd);
const suspiciousText = new RegExp(
  `(?:${firstLatinMarker}[¡-¿]|${secondLatinMarker}[¡-¿]|${punctuationMarker}[€†€™“”]|${replacementSequence}|${replacementMarker})`,
  'u',
);
const findings = [];

async function inspectDirectory(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await inspectDirectory(absolutePath);
      continue;
    }
    if (
      !entry.isFile() ||
      !textExtensions.has(path.extname(entry.name).toLowerCase())
    )
      continue;

    const contents = await readFile(absolutePath, 'utf8');
    const lines = contents.split(/\r?\n/u);
    lines.forEach((line, index) => {
      if (suspiciousText.test(line)) {
        findings.push(
          `${path.relative(repositoryRoot, absolutePath)}:${index + 1}: ${line.trim()}`,
        );
      }
    });
  }
}

await inspectDirectory(repositoryRoot);

if (findings.length > 0) {
  console.error('Possível texto com codificação corrompida:');
  for (const finding of findings) console.error(`  ${finding}`);
  process.exitCode = 1;
} else {
  console.log(
    'Verificação de codificação concluída: nenhum padrão suspeito encontrado.',
  );
}
