import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const sss = require('shamirs-secret-sharing');

// Função para converter array de palavras para buffer usando bip39.mnemonicToEntropy
function wordsToBuffer(words) {
  const mnemonic = words.join(' ');
  return Buffer.from(bip39.mnemonicToEntropy(mnemonic), 'hex');
}

// Shares (2 de 3 necessárias do desafio)
const share1Words = [
  'sessão', 'charuto', 'uva', 'alegre', 'útil', 'agitar', 'fatal',
  'pensamento', 'muito', 'qualquer', 'braço', 'alheio'
];

const share2Words = [
  'relógio', 'fresco', 'segurança', 'campo', 'cuidado', 'esforço',
  'gorila', 'velocidade', 'plástico', 'comum', 'tomate', 'eco'
];

// Converte as shares para buffers binários
const share1 = wordsToBuffer(share1Words);
const share2 = wordsToBuffer(share2Words);

async function main() {
  try {
    // Combina as shares para recuperar o buffer secreto
    const secret = sss.combine([share1, share2]);
    
    // O buffer secreto é a entropia original, converte para mnemônico BIP39
    const mnemonic = bip39.entropyToMnemonic(secret.toString('hex'));
    
    console.log('Mnemônico recuperado:', mnemonic);
    
    if (!bip39.validateMnemonic(mnemonic)) {
      console.error('Mnemônico inválido!');
      return;
    }
    
    // Derivar seed do mnemônico
    const seed = await bip39.mnemonicToSeed(mnemonic);
    
    // Derivar chave e endereço usando derivação padrão do desafio m/84'/0'/0'/0/0 (SegWit)
    const root = bitcoin.bip32.fromSeed(seed);
    const child = root.derivePath("m/84'/0'/0'/0/0");
    const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey });
    
    console.log('Endereço Bitcoin derivado:', address);
  } catch (err) {
    console.error('Erro na recomposição:', err);
  }
}

main();
