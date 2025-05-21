import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const sss = require('shamirs-secret-sharing');

const share1Words = [
  'sessão','charuto','uva','alegre','útil','agitar',
  'fatal','pensamento','muito','qualquer','braço','alheio'
];
const share2Words = [
  'relógio','fresco','segurança','campo','cuidado','esforço',
  'gorila','velocidade','plástico','comum','tomate','eco'
];

const fixedWord = 'abandon'; // palavra fixa para o restante da share3

const wordlist = bip39.wordlists.english;
const maxWords = wordlist.length;

function wordsToBuffer(words) {
  if (!bip39.validateMnemonic(words.join(' '))) return null;
  const entropy = bip39.mnemonicToEntropy(words.join(' '));
  return Buffer.from(entropy, 'hex');
}

async function tryCombine(share3Words) {
  const share1 = wordsToBuffer(share1Words);
  const share2 = wordsToBuffer(share2Words);
  const share3 = wordsToBuffer(share3Words);
  if (!share1 || !share2 || !share3) return false;

  try {
    const secret = sss.combine([share1, share2, share3]);
    const mnemonic = secret.toString('utf8');

    if (bip39.validateMnemonic(mnemonic)) {
      console.log('*** Mnemônico válido encontrado! ***');
      console.log('Mnemonic:', mnemonic);

      const seed = await bip39.mnemonicToSeed(mnemonic);
      const root = bitcoin.bip32.fromSeed(seed);
      const child = root.derivePath("m/84'/0'/0'/0/0");
      const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey });

      console.log('Endereço derivado:', address);
      process.exit(0);
    }
  } catch {
    // ignora erros
  }
  return false;
}

(async () => {
  console.log('Iniciando força bruta otimizada na 3ª share (variação nas 3 primeiras palavras)...');
  let tried = 0;
  const logInterval = 50000;

  const fixedWords = new Array(12).fill(fixedWord);

  for (let i0 = 0; i0 < maxWords; i0++) {
    for (let i1 = 0; i1 < maxWords; i1++) {
      for (let i2 = 0; i2 < maxWords; i2++) {
        fixedWords[0] = wordlist[i0];
        fixedWords[1] = wordlist[i1];
        fixedWords[2] = wordlist[i2];

        tried++;
        if (tried % logInterval === 0) {
          console.log(`Tentativas: ${tried}`);
        }

        // Tenta combinar sem await pra não travar loop
        tryCombine(fixedWords).catch(() => {});
      }
    }
  }

  console.log('Fim das tentativas.');
})();


