import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const bip39 = require('bip39');
const bitcoin = require('bitcoinjs-lib');
const sss = require('shamirs-secret-sharing');

// Essas são as shares do desafio, convertidas para hex (garantindo bytes corretos)
const share1Hex = Buffer.from(
  'sessãócharutouvaalegreútilagitarrfatalpensamentomuitoqualquerbraçoalheio',
  'utf8'
).toString('hex');

const share2Hex = Buffer.from(
  'relógiofrescesegurançacampocuidadoesforçogorilavelocidadeplásticocomumtomateeco',
  'utf8'
).toString('hex');

// Agora convertemos elas de volta para Buffer em hex antes de usar
const share1 = Buffer.from(share1Hex, 'hex');
const share2 = Buffer.from(share2Hex, 'hex');

async function main() {
  try {
    // Combinar as shares para recuperar segredo
    const secret = sss.combine([share1, share2]);

    // Segredo para string UTF8 = mnemônico
    const mnemonic = secret.toString('utf8');

    console.log('Mnemônico recuperado:', mnemonic);

    // Validar mnemônico
    if (!bip39.validateMnemonic(mnemonic)) {
      console.error('Mnemônico inválido!');
      return;
    }

    // Gerar seed e derivar chave e endereço BTC (P2WPKH - segwit)
    const seed = await bip39.mnemonicToSeed(mnemonic);
    const root = bitcoin.bip32.fromSeed(seed);
    const child = root.derivePath("m/84'/0'/0'/0/0");
    const { address } = bitcoin.payments.p2wpkh({ pubkey: child.publicKey });

    console.log('Endereço BTC derivado:', address);
  } catch (err) {
    console.error('Erro na recomposição:', err);
  }
}

main();

