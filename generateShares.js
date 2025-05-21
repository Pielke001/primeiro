import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bip39 = require('bip39');
const sss = require('shamirs-secret-sharing');

const mnemonic = 'coloque seu mnemônico de 12 palavras aqui separado por espaço';

// Validar o mnemônico antes
if (!bip39.validateMnemonic(mnemonic)) {
  console.error('Mnemônico inválido!');
  process.exit(1);
}

// Transformar o mnemônico em Buffer (bytes)
const secretBuffer = Buffer.from(mnemonic, 'utf8');

// Gerar 5 shares, com limite 3 (3 necessárias para recuperar)
const shares = sss.split(secretBuffer, { shares: 5, threshold: 3 });

console.log('Shares geradas (hex):');
shares.forEach((share, idx) => {
  console.log(`Share ${idx + 1}:`, share.toString('hex'));
});
