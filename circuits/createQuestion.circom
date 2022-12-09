pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template CreateQuestion() {
	signal input text[2];
	signal input answer;

	signal output hash;

	component poseidon = Poseidon(3);

	poseidon.inputs[0] <== text[0];
	poseidon.inputs[1] <== text[1];
	poseidon.inputs[2] <== answer;

	hash <-- poseidon.out;
}

component main = CreateQuestion();
