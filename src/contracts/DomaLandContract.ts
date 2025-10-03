// Compiled contract ABI and bytecode for DomaLand.sol
export const DomaLandABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenId",
        "type": "uint256"
      }
    ],
    "name": "DomainRegistered",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "registerDomain",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      }
    ],
    "name": "purchaseDomain",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// This is a placeholder bytecode - you'll need to compile the contract to get the real bytecode
export const DomaLandBytecode = "0x608060405234801561001057600080fd5b50600080546001600160a01b031916331790556101c4806100326000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c8063a6f9dae114610046578063b3f006741461005b578063f2fde38b1461006e575b600080fd5b6100596100543660046100d9565b610081565b005b6100596100693660046100f5565b61008d565b61005961007c3660046100d9565b6100a9565b61008a816100b5565b50565b610096816100b5565b6100a1826000836100c1565b5050565b6100b2816100b5565b50565b600080546001600160a01b0319166001600160a01b0392909216919091179055565b505050565b6000602082840312156100eb57600080fd5b81356001600160a01b038116811461010257600080fd5b9392505050565b6000806040838503121561011c57600080fd5b8235915060208301356001600160a01b038116811461013a57600080fd5b80915050925092905056fea2646970667358221220...";
