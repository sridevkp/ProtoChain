const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const Block = require("./Block");
const BlockChain = require("./BlockChain");
const Transaction = require("./Transaction");

const key = require("./key.json")

const mykey = ec.keyFromPrivate( key.PRIV );
const walletAddr = mykey.getPublic('hex');

const bjuCoin = new BlockChain();

const tx1 =  new Transaction( walletAddr, "other", 5 );
tx1.signTransaction(mykey)
bjuCoin.createTransaction( tx1 );

bjuCoin.mineCurrentTransaction(walletAddr)

// console.log( JSON.stringify(bjuCoin, null, 2) )
console.log( bjuCoin.getBalance(walletAddr) );
