import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bip39 = require('bip39');
const sss = require('shamirs-secret-sharing');

const mnemonic = 'coloque sua frase mnemônica original de 12 palavras aqui';

const secret = Buffer.from(mnemonic, 'utf8');

const shares = sss.split(secret, { shares: 5, threshold: 3 });

shares.forEach((share, i) => {
  console.log(`Share ${i + 1}:`, share.toString('utf8'));
});

}

async function main() {
  // Transformar mnemônico em buffer concatenando as palavras (sem espaço)
  const secretBuffer = Buffer.from(originalMnemonic.replace(/\s+/g, ''), 'utf8');

  // Criar 5 shares, threshold 3
  const shares = sss.split(secretBuffer, { shares: 5, threshold: 3 });

  // Mostrar as 5 shares como palavras
  shares.forEach((share, i) => {
    printShare(`Share ${i+1}`, share);
  });
}

main();
