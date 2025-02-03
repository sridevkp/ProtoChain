import { SHA256 } from "crypto-js";
import elliptic from "elliptic";
const EC = elliptic.ec;
const ec = new EC("secp256k1");

class Transaction {
    from: string | null;
    to: string;
    amt: number;
    signature?: string;

    constructor(from: string | null, to: string, amt: number) {
        this.from = from;
        this.to = to;
        this.amt = amt;
    }

    calculateHash(): string {
        return SHA256(this.from + this.to + this.amt).toString();
    }

    signTransaction(signKey: elliptic.ec.KeyPair): void {
        if (signKey.getPublic("hex") !== this.from) {
            throw new Error("You can't sign transactions for other wallets");
        }

        const hash = this.calculateHash();
        const sign = signKey.sign(hash, "base64");
        this.signature = sign.toDER("hex");
    }

    isValid(): boolean {
        if (this.from === null) return true;

        if (!this.signature || this.signature.length === 0) {
            return false;
        }

        try {
            const publicKey = ec.keyFromPublic(this.from, "hex");
            return publicKey.verify(this.calculateHash(), this.signature);
        } catch (error) {
            console.error("Invalid public key:", error);
            return false; 
        }
    }
}

export default Transaction
