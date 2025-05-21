import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const sss = require('shamirs-secret-sharing');

// As duas shares conhecidas do desafio (em palavras, 12 palavras cada)
const share1Words = [
  'sessão','charuto','uva','alegre','útil','agitar',
  'fatal','pensamento','muito','qualquer','braço','alheio'
];
const share2Words = [
  'relógio','fresco','segurança','campo','cuidado','esforço',
  'gorila','velocidade','plástico','comum','tomate','eco'
];

// Para força bruta, vamos supor que a 3ª share seja 12 palavras do dicionário bip39
// Então vamos tentar combinar palavras para essa 3ª share (exemplo: variando só as primeiras 4 palavras pra demo)

const wordlist = bip39.wordlists.english;

function wordsToBuffer(words) {
  // converte array de palavras BIP39 para buffer de entropia
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
      process.exit(0); // termina o programa ao achar resultado válido
    }
  } catch {
    // erro na recombinação - ignora
  }
  return false;
}

// Função que gera combinações forçando só as primeiras N palavras da share3,
// deixando as demais fixas em uma palavra qualquer (exemplo: "abandon")
function* generateShare3Candidates(limit = 1000000) {
  const fixedWords = new Array(12).fill('abandon'); // palavra fixa para demo

  // Varia as primeiras 4 palavras (exemplo: força bruta em 4 palavras)
  const maxWords = wordlist.length;
  let count = 0;

  for (let i0 = 0; i0 < maxWords; i0++) {
    for (let i1 = 0; i1 < maxWords; i1++) {
      for (let i2 = 0; i2 < maxWords; i2++) {
        for (let i3 = 0; i3 < maxWords; i3++) {
          fixedWords[0] = wordlist[i0];
          fixedWords[1] = wordlist[i1];
          fixedWords[2] = wordlist[i2];
          fixedWords[3] = wordlist[i3];

          count++;
          if (count > limit) return;

          yield fixedWords.slice();
        }
      }
    }
  }
}

(async () => {
  console.log('Iniciando força bruta na 3ª share...');
  let tried = 0;
  const logInterval = 10000;

  for await (const candidate of generateShare3Candidates(1000000000)) {
    await tryCombine(candidate);
    tried++;
    if (tried % logInterval === 0) {
      console.log(`Tentativas feitas: ${tried}`);
    }
  }

  console.log('Fim das tentativas (limit reached)');
})();
