require("dotenv").config();
const { Web3 } = require("web3");
const ethers = require("ethers");
const concat = require("concat-stream");
const network = require("./network.json");
const netlist = ["sepolia", "avalanche", "op", "base"];
const web3 = new Web3(process.env.DEFAULT_TESTNET_RPC);
const oaocabi = require("./build/contracts/OAOCircle.json")["abi"];
const tokenMessengerAbi = require("./abis/cctp/TokenMessenger.json");
const usdcAbi = require("./abis/Usdc.json");
const messageTransmitterAbi = require("./abis/cctp/MessageTransmitter.json");
const llama = require('./nodejs/llama')
const trade = require('./nodejs/trade')
// const SENDER = web3.eth.accounts.privateKeyToAccount(
//   process.env.FROM_PRIVATE_KEY,
// );
// web3.eth.accounts.wallet.add(SENDER);
// const OAOC_ADDRESS = "0xf59eBE57B47c51f8583264be7e21692fCB211AB4"; // OAOCircle
// // const OAOC_ADDRESS = "0x64BF816c3b90861a489A8eDf3FEA277cE1Fa0E82" // Prompt
// const OAOCircle = new web3.eth.Contract(oaocabi, OAOC_ADDRESS, {
//   from: SENDER.address,
// });
// const TO = 3600 * 1000; // Due to LLama inference
// const MSG_VALUE = 0.03;

// async function waitForTransaction(web3, txHash) {
//   let transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
//   while (transactionReceipt != null && transactionReceipt.status === "FALSE") {
//     transactionReceipt = await web3.eth.getTransactionReceipt(txHash);
//     await new Promise((r) => setTimeout(r, TO));
//   }
//   return transactionReceipt;
// }

// async function parseResult(row_data) {
//   datas = [];
//   for (var question = 1; question <= 5; question++) {
//     start_idx = row_data.indexOf(`${question}.`) + 2;
//     end_idx = question == 5 ? -1 : row_data.indexOf(`${question + 1}.`);
//     data = row_data.slice(start_idx, end_idx).replace("\n", "").split(" ");
//     if (question == 1 || question == 3) {
//       // console.log(`${data}\n`)
//       const found = data.find((element) =>
//         netlist.includes(element.toLowerCase()),
//       );
//       // console.log(found)
//       if (found) {
//         data = found.toLowerCase();
//       } else {
//         data = "sepolia";
//       }
//     } else {
//       data = data[1];
//     }
//     datas.push(data);
//   }
//   console.log(`parse:\n${datas}`);

//   return datas;
// }

// async function oao(_instruction) {
//   const condition =
//     "1. from which network\n" +
//     "2. from which address\n" +
//     "3. to which network\n" +
//     "4. to which address\n" +
//     "5. transaction amount\n" +
//     "Answer about the transaction detail.\n" +
//     "Give me totaly only five words answer!\n";
//   // condition = ""
//   var prompt = await condition.concat(_instruction);
//   console.log(`prompt:\n${prompt}`);
//   const tx = await OAOCircle.methods
//     .calculateAIResult(prompt)
//     .send({ value: web3.utils.toWei(`${MSG_VALUE}`, "ether") });
//   const receipt = await waitForTransaction(web3, tx.transactionHash);
//   console.log(receipt);
//   const result = await OAOCircle.methods.getAIResult(prompt).call();
//   console.log(`result:\n${result}`);
//   return await parseResult(result);
// }

// async function transfer(fromNet, fromAddr, toNet, toAddr, amount) {
//   try{
//     fromNetRPC = network[fromNet.toLowerCase()]["rpcURL"];
//     toNetRPC = network[toNet.toLowerCase()]["rpcURL"];
//     const to_DOMAIN = network[toNet.toLowerCase()]["domain"];
//     const web3 = new Web3(fromNetRPC);

//     // Add ETH private key used for signing transactions
//     const fromSigner = web3.eth.accounts.privateKeyToAccount(
//       process.env.FROM_PRIVATE_KEY,
//     );
//     web3.eth.accounts.wallet.add(fromSigner);
//     const toSigner = web3.eth.accounts.privateKeyToAccount(
//       process.env.TO_PRIVATE_KEY,
//     );
//     web3.eth.accounts.wallet.add(toSigner);

//     // Testnet Contract Addresses
//     const from_TOKEN_MESSENGER_CONTRACT_ADDRESS =
//       network[fromNet]["tokenMessenger"];
//     const USDC_CONTRACT_ADDRESS = network[fromNet]["urcToken"];
//     const to_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS =
//       network[toNet]["messageTransmitter"];

//     // initialize contracts using address and ABI
//     const fromTokenMessengerContract = new web3.eth.Contract(
//       tokenMessengerAbi,
//       from_TOKEN_MESSENGER_CONTRACT_ADDRESS,
//       { from: fromAddr },
//     );
//     const usdcContract = new web3.eth.Contract(usdcAbi, USDC_CONTRACT_ADDRESS, {
//       from: fromAddr,
//     });
//     const toMessageTransmitterContract = new web3.eth.Contract(
//       messageTransmitterAbi,
//       to_MESSAGE_TRANSMITTER_CONTRACT_ADDRESS,
//       { from: toAddr },
//     );

//     // OP destination address
//     // const toAddr = process.env.RECIPIENT_ADDRESS;
//     // const destinationAddressInBytes32 = await ethMessageContract.methods.addressToBytes32(toAddr).call();
//     const abiCoder = new ethers.AbiCoder();
//     const destinationAddressInBytes32 = abiCoder.encode(["address"], [toAddr]);

//     // STEP 1: Approve messenger contract to withdraw from our active eth address
//     const approveTxGas = await usdcContract.methods
//       .approve(from_TOKEN_MESSENGER_CONTRACT_ADDRESS, amount)
//       .estimateGas();
//     const approveTx = await usdcContract.methods
//       .approve(from_TOKEN_MESSENGER_CONTRACT_ADDRESS, amount)
//       .send({ gas: approveTxGas });
//     const approveTxReceipt = await waitForTransaction(
//       web3,
//       approveTx.transactionHash,
//     );
//     console.log("ApproveTxReceipt: ", approveTxReceipt);

//     // STEP 2: Burn USDC
//     const burnTxGas = await fromTokenMessengerContract.methods
//       .depositForBurn(
//         amount,
//         to_DOMAIN,
//         destinationAddressInBytes32,
//         USDC_CONTRACT_ADDRESS,
//       )
//       .estimateGas();
//     const burnTx = await fromTokenMessengerContract.methods
//       .depositForBurn(
//         amount,
//         to_DOMAIN,
//         destinationAddressInBytes32,
//         USDC_CONTRACT_ADDRESS,
//       )
//       .send({ gas: burnTxGas });
//     const burnTxReceipt = await waitForTransaction(web3, burnTx.transactionHash);
//     console.log("BurnTxReceipt: ", burnTxReceipt);

//     // STEP 3: Retrieve message bytes from logs
//     const transactionReceipt = await web3.eth.getTransactionReceipt(
//       burnTx.transactionHash,
//     );
//     const eventTopic = web3.utils.keccak256("MessageSent(bytes)");
//     const log = transactionReceipt.logs.find((l) => l.topics[0] === eventTopic);
//     const messageBytes = web3.eth.abi.decodeParameters(["bytes"], log.data)[0];
//     const messageHash = web3.utils.keccak256(messageBytes);

//     console.log(`MessageBytes: ${messageBytes}`);
//     console.log(`MessageHash: ${messageHash}`);

//     // STEP 4: Fetch attestation signature
//     let attestationResponse = { status: "pending" };
//     while (attestationResponse.status != "complete") {
//       const response = await fetch(
//         `https://iris-api-sandbox.circle.com/v1/attestations/${messageHash}`,
//       );
//       attestationResponse = await response.json();
//       await new Promise((r) => setTimeout(r, 10000));
//     }

//     const attestationSignature = attestationResponse.attestation;
//     console.log(`Signature: ${attestationSignature}`);

//     // STEP 5: Using the message bytes and signature recieve the funds on destination chain and address
//     web3.setProvider(toNetRPC); // Connect web3 to OP testnet
//     const receiveTxGas = await toMessageTransmitterContract.methods
//       .receiveMessage(messageBytes, attestationSignature)
//       .estimateGas();
//     const receiveTx = await toMessageTransmitterContract.methods
//       .receiveMessage(messageBytes, attestationSignature)
//       .send({ gas: receiveTxGas });
//     const receiveTxReceipt = await waitForTransaction(
//       web3,
//       receiveTx.transactionHash,
//     );
//     console.log("ReceiveTxReceipt: ", receiveTxReceipt);
//     return [receiveTx.status, receiveTx.transactionHash];
//   }
//   catch{
//     return ["error", 0]
//   }
// }

async function main() {
  const example =
    "I want to send 1 usdc in my wallet address 0xfe44D275fA324F059c3b673577334aAaC09B706A on sepolia testnet to my avalanche testnet address 0xfe44D275fA324F059c3b673577334aAaC09B706A";
  const instruction = (process.argv[2] || example)
  result = await llama.oao(instruction);
  [state, hash] = await trade.transfer.apply(this, result);
  console.log(state);
  return state;
}

main();
