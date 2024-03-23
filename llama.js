require('dotenv').config()
const { Web3 } = require('web3')
const ethers = require('ethers');
const concat = require('concat-stream');
const network = require('./network.json')
const web3 = new Web3(process.env.FROM_TESTNET_RPC);
const oaocabi = require("./build/contracts/OAOCircle.json")["abi"]

const SENDER = web3.eth.accounts.privateKeyToAccount(process.env.DEFAULT_PRIVATE_KEY);
web3.eth.accounts.wallet.add(SENDER);
const OAOC_ADDRESS = "0xf59eBE57B47c51f8583264be7e21692fCB211AB4"; // OAOCircle
// const OAOC_ADDRESS = "0x64BF816c3b90861a489A8eDf3FEA277cE1Fa0E82" // Prompt
const OAOCircle = new web3.eth.Contract(oaocabi, OAOC_ADDRESS, {from: SENDER.address});
const TO = 1000000

async function waitForTransaction(web3, txHash) {
    let transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
    while(transactionReceipt != null && transactionReceipt.status === 'FALSE') {
        transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
        await new Promise(r => setTimeout(r, TO));
    }
    return transactionReceipt;
}

async function parseResult(row_data) {
    data = row_data.replaceAll('\n', ' ')
    data = data.split(' ')
    return data
}

async function oao(_instruction) {
    const condition = "1. from which network 2. to which network 3. from which address 4. to which address 5. amount. answer the questions about the transaction in only 5 words answer! ";
    // condition = ""
    var prompt = condition.concat(_instruction)
    console.log(`prompt: ${prompt}`)
    const tx = await OAOCircle.methods.calculateAIResult(prompt).send({value: web3.utils.toWei("0.2", "ether")})
    const receipt = await waitForTransaction(web3, tx.transactionHash)
    console.log(receipt)
    const result = await OAOCircle.methods.getAIResult(prompt).call()
    console.log(`result:\n${result}`)
    return parseResult(result.toString)
}
