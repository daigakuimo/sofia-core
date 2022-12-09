pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

function isMatch(guess, answer) {
	return guess == answer;
}

template Answer() {
	// public
	signal input questionHash;
	signal input guess;   // 0 or 1

	// private  
	signal input text[2];
	signal input answer;

	signal output isCorrectAnswer;

	component poseidon = Poseidon(3);

	poseidon.inputs[0] <== text[0];
	poseidon.inputs[1] <== text[1];
	poseidon.inputs[2] <== answer;

	assert(questionHash == poseidon.out);

	isCorrectAnswer <-- isMatch(guess, answer);
}

component main {public [questionHash, guess]} = Answer();
