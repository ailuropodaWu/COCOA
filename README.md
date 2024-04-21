# *C*rypto *O*racle *C*r*O*ss-chain *A*pplication
## *ETH Taipei 2024*
### *Community Finalist Prizes*
> [!TIP]
> We are currently fix some FRONT-END & OAO problem

## Introduction

We aim to propose a framework that facilitates an easy process of transferring between different chains using natural language.

## Technical
- **Extract information from sentence** <br> make a smart contract on chain to make transaction with the oracle [OAO](https://docs.ora.io/doc/cle/ai-oracle) from Ora
- **Parse** <br> parse the result from LLaMa2 to a specific form as parameters for next stage
- **Auto Cross-chain transfer** <br> based on the [CCTP API](https://www.circle.com/en/cross-chain-transfer-protocol) provided py Circle, we take parameters from last stage to autonomously do transation

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
npm run start "this is an example instruction"
```
Front-end is currently unavailable, we are fixing it
