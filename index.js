require('dotenv').config()
const { Web3 } = require('web3')
const ethers = require('ethers');
const concat = require('concat-stream');
const network = require('./network.json')
const web3 = new Web3(process.env.FROM_TESTNET_RPC);
const oaocabi = require("./build/contracts/OAOCircle.json")["abi"]
const tokenMessengerAbi = require('./abis/cctp/TokenMessenger.json');
const usdcAbi = require('./abis/Usdc.json');
const messageTransmitterAbi = require('./abis/cctp/MessageTransmitter.json');


const SENDER = web3.eth.accounts.privateKeyToAccount(process.env.DEFAULT_PRIVATE_KEY);
web3.eth.accounts.wallet.add(SENDER);
const OAOC_ADDRESS = "0xf59eBE57B47c51f8583264be7e21692fCB211AB4"; // OAOCircle
// const OAOC_ADDRESS = "0x64BF816c3b90861a489A8eDf3FEA277cE1Fa0E82" // Prompt
const OAOCircle = new web3.eth.Contract(oaocabi, OAOC_ADDRESS, {from: SENDER.address});
const TO = 1000000 // Due to LLama inference

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

async function transfer(fromNet, toNet, fromAddr, toAddr, amount){
    fromNetRPC = network[fromNet.toLower()]['rpcURL']
    toNetRPC = network[toNet.toLower()]['rpcURL']
    const to_DOMAIN = network[toNet.toLower()]['domain']
    const web3 = new Web3(fromNetRPC);
    
    // Add ETH private key used for signing transactions
    const fromSigner = web3.eth.accounts.privateKeyToAccount(process.env.FROM_PRIVATE_KEY);
    web3.eth.accounts.wallet.add(fromSigner);
    const toSigner = web3.eth.accounts.privateKeyToAccount(process.env.TO_PRIVATE_KEY);
    web3.eth.accounts.wallet.add(toSigner);


    // Testnet Contract Addresses
    const from_TOKEN_MESSENGER_CONTRACT_ADDRESS = network[fromNet]['tokenMessenger'];
    const USDC_CONTRACT_ADDRESS = network[fromNet]['urcToken'];
    const to_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS = network[toNet]['messageTransmitter'];

    // initialize contracts using address and ABI
    const fromTokenMessengerContract = new web3.eth.Contract(tokenMessengerAbi, from_TOKEN_MESSENGER_CONTRACT_ADDRESS, {from: fromAddr});
    const usdcContract = new web3.eth.Contract(usdcAbi, USDC_CONTRACT_ADDRESS, {from: fromAddr});
    const toMessageTransmitterContract = new web3.eth.Contract(messageTransmitterAbi, to_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS, {from: toAddr});

    // OP destination address
    const toAddr = process.env.RECIPIENT_ADDRESS;
    // const destinationAddressInBytes32 = await ethMessageContract.methods.addressToBytes32(toAddr).call();
    const abiCoder = new ethers.AbiCoder();
    const destinationAddressInBytes32 = abiCoder.encode(
        ["address"],
        [toAddr]
      );


    // STEP 1: Approve messenger contract to withdraw from our active eth address
    const approveTxGas = await usdcContract.methods.approve(from_TOKEN_MESSENGER_CONTRACT_ADDRESS, amount).estimateGas()
    const approveTx = await usdcContract.methods.approve(from_TOKEN_MESSENGER_CONTRACT_ADDRESS, amount).send({gas: approveTxGas})
    const approveTxReceipt = await waitForTransaction(web3, approveTx.transactionHash);
    console.log('ApproveTxReceipt: ', approveTxReceipt)

    // STEP 2: Burn USDC
    const burnTxGas = await fromTokenMessengerContract.methods.depositForBurn(amount, to_DOMAIN, destinationAddressInBytes32, USDC_CONTRACT_ADDRESS).estimateGas();
    const burnTx = await fromTokenMessengerContract.methods.depositForBurn(amount, to_DOMAIN, destinationAddressInBytes32, USDC_CONTRACT_ADDRESS).send({gas: burnTxGas});
    const burnTxReceipt = await waitForTransaction(web3, burnTx.transactionHash);
    console.log('BurnTxReceipt: ', burnTxReceipt)

    // STEP 3: Retrieve message bytes from logs
    const transactionReceipt = await web3.eth.getTransactionReceipt(burnTx.transactionHash);
    const eventTopic = web3.utils.keccak256('MessageSent(bytes)')
    const log = transactionReceipt.logs.find((l) => l.topics[0] === eventTopic)
    const messageBytes = web3.eth.abi.decodeParameters(['bytes'], log.data)[0]
    const messageHash = web3.utils.keccak256(messageBytes);

    console.log(`MessageBytes: ${messageBytes}`)
    console.log(`MessageHash: ${messageHash}`)

    // STEP 4: Fetch attestation signature
    let attestationResponse = {status: 'pending'};
    while(attestationResponse.status != 'complete') {
        const response = await fetch(`https://iris-api-sandbox.circle.com/v1/attestations/${messageHash}`);
        attestationResponse = await response.json()
        await new Promise(r => setTimeout(r, TO));
    }

    const attestationSignature = attestationResponse.attestation;
    console.log(`Signature: ${attestationSignature}`)

    // STEP 5: Using the message bytes and signature recieve the funds on destination chain and address
    web3.setProvider(toNetRPC); // Connect web3 to OP testnet
    const receiveTxGas = await toMessageTransmitterContract.methods.receiveMessage(messageBytes, attestationSignature).estimateGas();
    const receiveTx = await toMessageTransmitterContract.methods.receiveMessage(messageBytes, attestationSignature).send({gas: receiveTxGas});
    const receiveTxReceipt = await waitForTransaction(web3, receiveTx.transactionHash);
    console.log('ReceiveTxReceipt: ', receiveTxReceipt)
    return receiveTx.status
};

async function main() {
    instruction = ""
    result = oao(instruction)
    state = transfer(result)
    return state 
}
