# Carbon Credit Marketplace DApp

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Introduction

Welcome to the Carbon Credit Marketplace DApp! This decentralized application leverages blockchain technology to create a transparent and secure marketplace for trading carbon credits. Our goal is to facilitate the exchange of carbon credits, promoting environmental sustainability and helping organizations offset their carbon footprints effectively.

## Features

- **Decentralized Trading:** Facilitates peer-to-peer trading of carbon credits without intermediaries.
- **Smart Contracts:** Utilizes Ethereum smart contracts to ensure secure and transparent transactions.
- **Immutable Records:** Ensures all transactions are recorded on the blockchain, providing a tamper-proof history.
- **User-Friendly Interface:** Simple and intuitive interface for buying, selling, and managing carbon credits.
- **Environmental Impact:** Promotes sustainability by making it easier for companies to participate in carbon offset programs.

## Installation

### Prerequisites

Before you begin, ensure you have met the following requirements:

- [Node.js](https://nodejs.org/) installed on your machine
- [npm](https://www.npmjs.com/) package manager
- [Truffle](https://www.trufflesuite.com/truffle) for smart contract development
- [Ganache](https://www.trufflesuite.com/ganache) for running a local blockchain
- [MetaMask](https://metamask.io/) for interacting with the blockchain

### Steps

1. Clone the repository:
   ```sh
   git clone https://github.com/dinhhb/Carbon-credit-marketplace.git
   cd carbon-credit-marketplace
2. Install the dependencies:
   ```sh
   npm install
3. Start Ganache:
- Open Ganache and create a new workspace or quick start a new blockchain.
- Note the RPC server URL (usually http://127.0.0.1:7545).
4. Configure Truffle to connect to Ganace:
- Open truffle-config.js and ensure the development network is configured to use the Ganache URL.
  ```sh
  module.exports = {
    ...
    networks: {
      development: {
        host: "127.0.0.1",     
        port: 7545,           
        network_id: "*",     
      },
    },
    ...
  };
5. Compile and migrate the smart contracts to the blockchain:
   ```sh
   truffle migrate --reset
6. Run the development server:
   ```sh
   npm run dev
7. Import a Ganache account into MetaMask:
- Open Ganache and view the list of accounts.
- Copy the private key of one of the accounts.
- Open MetaMask and switch to the Ganache network.
- Click on the account icon in MetaMask, then select “Import Account.”
- Paste the private key and complete the import process.

Note: because the admin account is fixed, it must be manually adjusted in the following code in src/hooks/web3/useAccount.ts
   ```js
  const adminAddress: { [key: string]: boolean } = {
    "0xd24cb09d1Ab3790EA83F1E6961abA3fa26b43fD5": true, 
  };
  ```
   
### Usage

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Truffle](https://www.trufflesuite.com/truffle)
- [Ganache](https://www.trufflesuite.com/ganache)
- [Solidity](https://soliditylang.org/)
- [OpenZeppelin](https://openzeppelin.com/)
- [Ethereum](https://ethereum.org/)