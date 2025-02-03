# My Layer 1 Blockchain

A simple Layer 1 blockchain implementation for learning purposes. This project helps understand core blockchain concepts like transactions, blocks, proof-of-work, and peer-to-peer networking.

## Features

- 🏗️ **Block Structure** – Each block contains transactions, a timestamp, and a hash.
- 🔗 **Blockchain** – Maintains a chain of blocks with cryptographic integrity.
- ⛏️ **Proof-of-Work** – Implements a basic mining mechanism.
- 🤝 **Peer-to-Peer Network** – Nodes communicate and sync the blockchain.
- 🔑 **Wallet & Transactions** – Uses public/private key cryptography for transactions.

## Installation

```sh
# Clone the repository
git clone https://github.com/sridevkp/ProtoChain.git
cd ProtoChain

# Install dependencies
npm install  # or yarn install
```

## Usage

```sh
# Start the blockchain node
npm start

# Mine a new block
curl -X POST http://localhost:3001/mineBlock

# View the blockchain
curl http://localhost:3001/blocks
```

## API Endpoints

| Method | Endpoint     | Description          |
| ------ | ------------ | -------------------- |
| GET    | `/blocks`    | Get blockchain data  |
| POST   | `/mineBlock` | Mine a new block     |
| GET    | `/peers`     | List connected peers |
| POST   | `/addPeer`   | Connect to a peer    |

## TODO

 Transaction relaying
 
 Wallet User Interface
 
 Blockchain explorer
 
 


