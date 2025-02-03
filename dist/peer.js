"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const ws_1 = __importStar(require("ws"));
const Block_1 = __importDefault(require("./Block"));
var MessageType;
(function (MessageType) {
    MessageType[MessageType["QUERY_LATEST"] = 0] = "QUERY_LATEST";
    MessageType[MessageType["QUERY_ALL"] = 1] = "QUERY_ALL";
    MessageType[MessageType["RESPONSE_BLOCKCHAIN"] = 2] = "RESPONSE_BLOCKCHAIN";
})(MessageType || (MessageType = {}));
class NetworkPeer {
    constructor(chain, httpPort, p2pPort) {
        this.sockets = [];
        this.chain = chain;
        this.initHttpServer(httpPort);
        this.initP2PServer(p2pPort);
    }
    getSockets() {
        return this.sockets;
    }
    write(ws, message) {
        ws.send(JSON.stringify(message));
    }
    broadcast(message) {
        this.sockets.forEach((socket) => this.write(socket, message));
    }
    queryChainLengthMsg() {
        return { type: MessageType.QUERY_LATEST, data: null };
    }
    queryAllMsg() {
        return { type: MessageType.QUERY_ALL, data: null };
    }
    responseChainMsg() {
        return { type: MessageType.RESPONSE_BLOCKCHAIN, data: JSON.stringify(this.chain) };
    }
    responseLatestMsg() {
        return { type: MessageType.RESPONSE_BLOCKCHAIN, data: JSON.stringify([this.chain.getLatestBlock()]) };
    }
    broadcastLatest() {
        this.broadcast(this.responseLatestMsg());
    }
    initHttpServer(myHttpPort) {
        this.app = (0, express_1.default)();
        this.app.use(body_parser_1.default.json());
        this.app.get('/blocks', (req, res) => {
            res.send(this.chain.blocks);
        });
        this.app.post('/mineBlock', (req, res) => {
            const newBlock = new Block_1.default(Date.now(), null); // Replace with actual block mining logic
            res.send(newBlock);
        });
        this.app.get('/peers', (req, res) => {
            res.send(this.getSockets().map((s) => `${s._socket.remoteAddress}:${s._socket.remotePort}`));
        });
        this.app.post('/addPeer', (req, res) => {
            this.connectToPeers(req.body.peer);
            res.sendStatus(200);
        });
        this.app.listen(myHttpPort, () => {
            console.log(`Listening on HTTP port: ${myHttpPort}`);
        });
    }
    initP2PServer(p2pPort) {
        this.wsServer = new ws_1.Server({ port: p2pPort });
        this.wsServer.on('connection', (ws) => {
            this.initConnection(ws);
        });
        console.log(`Listening on WebSocket P2P port: ${p2pPort}`);
    }
    initConnection(ws) {
        this.sockets.push(ws);
        this.initMessageHandler(ws);
        this.initErrorHandler(ws);
        this.write(ws, this.queryChainLengthMsg());
    }
    initMessageHandler(ws) {
        ws.on('message', (data) => {
            const message = JSONToObject(data);
            if (!message) {
                console.log(`Could not parse received JSON message: ${data}`);
                return;
            }
            console.log(`Received message: ${JSON.stringify(message)}`);
            switch (message.type) {
                case MessageType.QUERY_LATEST:
                    this.write(ws, this.responseLatestMsg());
                    break;
                case MessageType.QUERY_ALL:
                    this.write(ws, this.responseChainMsg());
                    break;
                case MessageType.RESPONSE_BLOCKCHAIN:
                    const receivedBlocks = JSONToObject(message.data);
                    if (!receivedBlocks) {
                        console.log('Invalid blocks received:', message.data);
                        break;
                    }
                    this.handleBlockchainResponse(receivedBlocks);
                    break;
            }
        });
    }
    handleBlockchainResponse(receivedBlocks) {
        if (receivedBlocks.length === 0) {
            console.log('Received blockchain size of 0');
            return;
        }
        const latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
        const latestBlockHeld = this.chain.getLatestBlock();
        if (latestBlockReceived.idx > latestBlockHeld.idx) {
            console.log(`Blockchain possibly behind. We have: ${latestBlockHeld.idx}, Peer has: ${latestBlockReceived.idx}`);
            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                if (this.chain.addBlock(latestBlockReceived)) {
                    this.broadcast(this.responseLatestMsg());
                }
            }
            else if (receivedBlocks.length === 1) {
                console.log('Querying peer for full blockchain...');
                this.broadcast(this.queryAllMsg());
            }
            else {
                console.log('Received blockchain is longer than current. Replacing...');
                this.chain.replaceChain(receivedBlocks);
            }
        }
        else {
            console.log('Received blockchain is not longer. No action taken.');
        }
    }
    initErrorHandler(ws) {
        const closeConnection = (myWs) => {
            console.log(`Connection failed: ${myWs.url}`);
            this.sockets = this.sockets.filter((s) => s !== myWs);
        };
        ws.on('close', () => closeConnection(ws));
        ws.on('error', () => closeConnection(ws));
    }
    connectToPeers(newPeer) {
        const ws = new ws_1.default(newPeer);
        ws.on('open', () => this.initConnection(ws));
        ws.on('error', () => console.log('Connection failed'));
    }
}
const JSONToObject = (data) => {
    try {
        return JSON.parse(data);
    }
    catch (e) {
        console.error('JSON parsing error:', e);
        return null;
    }
};
exports.default = NetworkPeer;
