"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const elliptic_1 = __importDefault(require("elliptic"));
const EC = elliptic_1.default.ec;
const ec = new EC("secp256k1");
// Generate a key pair
const key = ec.genKeyPair();
const publicKey = key.getPublic("hex");
const privateKey = key.getPrivate("hex");
console.log("Private Key:", privateKey);
console.log("Public Key:", publicKey);
console.log(key);
