"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_js_1 = require("crypto-js");
const elliptic_1 = __importDefault(require("elliptic"));
const EC = elliptic_1.default.ec;
const ec = new EC("secp256k1");
class Transaction {
    constructor(from, to, amt) {
        this.from = from;
        this.to = to;
        this.amt = amt;
    }
    calculateHash() {
        return (0, crypto_js_1.SHA256)(this.from + this.to + this.amt).toString();
    }
    signTransaction(signKey) {
        if (signKey.getPublic("hex") !== this.from) {
            throw new Error("You can't sign transactions for other wallets");
        }
        const hash = this.calculateHash();
        const sign = signKey.sign(hash, "base64");
        this.signature = sign.toDER("hex");
    }
    isValid() {
        if (this.from === null)
            return true;
        if (!this.signature || this.signature.length === 0) {
            return false;
        }
        try {
            const publicKey = ec.keyFromPublic(this.from, "hex");
            return publicKey.verify(this.calculateHash(), this.signature);
        }
        catch (error) {
            console.error("Invalid public key:", error);
            return false; // Return false if key parsing fails
        }
    }
}
exports.default = Transaction;
