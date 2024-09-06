const { SHA256 } = require("crypto-js");
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

class Transaction{
    constructor( from, to, amt ){
        this.from = from;
        this.to = to;
        this.amt = amt;
    }
    calcHash(){
        return SHA256( this.from + this.to + this.amt ).toString();
    }
    signTransaction( signKey ){
        if( signKey.getPublic('hex') !== this.from ){
            throw new Error("You cant sign tranx for other wallet");
        }

        const hash = this.calcHash();
        const sign = signKey.sign( hash, 'base64');
        this.signature = sign.toDER('hex');
    }

    valid(){
        if( this.from === null ) return true ;
        if( !this.signature || this.signature.length === 0 ){
            throw new Error("No signature in this tranx");
            // return false
        }

        const publicKey = ec.keyFromPublic( this.from, 'hex');
        return publicKey.verify( this.calcHash(), this.signature );
    }
}

module.exports = Transaction