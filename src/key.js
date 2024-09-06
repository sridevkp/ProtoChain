var EC = require('elliptic').ec;

var ec = new EC('secp256k1');

var key = ec.genKeyPair();

console.log(key)