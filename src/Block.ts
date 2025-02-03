import { SHA256 } from "crypto-js";
import Transaction from "./Transaction";

class Block {
    timestamp: number;
    transactions: Transaction[] | null;
    previousHash: string;
    hash: string;
    nonce: number;
    idx!: number;
    difficulty: number = 0;

    constructor(timestamp: number, transactions: Transaction[] | null ) {
        this.timestamp = timestamp || Date.now();
        this.previousHash = "";
        this.hash = "";
        this.transactions = transactions;
        this.nonce = 0;
        this.calculateHash();
    }

    getHash(): string {
        return SHA256(
            this.nonce + this.idx + this.previousHash + this.timestamp + JSON.stringify(this.transactions)
        ).toString();
    }

    calculateHash(): void {
        this.hash = this.getHash();
    }

    mineBlock(difficulty: number): void {
        const dString = "0".repeat(difficulty);
        while (!this.hash.startsWith(dString)) {
            this.calculateHash();
            this.nonce++;
        }
        console.log(`Block mined: ${this.hash}`);
    }

    static isValidNewBlock = (newBlock: Block, previousBlock: Block) => {
        if (previousBlock.idx + 1 !== newBlock.idx) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('invalid previoushash');
            return false;
        } else if (newBlock.getHash() !== newBlock.hash) {
            console.log(typeof (newBlock.hash) + ' ' + typeof newBlock.getHash() );
            console.log('invalid hash: ' + newBlock.getHash() + ' ' + newBlock.hash);
            return false;
        }
        return true;
    };

    isValid(): boolean {
        if ( this.transactions )
        for (const tx of this.transactions) {
            if (!tx.isValid()) {
                return false;
            }
        }
        return true;
    }
    isValidTimestamp (newBlock: Block, previousBlock: Block): boolean {
        return ( previousBlock.timestamp - 60 < newBlock.timestamp )
            && newBlock.timestamp - 60 < Date.now();
    };
}

export default Block;
