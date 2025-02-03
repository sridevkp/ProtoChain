"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const BlockChain_1 = __importDefault(require("./BlockChain"));
const Transaction_1 = __importDefault(require("./Transaction"));
const Wallet_1 = __importDefault(require("./Wallet"));
// const mykey = ec.keyFromPrivate( localKey.PRIV );
// const walletAddr = mykey.getPublic('hex');
const httpPort = 3001;
const p2pPort = 6001;
const user1 = Wallet_1.default.loadWalletFromFile("key.json");
const user2 = Wallet_1.default.createNewWallet();
console.log(user1, user2);
const titusCoin = new BlockChain_1.default();
titusCoin.initNetworkPeer(httpPort, p2pPort);
const txn = new Transaction_1.default(user1.walletAddr, user2.walletAddr, 5);
user1.sign(txn);
console.log(txn);
try {
    titusCoin.createTransaction(txn);
}
catch (e) {
    console.error(e);
}
// bjuCoin.mineCurrentTransaction(walletAddr)
// console.log( JSON.stringify(bjuCoin, null, 2) )
// console.log( bjuCoin.getBalance(walletAddr) );
