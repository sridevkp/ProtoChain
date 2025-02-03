import Transaction from "./Transaction";

const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const fs = require('fs');

class Wallet {
    private key: any;
    public walletAddr: string;
  
    constructor(privKey?: string) {
      if (privKey) {
        this.key = ec.keyFromPrivate(privKey);
      } else {
        this.key = ec.genKeyPair();
      }
      
      this.walletAddr = this.key.getPublic('hex');
    }
  
    static createNewWallet(): Wallet {
      const newWallet = new Wallet();
      return newWallet;
    }

    sign( txn : Transaction ) : void {
      txn.signTransaction( this.key );
    }
  
    getPublicAddress(): string {
      return this.walletAddr;
    }
  
    getPrivateKey(): string {
      return this.key.getPrivate('hex');
    }
  
    saveWalletToFile( filename: string ): void {
      const data = { PRIV: this.getPrivateKey() };
      fs.writeFileSync(filename, JSON.stringify(data), 'utf8');
    }
  
    static loadWalletFromFile( filename: string ): Wallet {
      const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
      return new Wallet(data.PRIV);
    }
  }
  
  export default Wallet;