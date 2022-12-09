// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

interface ICreateQuestionVerifier {
  // Copied from createVerifier's public ABI
  function verifyProof(
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[1] memory input
  ) external returns (bool);
}

interface IAnswerVerifier {
  // Copied from createVerifier's public ABI
  function verifyProof(
    uint[2] memory a,
    uint[2][2] memory b,
    uint[2] memory c,
    uint[3] memory _input
  ) external returns (bool);
}

contract AITextQuestion {
	ICreateQuestionVerifier public immutable createQuestionVerifier;
	IAnswerVerifier public immutable answerVerifier;

	constructor(
		ICreateQuestionVerifier _createQuestionVerifier,
		IAnswerVerifier _answerVerifier
	) {
		createQuestionVerifier = _createQuestionVerifier;
		answerVerifier = _answerVerifier;
	}

	function requireCreateQuestionProof(
		bytes calldata _proof,
		uint _questionHash
	) external {
		uint256[8] memory p = abi.decode(_proof, (uint256[8]));
		require(
			createQuestionVerifier.verifyProof(
       				[p[0], p[1]],
        			[[p[2], p[3]], [p[4], p[5]]],
        			[p[6], p[7]],
        			[_questionHash]
      			),
      			"Invalid question state (ZK)"
		);
	}

	function requireAnswerProof(
		bytes calldata _proof,
		uint isCurrentAnswer,
		uint _questionHash,
		uint _guess
	) external {
		uint256[8] memory p = abi.decode(_proof, (uint256[8]));
		require(
			answerVerifier.verifyProof(
				[p[0], p[1]],
				[[p[2], p[3]], [p[4], p[5]]],
				[p[6], p[7]],
				[isCurrentAnswer, _questionHash, _guess]
			),
			"invalid answer (ZK)"
		);
	}
}
