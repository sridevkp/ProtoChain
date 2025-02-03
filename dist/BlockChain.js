"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Transaction_1 = __importDefault(require("./Transaction"));
const Block_1 = __importDefault(require("./Block"));
const Peer_1 = __importDefault(require("./Peer"));
// in seconds
const BLOCK_GENERATION_INTERVAL = 10;
// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
class BlockChain {
    constructor() {
        this.genesisBlock = new Block_1.default(Date.now(), null);
        this.blocks = [this.genesisBlock];
        this.currentTransactions = [];
        this.difficulty = 3;
    }
    initNetworkPeer(httpPort, p2pPort) {
        this.peer = new Peer_1.default(this, httpPort, p2pPort);
    }
    getLatestBlock() {
        return this.blocks[this.blocks.length - 1];
    }
    isValid() {
        for (let i = 1; i < this.blocks.length; i++) {
            const block = this.blocks[i];
            const prevBlock = this.blocks[i - 1];
            if (!block.isValid())
                return false;
            if (block.hash !== block.getHash())
                return false;
            if (block.previousHash !== prevBlock.hash)
                return false;
        }
        return true;
    }
    isValidNewBlock(newBlock) {
        const previousBlock = this.getLatestBlock();
        if (previousBlock.hash !== newBlock.previousHash) {
            console.log("Invalid previousHash");
            return false;
        }
        if (newBlock.getHash() !== newBlock.hash) {
            console.log(`Invalid hash: ${newBlock.calculateHash()} ${newBlock.hash}`);
            return false;
        }
        return true;
    }
    isValidChain(chainToValidate) {
        const isValidGenesis = (block) => {
            return JSON.stringify(block) === JSON.stringify(this.genesisBlock);
        };
        if (!isValidGenesis(chainToValidate[0])) {
            return false;
        }
        for (let i = 1; i < chainToValidate.length; i++) {
            if (!Block_1.default.isValidNewBlock(chainToValidate[i], chainToValidate[i - 1])) {
                return false;
            }
        }
        return true;
    }
    ;
    replaceChain(newChain) {
        if (this.isValidChain(newChain) && newChain.length > this.blocks.length) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.blocks = newChain;
            this.peer.broadcastLatest();
        }
        else {
            console.log('Received blockchain invalid');
        }
    }
    ;
    getBalance(addr) {
        let balance = 0;
        for (const block of this.blocks) {
            if (block.transactions)
                for (const transaction of block.transactions) {
                    if (transaction.from === addr)
                        balance -= transaction.amt;
                    if (transaction.to === addr)
                        balance += transaction.amt;
                }
        }
        return balance;
    }
    createTransaction(tranx) {
        if (!tranx.from || !tranx.to) {
            throw new Error("Transaction must include from and to addresses");
        }
        if (!tranx.isValid()) {
            throw new Error("Invalid transaction");
        }
        this.currentTransactions.push(tranx);
    }
    addBlock(block) {
        return true;
    }
    mineCurrentTransaction(rewardAddr) {
        this.currentTransactions.push(new Transaction_1.default(null, rewardAddr, 1));
        const block = new Block_1.default(Date.now(), this.currentTransactions);
        block.previousHash = this.getLatestBlock().hash;
        block.mineBlock(this.difficulty);
        this.blocks.push(block);
        this.currentTransactions = [];
    }
    calculateDifficulty() {
        const getAdjustedDifficulty = (latestBlock) => {
            const prevAdjustmentBlock = this.blocks[this.blocks.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
            const timeExpected = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
            const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
            if (timeTaken < timeExpected / 2) {
                return prevAdjustmentBlock.difficulty + 1;
            }
            else if (timeTaken > timeExpected * 2) {
                return prevAdjustmentBlock.difficulty - 1;
            }
            else {
                return prevAdjustmentBlock.difficulty;
            }
        };
        const latestBlock = this.getLatestBlock();
        if (latestBlock.idx % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.idx !== 0) {
            return getAdjustedDifficulty(latestBlock);
        }
        else {
            return this.difficulty;
        }
    }
    ;
}
exports.default = BlockChain;
