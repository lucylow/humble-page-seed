import os
import json
import time
from typing import Dict, List, Optional, Tuple
from web3 import Web3
from eth_account import Account
from eth_account.messages import encode_defunct
import requests
from dataclasses import dataclass
from datetime import datetime, timedelta

@dataclass
class TokenizationVoucher:
    names: List[Dict]
    nonce: int
    expires_at: int
    owner_address: str

@dataclass
class ProofOfContactsVoucher:
    registrant_handle: int
    proof_source: int  # 1 - Registrar, 2 - Doma
    nonce: int
    expires_at: int

class DomaProtocolClient:
    """
    Client for interacting with Doma Protocol smart contracts
    Handles tokenization, claiming, bridging, and other domain operations
    """
    
    # Supported chains and their configurations
    SUPPORTED_CHAINS = {
        'ethereum': {
            'chain_id': 'eip155:1',
            'rpc_url': 'https://eth-mainnet.g.alchemy.com/v2/demo',
            'proxy_contract': '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
        },
        'polygon': {
            'chain_id': 'eip155:137',
            'rpc_url': 'https://polygon-rpc.com',
            'proxy_contract': '0x5A0b54D5dc17e0AadC383d2db43B0a0D3E029c4c'
        },
        'base': {
            'chain_id': 'eip155:8453',
            'rpc_url': 'https://mainnet.base.org',
            'proxy_contract': '0x6fC21092DA55B392b745d0B6c49543c4e30fC2b3'
        }
    }
    
    # Doma Protocol contract ABIs (simplified for key functions)
    PROXY_DOMA_RECORD_ABI = [
        {
            "inputs": [
                {"name": "voucher", "type": "tuple", "components": [
                    {"name": "names", "type": "tuple[]", "components": [
                        {"name": "sld", "type": "string"},
                        {"name": "tld", "type": "string"}
                    ]},
                    {"name": "nonce", "type": "uint256"},
                    {"name": "expiresAt", "type": "uint256"},
                    {"name": "ownerAddress", "type": "address"}
                ]},
                {"name": "signature", "type": "bytes"}
            ],
            "name": "requestTokenization",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {"name": "tokenId", "type": "uint256"},
                {"name": "isSynthetic", "type": "bool"},
                {"name": "proofOfContactsVoucher", "type": "tuple", "components": [
                    {"name": "registrantHandle", "type": "uint256"},
                    {"name": "proofSource", "type": "uint8"},
                    {"name": "nonce", "type": "uint256"},
                    {"name": "expiresAt", "type": "uint256"}
                ]},
                {"name": "signature", "type": "bytes"}
            ],
            "name": "claimOwnership",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        },
        {
            "inputs": [
                {"name": "tokenId", "type": "uint256"},
                {"name": "isSynthetic", "type": "bool"},
                {"name": "targetChainId", "type": "string"},
                {"name": "targetOwnerAddress", "type": "string"}
            ],
            "name": "bridge",
            "outputs": [],
            "stateMutability": "payable",
            "type": "function"
        }
    ]
    
    OWNERSHIP_TOKEN_ABI = [
        {
            "inputs": [{"name": "id", "type": "uint256"}],
            "name": "expirationOf",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"name": "id", "type": "uint256"}],
            "name": "registrarOf",
            "outputs": [{"name": "", "type": "uint256"}],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [{"name": "id", "type": "uint256"}],
            "name": "lockStatusOf",
            "outputs": [{"name": "", "type": "bool"}],
            "stateMutability": "view",
            "type": "function"
        }
    ]
    
    def __init__(self, private_key: Optional[str] = None):
        """
        Initialize Doma Protocol client
        
        Args:
            private_key: Private key for signing transactions (optional)
        """
        self.private_key = private_key or os.getenv('DOMA_PRIVATE_KEY')
        self.account = Account.from_key(self.private_key) if self.private_key else None
        self.web3_connections = {}
        self.contracts = {}
        
        # Initialize Web3 connections for supported chains
        self._initialize_connections()
    
    def _initialize_connections(self):
        """Initialize Web3 connections for all supported chains"""
        for chain_name, config in self.SUPPORTED_CHAINS.items():
            try:
                w3 = Web3(Web3.HTTPProvider(config['rpc_url']))
                if w3.is_connected():
                    self.web3_connections[chain_name] = w3
                    
                    # Initialize contract instances
                    proxy_contract = w3.eth.contract(
                        address=config['proxy_contract'],
                        abi=self.PROXY_DOMA_RECORD_ABI
                    )
                    self.contracts[chain_name] = {
                        'proxy_doma_record': proxy_contract
                    }
                    
                    print(f"Connected to {chain_name} network")
                else:
                    print(f"Failed to connect to {chain_name} network")
            except Exception as e:
                print(f"Error connecting to {chain_name}: {str(e)}")
    
    def get_protocol_fees(self, chain_name: str) -> Dict[str, int]:
        """
        Get current protocol fees for operations
        
        Args:
            chain_name: Target blockchain network
            
        Returns:
            Dictionary with fee amounts in wei
        """
        # Mock implementation - in production, this would query the contract
        base_fees = {
            'tokenization': Web3.to_wei(0.01, 'ether'),  # 0.01 ETH
            'claiming': Web3.to_wei(0.005, 'ether'),     # 0.005 ETH
            'bridging': Web3.to_wei(0.008, 'ether')      # 0.008 ETH
        }
        
        # Adjust fees based on chain (Polygon cheaper, Ethereum more expensive)
        if chain_name == 'polygon':
            return {k: v // 10 for k, v in base_fees.items()}  # 10x cheaper
        elif chain_name == 'ethereum':
            return {k: v * 2 for k, v in base_fees.items()}    # 2x more expensive
        
        return base_fees
    
    def create_tokenization_voucher(self, domain_names: List[str], owner_address: str, 
                                  registrar_private_key: str) -> Tuple[TokenizationVoucher, str]:
        """
        Create and sign a tokenization voucher
        
        Args:
            domain_names: List of domain names to tokenize
            owner_address: Address that will own the tokens
            registrar_private_key: Private key of the registrar for signing
            
        Returns:
            Tuple of (voucher, signature)
        """
        # Parse domain names into SLD/TLD components
        names = []
        for domain in domain_names:
            parts = domain.split('.')
            if len(parts) >= 2:
                sld = '.'.join(parts[:-1])
                tld = parts[-1]
                names.append({'sld': sld, 'tld': tld})
        
        # Create voucher
        nonce = int(time.time() * 1000)  # Use timestamp as nonce
        expires_at = int((datetime.now() + timedelta(hours=24)).timestamp())
        
        voucher = TokenizationVoucher(
            names=names,
            nonce=nonce,
            expires_at=expires_at,
            owner_address=owner_address
        )
        
        # Create simple message for signing (simplified for demo)
        message_text = f"Tokenize domains: {','.join([n['sld'] + '.' + n['tld'] for n in names])}, nonce: {nonce}, expires: {expires_at}, owner: {owner_address}"
        message = encode_defunct(text=message_text)
        
        # Sign the voucher
        registrar_account = Account.from_key(registrar_private_key)
        signature = registrar_account.sign_message(message).signature.hex()
        
        return voucher, signature
    
    def request_tokenization(self, chain_name: str, voucher: TokenizationVoucher, 
                           signature: str) -> str:
        """
        Request domain tokenization on the specified chain
        
        Args:
            chain_name: Target blockchain network
            voucher: Tokenization voucher
            signature: Voucher signature
            
        Returns:
            Transaction hash
        """
        if chain_name not in self.web3_connections:
            raise ValueError(f"Chain {chain_name} not supported or not connected")
        
        if not self.account:
            raise ValueError("No account configured for signing transactions")
        
        w3 = self.web3_connections[chain_name]
        contract = self.contracts[chain_name]['proxy_doma_record']
        
        # Get protocol fees
        fees = self.get_protocol_fees(chain_name)
        
        # Prepare transaction
        voucher_tuple = (
            [(name['sld'], name['tld']) for name in voucher.names],
            voucher.nonce,
            voucher.expires_at,
            voucher.owner_address
        )
        
        # Build transaction
        transaction = contract.functions.requestTokenization(
            voucher_tuple,
            bytes.fromhex(signature.replace('0x', ''))
        ).build_transaction({
            'from': self.account.address,
            'value': fees['tokenization'],
            'gas': 500000,  # Estimated gas limit
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(self.account.address)
        })
        
        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, self.private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        return tx_hash.hex()
    
    def claim_ownership(self, chain_name: str, token_id: int, is_synthetic: bool,
                       proof_voucher: ProofOfContactsVoucher, signature: str) -> str:
        """
        Claim ownership of a tokenized domain
        
        Args:
            chain_name: Target blockchain network
            token_id: NFT token ID
            is_synthetic: Whether it's a synthetic token
            proof_voucher: Proof of contacts voucher
            signature: Voucher signature
            
        Returns:
            Transaction hash
        """
        if chain_name not in self.web3_connections:
            raise ValueError(f"Chain {chain_name} not supported or not connected")
        
        if not self.account:
            raise ValueError("No account configured for signing transactions")
        
        w3 = self.web3_connections[chain_name]
        contract = self.contracts[chain_name]['proxy_doma_record']
        
        # Get protocol fees
        fees = self.get_protocol_fees(chain_name)
        
        # Prepare voucher tuple
        voucher_tuple = (
            proof_voucher.registrant_handle,
            proof_voucher.proof_source,
            proof_voucher.nonce,
            proof_voucher.expires_at
        )
        
        # Build transaction
        transaction = contract.functions.claimOwnership(
            token_id,
            is_synthetic,
            voucher_tuple,
            bytes.fromhex(signature.replace('0x', ''))
        ).build_transaction({
            'from': self.account.address,
            'value': fees['claiming'],
            'gas': 400000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(self.account.address)
        })
        
        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, self.private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        return tx_hash.hex()
    
    def bridge_token(self, chain_name: str, token_id: int, is_synthetic: bool,
                    target_chain_id: str, target_owner_address: str) -> str:
        """
        Bridge token to another chain
        
        Args:
            chain_name: Source blockchain network
            token_id: NFT token ID
            is_synthetic: Whether it's a synthetic token
            target_chain_id: Target chain ID in CAIP-2 format
            target_owner_address: Owner address on target chain
            
        Returns:
            Transaction hash
        """
        if chain_name not in self.web3_connections:
            raise ValueError(f"Chain {chain_name} not supported or not connected")
        
        if not self.account:
            raise ValueError("No account configured for signing transactions")
        
        w3 = self.web3_connections[chain_name]
        contract = self.contracts[chain_name]['proxy_doma_record']
        
        # Get protocol fees
        fees = self.get_protocol_fees(chain_name)
        
        # Build transaction
        transaction = contract.functions.bridge(
            token_id,
            is_synthetic,
            target_chain_id,
            target_owner_address
        ).build_transaction({
            'from': self.account.address,
            'value': fees['bridging'],
            'gas': 350000,
            'gasPrice': w3.eth.gas_price,
            'nonce': w3.eth.get_transaction_count(self.account.address)
        })
        
        # Sign and send transaction
        signed_txn = w3.eth.account.sign_transaction(transaction, self.private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
        
        return tx_hash.hex()
    
    def get_token_info(self, chain_name: str, token_contract_address: str, 
                      token_id: int) -> Dict:
        """
        Get information about an ownership token
        
        Args:
            chain_name: Blockchain network
            token_contract_address: Token contract address
            token_id: NFT token ID
            
        Returns:
            Token information dictionary
        """
        if chain_name not in self.web3_connections:
            raise ValueError(f"Chain {chain_name} not supported or not connected")
        
        w3 = self.web3_connections[chain_name]
        
        # Create token contract instance
        token_contract = w3.eth.contract(
            address=token_contract_address,
            abi=self.OWNERSHIP_TOKEN_ABI
        )
        
        try:
            expiration = token_contract.functions.expirationOf(token_id).call()
            registrar_id = token_contract.functions.registrarOf(token_id).call()
            is_locked = token_contract.functions.lockStatusOf(token_id).call()
            
            return {
                'token_id': token_id,
                'expiration_date': datetime.fromtimestamp(expiration).isoformat(),
                'registrar_iana_id': registrar_id,
                'is_transfer_locked': is_locked,
                'is_expired': expiration < int(time.time())
            }
        except Exception as e:
            raise Exception(f"Failed to get token info: {str(e)}")
    
    def get_transaction_status(self, chain_name: str, tx_hash: str) -> Dict:
        """
        Get transaction status and details
        
        Args:
            chain_name: Blockchain network
            tx_hash: Transaction hash
            
        Returns:
            Transaction status dictionary
        """
        if chain_name not in self.web3_connections:
            raise ValueError(f"Chain {chain_name} not supported or not connected")
        
        w3 = self.web3_connections[chain_name]
        
        try:
            # Get transaction receipt
            receipt = w3.eth.get_transaction_receipt(tx_hash)
            
            return {
                'transaction_hash': tx_hash,
                'status': 'confirmed' if receipt['status'] == 1 else 'failed',
                'block_number': receipt['blockNumber'],
                'gas_used': receipt['gasUsed'],
                'effective_gas_price': receipt.get('effectiveGasPrice', 0),
                'confirmations': w3.eth.block_number - receipt['blockNumber']
            }
        except Exception as e:
            # Transaction might be pending
            try:
                tx = w3.eth.get_transaction(tx_hash)
                return {
                    'transaction_hash': tx_hash,
                    'status': 'pending',
                    'block_number': None,
                    'gas_used': None,
                    'effective_gas_price': None,
                    'confirmations': 0
                }
            except:
                return {
                    'transaction_hash': tx_hash,
                    'status': 'not_found',
                    'error': str(e)
                }

