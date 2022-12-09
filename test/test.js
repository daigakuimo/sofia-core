const Web3 = require("web3")
require("dotenv").config()
const ABI = require("../contracts/aiTextQuestion.json");

const snarkjs = require('snarkjs')

const fs = require('fs')
const createQuestionWC = require('../circom/createQuestion/createQuestion_js/witness_calculator.js');
const createQuestionWasm = './circom/createQuestion/createQuestion_js/createQuestion.wasm'
const createQuestionZkey = './circom/createQuestion/createQuestion_0001.zkey'
const WITNESS_FILE = '/tmp/witness'

const answerWC = require('../circom/answer/answer_js/witness_calculator.js');
const answerWasm = './circom/answer/answer_js/answer.wasm'
const answerZkey = './circom/answer/answer_0001.zkey'

const questionData = {
  "text": ["1151041059811712197", "115104105981171219"],
  "answer": 1
};

const AI_TEXT_QUESTION_ADDRESS = "0x34AA6a39911A1b5077033129d1bd7dbED89F48fb";

const main = async () => {
  const web3 = new Web3(
    new Web3.providers.HttpProvider(
      "https://rpc-mumbai.maticvigil.com"
    )
  );

  const account = web3.eth.accounts.privateKeyToAccount(process.env.ACCOUNT_PRIVATE_KEY)

  web3.eth.accounts.wallet.add(process.env.ACCOUNT_PRIVATE_KEY);

  const aiTextQuestion = new web3.eth.Contract(
    ABI,
    AI_TEXT_QUESTION_ADDRESS
  );

  const questionProof = await genCreateProof(questionData);

  await aiTextQuestion.methods.requireCreateQuestionProof(questionProof.solidityProof, questionProof.inputs[0]).send({
    from: account.address,
    gasLimit: 3141592
  });

  console.log("finish")
}

const genCreateProof = async (input) => {
  const buffer = fs.readFileSync(createQuestionWasm);
  const witnessCalculator = await createQuestionWC(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(input);
  // The package methods read from files only, so we just shove it in /tmp/ and hope
  // there is no parallel execution.
  fs.writeFileSync(WITNESS_FILE, buff);
  const { proof, publicSignals } = await snarkjs.groth16.prove(createQuestionZkey, WITNESS_FILE);
  const solidityProof = proofToSolidityInput(proof);
  return {
    solidityProof: solidityProof,
    inputs: publicSignals,
  }
}

const genAnswerProof = async (input) => {
  const buffer = fs.readFileSync(answerWasm);
  const witnessCalculator = await answerWC(buffer);
  const buff = await witnessCalculator.calculateWTNSBin(input);
  fs.writeFileSync(WITNESS_FILE, buff);
  const { proof, publicSignals } = await snarkjs.groth16.prove(answerZkey, WITNESS_FILE);
  const solidityProof = proofToSolidityInput(proof);
  return {
    solidityProof: solidityProof,
    inputs: publicSignals,
  }
}

const proofToSolidityInput = (proof) => {
  const proofs = [
    proof.pi_a[0], proof.pi_a[1],
    proof.pi_b[0][1], proof.pi_b[0][0],
    proof.pi_b[1][1], proof.pi_b[1][0],
    proof.pi_c[0], proof.pi_c[1],
  ];
  const flatProofs = proofs.map(p => BigInt(p));
  return "0x" + flatProofs.map(x => toHex32(x)).join("")
}

const toHex32 = (num) => {
  let str = num.toString(16);
  while (str.length < 64) str = "0" + str;
  return str;
}

main();