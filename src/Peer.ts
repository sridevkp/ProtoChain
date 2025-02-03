import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import WebSocket, { Server } from 'ws';
import Block from './Block';
import BlockChain from './BlockChain';

enum MessageType {
    QUERY_LATEST = 0,
    QUERY_ALL = 1,
    RESPONSE_BLOCKCHAIN = 2,
}

interface Message {
    type: MessageType;
    data: any;
}

class NetworkPeer {
    private app!: Application;
    private wsServer!: Server;
    private sockets: WebSocket[] = [];
    private chain: BlockChain;

    constructor(chain: BlockChain, httpPort: number, p2pPort: number) {
        this.chain = chain;
        this.initHttpServer(httpPort);
        this.initP2PServer(p2pPort);
    }

    private getSockets(): WebSocket[] {
        return this.sockets;
    }

    private write(ws: WebSocket, message: Message): void {
        ws.send(JSON.stringify(message));
    }

    private broadcast(message: Message): void {
        this.sockets.forEach((socket) => this.write(socket, message));
    }

    private queryChainLengthMsg(): Message {
        return { type: MessageType.QUERY_LATEST, data: null };
    }

    private queryAllMsg(): Message {
        return { type: MessageType.QUERY_ALL, data: null };
    }

    private responseChainMsg(): Message {
        return { type: MessageType.RESPONSE_BLOCKCHAIN, data: JSON.stringify(this.chain) };
    }

    private responseLatestMsg(): Message {
        return { type: MessageType.RESPONSE_BLOCKCHAIN, data: JSON.stringify([this.chain.getLatestBlock()]) };
    }

    public broadcastLatest(): void {
        this.broadcast(this.responseLatestMsg());
    }

    private initHttpServer(myHttpPort: number): void {
        this.app = express();
        this.app.use(bodyParser.json());

        this.app.get('/blocks', (req: Request, res: Response) => {
            res.send(this.chain.blocks);
        });

        this.app.post('/mineBlock', (req: Request, res: Response) => {
            const newBlock: Block = new Block(Date.now(), null); // Replace with actual block mining logic
            res.send(newBlock);
        });

        this.app.get('/peers', (req: Request, res: Response) => {
            res.send(
                this.getSockets().map(
                    (s: any) => `${s._socket.remoteAddress}:${s._socket.remotePort}`
                )
            );
        });

        this.app.post('/addPeer', (req: Request, res: Response) => {
            this.connectToPeers(req.body.peer);
            res.sendStatus(200);
        });

        this.app.listen(myHttpPort, () => {
            console.log(`Listening on HTTP port: ${myHttpPort}`);
        });
    }

    private initP2PServer(p2pPort: number): void {
        this.wsServer = new Server({ port: p2pPort });
        this.wsServer.on('connection', (ws: WebSocket) => {
            this.initConnection(ws);
        });
        console.log(`Listening on WebSocket P2P port: ${p2pPort}`);
    }

    private initConnection(ws: WebSocket): void {
        this.sockets.push(ws);
        this.initMessageHandler(ws);
        this.initErrorHandler(ws);
        this.write(ws, this.queryChainLengthMsg());
    }

    private initMessageHandler(ws: WebSocket): void {
        ws.on('message', (data: string) => {
            const message: Message | null = JSONToObject<Message>(data);
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
                    const receivedBlocks: Block[] | null = JSONToObject<Block[]>(message.data);
                    if (!receivedBlocks) {
                        console.log('Invalid blocks received:', message.data);
                        break;
                    }
                    this.handleBlockchainResponse(receivedBlocks);
                    break;
            }
        });
    }

    private handleBlockchainResponse(receivedBlocks: Block[]): void {
        if (receivedBlocks.length === 0) {
            console.log('Received blockchain size of 0');
            return;
        }
        const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
        const latestBlockHeld: Block = this.chain.getLatestBlock();

        if (latestBlockReceived.idx > latestBlockHeld.idx) {
            console.log(`Blockchain possibly behind. We have: ${latestBlockHeld.idx}, Peer has: ${latestBlockReceived.idx}`);

            if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
                if (this.chain.addBlock(latestBlockReceived)) {
                    this.broadcast(this.responseLatestMsg());
                }
            } else if (receivedBlocks.length === 1) {
                console.log('Querying peer for full blockchain...');
                this.broadcast(this.queryAllMsg());
            } else {
                console.log('Received blockchain is longer than current. Replacing...');
                this.chain.replaceChain(receivedBlocks);
            }
        } else {
            console.log('Received blockchain is not longer. No action taken.');
        }
    }

    private initErrorHandler(ws: WebSocket): void {
        const closeConnection = (myWs: WebSocket) => {
            console.log(`Connection failed: ${myWs.url}`);
            this.sockets = this.sockets.filter((s) => s !== myWs);
        };

        ws.on('close', () => closeConnection(ws));
        ws.on('error', () => closeConnection(ws));
    }

    public connectToPeers(newPeer: string): void {
        const ws: WebSocket = new WebSocket(newPeer);
        ws.on('open', () => this.initConnection(ws));
        ws.on('error', () => console.log('Connection failed'));
    }
}

const JSONToObject = <T>(data: string): T | null => {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error('JSON parsing error:', e);
        return null;
    }
};

export default NetworkPeer;
