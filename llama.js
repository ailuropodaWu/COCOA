require('dotenv').config()
const { Web3 } = require('web3')
const ethers = require('ethers');
const concat = require('concat-stream');
const web3 = new Web3(process.env.ETH_TESTNET_RPC);
const oaocabi = require("./build/contracts/OAOCircle.json")["abi"]

const SENDER = web3.eth.accounts.privateKeyToAccount(process.env.ETH_PRIVATE_KEY);
web3.eth.accounts.wallet.add(SENDER);
const OAOC_ADDRESS = "0xf59eBE57B47c51f8583264be7e21692fCB211AB4"; // OAOCircle
// const OAOC_ADDRESS = "0x64BF816c3b90861a489A8eDf3FEA277cE1Fa0E82" // Prompt
const OAOCircle = new web3.eth.Contract(oaocabi, OAOC_ADDRESS, {from: SENDER.address});


const waitForTransaction = async(web3, txHash) => {
    let transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
    while(transactionReceipt != null && transactionReceipt.status === 'FALSE') {
        transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
        await new Promise(r => setTimeout(r, 1000000));
    }
    return transactionReceipt;
}

async function calculate(_prompt, _value) {
    
    const data = await OAOCircle.methods.calculateAIResult(_prompt).encodeABI();
    const tx = await web3.eth.accounts.signTransaction(
        { 
            to: OAOC_ADDRESS,
            value: _value,
            maxPriorityFeePerGas: 3000000,
            maxFeePerGas: 3000000,
            data: data,
            nonce: await web3.eth.getTransactionCount(SENDER.address),
        },
        SENDER.privateKey
    );

    const receipt = await web3.eth.sendSignedTransaction(tx.rawTransaction);
    return receipt
}

async function llama() {


    const condition = "1. from which network 2. to which network 3. from which address 4. to which address 5. amount. answer the questions about the transaction in only 5 words answer! ";
    // condition = ""
    var instruction = "I want to transfer 1 usdc from sepolia 0xfe44 to address 0x0011 on base testnet."
    var prompt = condition.concat(instruction)
    console.log(prompt)
    const tx = await OAOCircle.methods.calculateAIResult(prompt).send({value: web3.utils.toWei("0.2", "ether")})
    const receipt = await waitForTransaction(web3, tx.transactionHash)
    console.log(receipt)
    const result = await OAOCircle.methods.getAIResult(prompt).call()
    console.log(result)
}

llama();
