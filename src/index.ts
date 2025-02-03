import BlockChain from "./BlockChain";
import Transaction from "./Transaction";
import Wallet from "./Wallet"

const httpPort: number = 3001;
const p2pPort: number = 6001;

const user1 = Wallet.loadWalletFromFile("key.json");
const user2 = Wallet.createNewWallet();

console.log( user1, user2 );

const titusCoin = new BlockChain();
titusCoin.initNetworkPeer( httpPort, p2pPort );


const txn =  new Transaction( user1.walletAddr, user2.walletAddr, 5 );
user1.sign( txn );
console.log( txn )

try{
    titusCoin.createTransaction( txn );
}
catch( e ){
    console.error(e)
}

// titusCoin.mineCurrentTransaction(walletAddr)

// console.log( JSON.stringify(titusCoin, null, 2) )
// console.log( titusCoin.getBalance(walletAddr) );
