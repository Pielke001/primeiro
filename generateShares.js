import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bip39 = require('bip39');
const sss = require('shamirs-secret-sharing');

// Seu mnemônico original (12 palavras)
const originalMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'; 
// <- Substitua pelo seu mnemônico real (o do desafio se tiver)

// Função para transformar o buffer da share em array de palavras (dividir string em blocos de 4 caracteres)
function bufferToWords(buffer) {
  const str = buffer.toString('utf8');
  // O Bitaps divide as shares em palavras de 4 caracteres (exemplo), mas no desafio tem 12 palavras de 4-6 caracteres
  // Como no desafio as palavras são reais, a conversão é customizada. Aqui só vamos dividir em grupos de palavras
  // Para simplificar, vamos dividir em palavras de 4 caracteres
  const words = [];
  for(let i = 0; i < str.length; i += 4){
    words.push(str.substring(i, i+4));
  }
  return words;
}

function printShare(name, buffer) {
  const words = bufferToWords(buffer);
  console.log(`${name}:`);
  console.log(words.join(' '));
  console.log('');
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
