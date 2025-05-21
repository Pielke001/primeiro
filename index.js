import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const sss = require('shamirs-secret-sharing');

// As shares do seu desafio, em palavras (arrays)
const sharesWords = [
  ['sessão', 'charuto', 'uva', 'alegre', 'útil', 'agitar', 'fatal', 'pensamento', 'muito', 'qualquer', 'braço', 'alheio'],
  ['relógio', 'fresco', 'segurança', 'campo', 'cuidado', 'esforço', 'gorila', 'velocidade', 'plástico', 'comum', 'tomate', 'eco']
];

// Função para converter array de palavras em Buffer (bytes)
function wordsToBuffer(words) {
  // Junta as palavras com espaço para formar o mnemônico parcial
  const phrase = words.join(' ');
  // Converte para buffer utf8
  return Buffer.from(phrase, 'utf8');
}

async function main() {
  try {
    // Transforma as shares em buffers
    const sharesBuffers = sharesWords.map(wordsToBuffer);
    
    // Usa Shamir para recompor o segredo original (mnemônico completo) a partir das shares
    const secret = sss.combine(sharesBuffers);

    // O segredo é um buffer que representa o mnemônico completo
    const mnemonic = secret.toString('utf8');

    console.log('Mnemônico recuperado:', mnemonic);

    // Valida o mnemônico recomposto
    if (!bip39.validateMnemonic(mnemonic)) {
      console.error('Mnemônico inválido! Verifique as shares.');
      return;
    }

    // Deriva a seed BIP39 a partir do mnemônico
    const seed = await bip39.mnemonicToSeed(mnemonic);

    // Deriva a chave BIP32 a partir da seed
    const root = bitcoin.bip32.fromSeed(seed);

    // Deriva a chave na path BIP84 padrão para SegWit Native (m/84'/0'/0'/0/0)
    const child = root.derivePath("m/84'/0'/0'/0/0");

    // Obtém o endereço P2WPKH (SegWit Native Bech32)
    const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey });

    console.log('Endereço Bitcoin derivado:', address);

  } catch (err) {
    console.error('Erro durante recomposição:', err);
  }
}

main();


main();


