import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const sss = require('shamirs-secret-sharing');

// Essas são suas "shares", mas elas precisam estar em Buffer (bytes).
// Como você tinha as palavras, vou mostrar aqui como transformar strings em buffer.

const share1 = Buffer.from('sessãócharutouvaalegreútilagitarrfatalpensamentomuitoqualquerbraçoalheio');
const share2 = Buffer.from('relógiofrescesegurançacampocuidadoesforçogorilavelocidadeplásticocomumtomateeco');

async function main() {
  try {
    // Combine as shares para recuperar o segredo (buffer)
    const secret = sss.combine([share1, share2]);
    
    // Transformar o segredo (buffer) em string do mnemônico
    const mnemonic = secret.toString('utf8');
    
    console.log('Mnemônico recuperado:', mnemonic);
    
    // Validar o mnemônico
    if (!bip39.validateMnemonic(mnemonic)) {
      console.error('Mnemônico inválido!');
      return;
    }
    
    // Derivar a seed
    const seed = await bip39.mnemonicToSeed(mnemonic);
    
    // Derivar a chave e endereço bitcoin
    const root = bitcoin.bip32.fromSeed(seed);
    const child = root.derivePath("m/44'/0'/0'/0/0");
    const { address } = bitcoin.payments.p2pkh({ pubkey: child.publicKey });
    
    console.log('Endereço Bitcoin derivado:', address);
  } catch (err) {
    console.error('Erro na recomposição:', err);
  }
}

main();
