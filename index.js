import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const sss = require('shamirs-secret-sharing');

// As duas shares do desafio (transforme as palavras em uma string só, sem espaços)
// Depois converta para Buffer com UTF-8.

const share1 = Buffer.from(
  'sessãocharutouvaalegreútilagitarfatalpensamentomuitoqualquerbraçoalheio',
  'utf8'
);

const share2 = Buffer.from(
  'relógiofrescesegurançacampocuidadoesforçogorilavelocidadeplásticocomumtomateeco',
  'utf8'
);

async function main() {
  try {
    // Combinar shares para recuperar segredo (buffer)
    const secret = sss.combine([share1, share2]);

    // Converter segredo para string (mnemônico)
    const mnemonic = secret.toString('utf8');

    console.log('Mnemônico recuperado:', mnemonic);

    // Validar mnemônico
    if (!bip39.validateMnemonic(mnemonic)) {
      console.error('Mnemônico inválido!');
      return;
    }

    // Derivar seed e chave BTC
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bitcoin.bip32.fromSeed(seed);

    // Caminho BIP84 para segwit P2WPKH
    const child = root.derivePath("m/84'/0'/0'/0/0");
    const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey });

    console.log('Endereço BTC derivado:', address);
  } catch (err) {
    console.error('Erro na recomposição:', err);
  }
}

main();

    
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
