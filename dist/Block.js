"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_js_1 = require("crypto-js");
class Block {
    constructor(timestamp, transactions) {
        this.difficulty = 0;
        this.timestamp = timestamp || Date.now();
        this.previousHash = "";
        this.hash = "";
        this.transactions = transactions;
        this.nonce = 0;
        this.calculateHash();
    }
    getHash() {
        return (0, crypto_js_1.SHA256)(this.nonce + this.idx + this.previousHash + this.timestamp + JSON.stringify(this.transactions)).toString();
    }
    calculateHash() {
        this.hash = this.getHash();
    }
    mineBlock(difficulty) {
        const dString = "0".repeat(difficulty);
        while (!this.hash.startsWith(dString)) {
            this.calculateHash();
            this.nonce++;
        }
        console.log(`Block mined: ${this.hash}`);
    }
    isValid() {
        if (this.transactions)
            for (const tx of this.transactions) {
                if (!tx.isValid()) {
                    return false;
                }
            }
        return true;
    }
    isValidTimestamp(newBlock, previousBlock) {
        return (previousBlock.timestamp - 60 < newBlock.timestamp)
            && newBlock.timestamp - 60 < Date.now();
    }
    ;
}
Block.isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.idx + 1 !== newBlock.idx) {
        console.log('invalid index');
        return false;
    }
    else if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previoushash');
        return false;
    }
    else if (newBlock.getHash() !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + ' ' + typeof newBlock.getHash());
        console.log('invalid hash: ' + newBlock.getHash() + ' ' + newBlock.hash);
        return false;
    }
    return true;
};
exports.default = Block;
