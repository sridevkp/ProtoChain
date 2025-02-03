import Transaction from "./Transaction";
import Block from "./Block";
import NetworkPeer from "./Peer";

// in seconds
const BLOCK_GENERATION_INTERVAL: number = 10;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

class BlockChain {
    blocks: Block[];
    currentTransactions: Transaction[];
    difficulty: number;
    genesisBlock : Block;
    peer! : NetworkPeer;

    constructor() {
        this.genesisBlock = new Block( Date.now(), null );
        this.blocks = [ this.genesisBlock ];
        this.currentTransactions = [];
        this.difficulty = 3;
    }

    initNetworkPeer( httpPort: number, p2pPort: number ) : void {
        this.peer = new NetworkPeer( this, httpPort, p2pPort )
    }

    getLatestBlock(): Block {
        return this.blocks[this.blocks.length - 1];
    }

    isValid(): boolean {
        for (let i = 1; i < this.blocks.length; i++) {
            const block = this.blocks[i];
            const prevBlock = this.blocks[i - 1];

            if (!block.isValid()) return false;
            if (block.hash !== block.getHash()) return false;
            if (block.previousHash !== prevBlock.hash) return false;
        }
        return true;
    }

    isValidNewBlock(newBlock: Block ): boolean {
        const previousBlock = this.getLatestBlock() ;

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

    isValidChain (chainToValidate: Block[]): boolean {
        const isValidGenesis = (block: Block): boolean => {
            return JSON.stringify(block) === JSON.stringify(this.genesisBlock);
        };
    
        if (!isValidGenesis(chainToValidate[0])) {
            return false;
        }
    
        for (let i = 1; i < chainToValidate.length; i++) {
            if (!Block.isValidNewBlock(chainToValidate[i], chainToValidate[i - 1])) {
                return false;
            }
        }
        return true;
    };

    replaceChain(newChain: Block[]) {
        if (this.isValidChain(newChain) && newChain.length > this.blocks.length) {
            console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
            this.blocks = newChain;
            this.peer.broadcastLatest();
        } else {
            console.log('Received blockchain invalid');
        }
    };

    getBalance(addr: string): number {
        let balance = 0;
        for (const block of this.blocks) {
            if( block.transactions )
            for (const transaction of block.transactions) {
                if (transaction.from === addr) balance -= transaction.amt;
                if (transaction.to === addr) balance += transaction.amt;
            }
        }
        return balance;
    }

    createTransaction(tranx: Transaction): void {
        if (!tranx.from || !tranx.to) {
            throw new Error("Transaction must include from and to addresses");
        }
        if (!tranx.isValid()) {
            throw new Error("Invalid transaction");
        }
        this.currentTransactions.push(tranx);
    }

    addBlock(block: Block) : boolean {
        return true;
    }

    mineCurrentTransaction(rewardAddr: string): void {
        this.currentTransactions.push(new Transaction(null, rewardAddr, 1));

        const block = new Block(Date.now(), this.currentTransactions);
        block.previousHash = this.getLatestBlock().hash;
        block.mineBlock(this.difficulty);

        this.blocks.push(block);
        this.currentTransactions = [];
    }

    calculateDifficulty (): number {
        const getAdjustedDifficulty = (latestBlock: Block) => {
            const prevAdjustmentBlock: Block = this.blocks[this.blocks.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
            const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
            const timeTaken: number = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
            if (timeTaken < timeExpected / 2) {
                return prevAdjustmentBlock.difficulty + 1;
            } else if (timeTaken > timeExpected * 2) {
                return prevAdjustmentBlock.difficulty - 1;
            } else {
                return prevAdjustmentBlock.difficulty;
            }
        };

        const latestBlock: Block = this.getLatestBlock();
        if (latestBlock.idx % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.idx !== 0) {
            return getAdjustedDifficulty(latestBlock);
        } else {
            return this.difficulty;
        }
    };
}

export default BlockChain;
