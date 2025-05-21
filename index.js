import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bip39 = require('bip39');
const sss = require('shamirs-secret-sharing');

// Suas shares originais como arrays de palavras:
const share1Words = [
  'sessão', 'charuto', 'uva', 'alegre', 'útil', 'agitar',
  'fatal', 'pensamento', 'muito', 'qualquer', 'braço', 'alheio'
];

const share2Words = [
  'relógio', 'fresco', 'segurança', 'campo', 'cuidado', 'esforço',
  'gorila', 'velocidade', 'plástico', 'comum', 'tomate', 'eco'
];

// Função que junta as palavras em string e cria Buffer UTF-8
function wordsToBuffer(words) {
  const phrase = words.join(' ');
  return Buffer.from(phrase, 'utf8');
}

// Transforma cada share em buffer
const share1 = wordsToBuffer(share1Words);
const share2 = wordsToBuffer(share2Words);

async function main() {
  try {
    // Recombina as shares para obter o buffer original do mnemônico
    const secretBuffer = sss.combine([share1, share2]);
    
    // Transforma buffer em string UTF-8, que deve ser o mnemônico
    const mnemonic = secretBuffer.toString('utf8');
    
    console.log('Mnemônico recuperado:', mnemonic);
    
    // Valida o mnemônico usando bip39
    if (!bip39.validateMnemonic(mnemonic)) {
      console.error('Mnemônico inválido! Cheque as shares e a recombinação.');
      return;
    }
    
    console.log('Mnemônico válido!');
    
    // Opcional: derivar a seed (se quiser)
    const seed = await bip39.mnemonicToSeed(mnemonic);
    console.log('Seed derivada com sucesso (hex):', seed.toString('hex').slice(0, 64), '...');
    
  } catch (error) {
    console.error('Erro na recomposição:', error);
  }
}

main();

