# Crypto Oracle CrOss-chain Application
## *ETH Taipei 2024*
<h2 style="color: red">We are currently fix some FRONT-END & OAO problem</h2> 

## Introduction

We aim to propose a framework that facilitates an easy process of transferring between different chains using natural language.

## Technical
- **Extract information from sentence** <br> make a smart contract on chain to make transaction with the orlacle contract
- **Parse** <br> parse the result from oao to a specific form as parameters for next stage
- **Auto Cross-chain transfer** <br> based on the CCTP API provided py Circle, we take parameters from last stage to autonomously do transation

## Usage
Create your own **.env**
```.env
DEFAULT_TESTNET_RPC
FROM_PRIVATE_KEY
TO_PRIVATE_KEY
```

Initial env setting
```cmd
npm install
```

Interact with OAO and see the promt and the parsed result
```cmd
npm run testoao "this is an example instruction"
```

Run the whole framework without UI
```cmd
npm run start
```
Front-end is currently unavailable, we are fixing it
