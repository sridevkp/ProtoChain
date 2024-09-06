const Block = require("./Block");
const Transaction = require("./Transaction");
class BlockChain{
    constructor(){
        this.chain = [ this.genesisBlock() ];
        this.currentTransactions = []
        this.difficulty = 3;
    }
    genesisBlock(){
        return new Block( Date.now(), "Genesis", "0")
    }
    latest(){
        return this.chain[ this.chain.length -1]
    }
    valid(){
        for( let i = 1; i < this.chain.length; i++){
            const block = this.chain[i];
            const prevBlock = this.chain[i-1];
            
            if( ! block.valid() ) return false;
            if( block.hash != block.getHash() ) return false ;
            if( block.previousHash != prevBlock.hash ) return false;
        }
        return true;
    }
    getBalance( addr ){
        let balance = 0;
        for( const block of this.chain ){
            for( const transaction of block.transactions ){
                if( transaction.from == addr) 
                    balance -= transaction.amt;

                if( transaction.to == addr) 
                    balance += transaction.amt;
            }
        }   
        return balance;
    }
    createTransaction( tranx ){
        if( !tranx.from || !tranx.to  ){
            throw new Error("Transaction must include from and to addr");
        }
        if( !tranx.valid()){
            throw new Error("Invalid transaction");
        }
        this.currentTransactions.push( tranx );
    }
    mineCurrentTransaction( rewardAddr ){
        this.currentTransactions.push( new Transaction( null, rewardAddr, 1) )

        const block = new Block( null, this.currentTransactions );
        block.previousHash = this.latest().hash ;
        block.mineBlock( this.difficulty );

        this.chain.push( block ) ;
        this.currentTransactions = [];
    }
}
module.exports = BlockChain