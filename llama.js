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
const TO = 3600 * 1000

async function waitForTransaction(web3, txHash) {
	let transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
	while (transactionReceipt != null && transactionReceipt.status === 'FALSE') {
		transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
		await new Promise(r => setTimeout(r, TO));
	}
	return transactionReceipt;
}

async function parseResult(row_data) {
    data = []
    for (var question = 1; question <= 5; question++){
        start_idx = row_data.indexOf(`${question}.`) + 2
        end_idx = (question == 5) ? -1 : row_data.indexOf(`${question+1}.`)
        data.push(row_data.slice(start_idx, end_idx))
    }
    console.log(`parse:\n${data}`)

	return data
}

async function oao(_instruction) {
    const condition =   "1. from which network\n" +  
                        "2. from which address\n" +
                        "3. to which network\n" + 
                        "4. to which address\n" +
                        "5. transaction amount\n" + 
                        "Answer about the transaction detail.\n" +
                        "Give me totaly only five words answer!\n";
    // condition = ""
    var prompt = condition.concat(_instruction)
    console.log(`prompt:\n${prompt}`)
    const tx = await OAOCircle.methods.calculateAIResult(prompt).send({value: web3.utils.toWei("0.15", "ether")})
    const receipt = await waitForTransaction(web3, tx.transactionHash)
    console.log(receipt)
    const result = await OAOCircle.methods.getAIResult(prompt).call()
    console.log(`result:\n${result}`)
    return await parseResult(result)
}
async function main() {
    instrution = "I want to send 40 usdc to the address 0xaa on op testnet using my sepolia address 0xfe44"
    result = await oao(instrution)
}

main()