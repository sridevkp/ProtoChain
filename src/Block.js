const SHA256 = require("crypto-js/sha256");

class Block{
    constructor( timestamp, transactions ){
        this.timestamp = timestamp | Date.now();
        this.previousHash = "";
        this.hash = ""
        this.transactions = transactions;
        this.nonce = 0;
        this.calcHash();
    }
    getHash(){
        return SHA256( this.nonce + this.previousHash + this.timestamp + JSON.stringify(this.transactions) ).toString()
    }
    calcHash(){
        this.hash = this.getHash();
    }

    mineBlock( difficulty ){
        const dString = Array(difficulty+1).join("0");
        while( this.hash.substring(0,difficulty) != dString ){
            this.calcHash()
            this.nonce ++;
        }
        console.log( `Block mined `+ this.hash )
    }

    valid(){
        for( const tx of this.transactions ){
            if( !tx.valid()){
                return false
            }
        }
    }
}

module.exports = Block