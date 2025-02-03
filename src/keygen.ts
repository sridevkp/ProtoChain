import elliptic from "elliptic";

const EC = elliptic.ec;
const ec = new EC("secp256k1");

// Generate a key pair
const key = ec.genKeyPair();
const publicKey = key.getPublic("hex");
const privateKey = key.getPrivate("hex");

console.log("Private Key:", privateKey);
console.log("Public Key:", publicKey);
console.log(key);
