"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const fs = require('fs');
class Wallet {
    constructor(privKey) {
        if (privKey) {
            this.key = ec.keyFromPrivate(privKey);
        }
        else {
            this.key = ec.genKeyPair();
        }
        this.walletAddr = this.key.getPublic('hex');
    }
    static createNewWallet() {
        const newWallet = new Wallet();
        return newWallet;
    }
    sign(txn) {
        txn.signTransaction(this.key);
    }
    getPublicAddress() {
        return this.walletAddr;
    }
    getPrivateKey() {
        return this.key.getPrivate('hex');
    }
    saveWalletToFile(filename) {
        const data = { PRIV: this.getPrivateKey() };
        fs.writeFileSync(filename, JSON.stringify(data), 'utf8');
    }
    static loadWalletFromFile(filename) {
        const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
        return new Wallet(data.PRIV);
    }
}
exports.default = Wallet;
