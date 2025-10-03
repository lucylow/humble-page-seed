import os
import time
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from src.models.domain import Domain, DomainTransaction, DomainStatus, TokenizationStatus, db
from src.models.user import User
from src.services.doma_protocol import DomaProtocolClient, TokenizationVoucher, ProofOfContactsVoucher

class DomainService:
    """
    Service class for handling domain operations and business logic
    Integrates with Doma Protocol for blockchain operations
    """
    
    def __init__(self):
        self.doma_client = DomaProtocolClient()
        # Mock registrar private key for demo purposes
        self.registrar_private_key = os.getenv('REGISTRAR_PRIVATE_KEY', 
                                             '0x' + '1' * 64)  # Demo key
    
    def register_domain(self, user_id: int, domain_name: str, 
                       registration_data: Dict) -> Domain:
        """
        Register a new domain in the system
        
        Args:
            user_id: ID of the user registering the domain
            domain_name: Full domain name (e.g., "example.com")
            registration_data: Additional registration information
            
        Returns:
            Created Domain object
        """
        # Validate domain name format
        if '.' not in domain_name:
            raise ValueError("Invalid domain name format")
        
        parts = domain_name.split('.')
        sld = '.'.join(parts[:-1])
        tld = parts[-1]
        
        # Check if domain already exists
        existing_domain = Domain.query.filter_by(name=domain_name).first()
        if existing_domain:
            raise ValueError("Domain already registered")
        
        # Validate user exists
        user = User.query.get(user_id)
        if not user:
            raise ValueError("User not found")
        
        # Create domain record
        domain = Domain(
            name=domain_name,
            sld=sld,
            tld=tld,
            owner_id=user_id,
            owner_address=registration_data.get('owner_address'),
            status=DomainStatus.REGISTERED,
            registration_date=datetime.utcnow(),
            expiration_date=datetime.utcnow() + timedelta(days=365),  # 1 year
            estimated_value=registration_data.get('estimated_value', 100.0),
            registrar_iana_id=registration_data.get('registrar_iana_id', 1)
        )
        
        db.session.add(domain)
        db.session.commit()
        
        return domain
    
    def initiate_tokenization(self, domain_id: int, chain_name: str, 
                            owner_address: str) -> Dict:
        """
        Initiate domain tokenization process
        
        Args:
            domain_id: ID of the domain to tokenize
            chain_name: Target blockchain network
            owner_address: Address that will own the token
            
        Returns:
            Tokenization result with transaction hash
        """
        # Get domain
        domain = Domain.query.get(domain_id)
        if not domain:
            raise ValueError("Domain not found")
        
        if domain.status != DomainStatus.REGISTERED:
            raise ValueError("Domain must be in registered status to tokenize")
        
        # Update domain status
        domain.tokenization_status = TokenizationStatus.PENDING
        domain.owner_address = owner_address
        domain.chain_id = self.doma_client.SUPPORTED_CHAINS[chain_name]['chain_id']
        db.session.commit()
        
        try:
            # Create tokenization voucher
            voucher, signature = self.doma_client.create_tokenization_voucher(
                domain_names=[domain.name],
                owner_address=owner_address,
                registrar_private_key=self.registrar_private_key
            )
            
            # Store voucher nonce for tracking
            domain.voucher_nonce = str(voucher.nonce)
            db.session.commit()
            
            # Request tokenization on blockchain
            tx_hash = self.doma_client.request_tokenization(
                chain_name=chain_name,
                voucher=voucher,
                signature=signature
            )
            
            # Create transaction record
            transaction = DomainTransaction(
                domain_id=domain.id,
                user_id=domain.owner_id,
                transaction_type='tokenize',
                transaction_hash=tx_hash,
                status='pending',
                transaction_metadata={
                    'chain_name': chain_name,
                    'voucher_nonce': voucher.nonce,
                    'owner_address': owner_address
                }
            )
            db.session.add(transaction)
            
            # Update domain status
            domain.tokenization_status = TokenizationStatus.IN_PROGRESS
            db.session.commit()
            
            return {
                'success': True,
                'transaction_hash': tx_hash,
                'domain_id': domain.id,
                'chain_name': chain_name,
                'status': 'pending'
            }
            
        except Exception as e:
            # Update domain status on failure
            domain.tokenization_status = TokenizationStatus.FAILED
            db.session.commit()
            
            # Create failed transaction record
            transaction = DomainTransaction(
                domain_id=domain.id,
                user_id=domain.owner_id,
                transaction_type='tokenize',
                status='failed',
                error_message=str(e),
                transaction_metadata={
                    'chain_name': chain_name,
                    'owner_address': owner_address
                }
            )
            db.session.add(transaction)
            db.session.commit()
            
            raise Exception(f"Tokenization failed: {str(e)}")
    
    def claim_domain_ownership(self, domain_id: int, token_id: int, 
                             registrant_handle: int) -> Dict:
        """
        Claim ownership of a tokenized domain
        
        Args:
            domain_id: ID of the domain
            token_id: NFT token ID
            registrant_handle: Handle in registrar system
            
        Returns:
            Claim result with transaction hash
        """
        domain = Domain.query.get(domain_id)
        if not domain:
            raise ValueError("Domain not found")
        
        if domain.status != DomainStatus.TOKENIZED:
            raise ValueError("Domain must be tokenized to claim ownership")
        
        try:
            # Create proof of contacts voucher
            nonce = int(time.time() * 1000)
            expires_at = int((datetime.now() + timedelta(hours=24)).timestamp())
            
            proof_voucher = ProofOfContactsVoucher(
                registrant_handle=registrant_handle,
                proof_source=1,  # Registrar
                nonce=nonce,
                expires_at=expires_at
            )
            
            # For demo purposes, create a mock signature
            # In production, this would be signed by the registrar or Doma storage
            signature = "0x" + "a" * 130  # Mock signature
            
            # Submit claim transaction
            chain_name = self._get_chain_name_from_id(domain.chain_id)
            tx_hash = self.doma_client.claim_ownership(
                chain_name=chain_name,
                token_id=token_id,
                is_synthetic=domain.is_synthetic,
                proof_voucher=proof_voucher,
                signature=signature
            )
            
            # Create transaction record
            transaction = DomainTransaction(
                domain_id=domain.id,
                user_id=domain.owner_id,
                transaction_type='claim',
                transaction_hash=tx_hash,
                status='pending',
                transaction_metadata={
                    'token_id': token_id,
                    'registrant_handle': registrant_handle,
                    'proof_nonce': nonce
                }
            )
            db.session.add(transaction)
            
            # Update domain
            domain.token_id = str(token_id)
            domain.proof_of_contacts_handle = str(registrant_handle)
            db.session.commit()
            
            return {
                'success': True,
                'transaction_hash': tx_hash,
                'domain_id': domain.id,
                'token_id': token_id,
                'status': 'pending'
            }
            
        except Exception as e:
            # Create failed transaction record
            transaction = DomainTransaction(
                domain_id=domain.id,
                user_id=domain.owner_id,
                transaction_type='claim',
                status='failed',
                error_message=str(e),
                transaction_metadata={
                    'token_id': token_id,
                    'registrant_handle': registrant_handle
                }
            )
            db.session.add(transaction)
            db.session.commit()
            
            raise Exception(f"Claim failed: {str(e)}")
    
    def bridge_domain_token(self, domain_id: int, target_chain: str, 
                          target_address: str) -> Dict:
        """
        Bridge domain token to another chain
        
        Args:
            domain_id: ID of the domain
            target_chain: Target blockchain network
            target_address: Owner address on target chain
            
        Returns:
            Bridge result with transaction hash
        """
        domain = Domain.query.get(domain_id)
        if not domain:
            raise ValueError("Domain not found")
        
        if not domain.token_id:
            raise ValueError("Domain must be tokenized to bridge")
        
        try:
            # Get current chain
            current_chain = self._get_chain_name_from_id(domain.chain_id)
            target_chain_id = self.doma_client.SUPPORTED_CHAINS[target_chain]['chain_id']
            
            # Submit bridge transaction
            tx_hash = self.doma_client.bridge_token(
                chain_name=current_chain,
                token_id=int(domain.token_id),
                is_synthetic=domain.is_synthetic,
                target_chain_id=target_chain_id,
                target_owner_address=target_address
            )
            
            # Create transaction record
            transaction = DomainTransaction(
                domain_id=domain.id,
                user_id=domain.owner_id,
                transaction_type='bridge',
                transaction_hash=tx_hash,
                status='pending',
                transaction_metadata={
                    'source_chain': current_chain,
                    'target_chain': target_chain,
                    'target_address': target_address,
                    'token_id': domain.token_id
                }
            )
            db.session.add(transaction)
            
            # Update domain status
            domain.status = DomainStatus.BRIDGED
            db.session.commit()
            
            return {
                'success': True,
                'transaction_hash': tx_hash,
                'domain_id': domain.id,
                'source_chain': current_chain,
                'target_chain': target_chain,
                'status': 'pending'
            }
            
        except Exception as e:
            # Create failed transaction record
            transaction = DomainTransaction(
                domain_id=domain.id,
                user_id=domain.owner_id,
                transaction_type='bridge',
                status='failed',
                error_message=str(e),
                transaction_metadata={
                    'target_chain': target_chain,
                    'target_address': target_address
                }
            )
            db.session.add(transaction)
            db.session.commit()
            
            raise Exception(f"Bridge failed: {str(e)}")
    
    def get_user_domains(self, user_id: int, status_filter: Optional[str] = None) -> List[Dict]:
        """
        Get all domains owned by a user
        
        Args:
            user_id: ID of the user
            status_filter: Optional status filter
            
        Returns:
            List of domain dictionaries
        """
        query = Domain.query.filter_by(owner_id=user_id)
        
        if status_filter:
            try:
                status_enum = DomainStatus(status_filter)
                query = query.filter_by(status=status_enum)
            except ValueError:
                pass  # Invalid status filter, ignore
        
        domains = query.all()
        return [domain.to_dict() for domain in domains]
    
    def get_domain_details(self, domain_id: int) -> Dict:
        """
        Get detailed information about a domain including blockchain data
        
        Args:
            domain_id: ID of the domain
            
        Returns:
            Detailed domain information
        """
        domain = Domain.query.get(domain_id)
        if not domain:
            raise ValueError("Domain not found")
        
        domain_data = domain.to_dict()
        
        # Add blockchain information if tokenized
        if domain.token_id and domain.chain_id:
            try:
                chain_name = self._get_chain_name_from_id(domain.chain_id)
                
                # Get token information from blockchain
                if domain.contract_address:
                    token_info = self.doma_client.get_token_info(
                        chain_name=chain_name,
                        token_contract_address=domain.contract_address,
                        token_id=int(domain.token_id)
                    )
                    domain_data['blockchain_info'] = token_info
                
            except Exception as e:
                domain_data['blockchain_error'] = str(e)
        
        # Add recent transactions
        recent_transactions = DomainTransaction.query.filter_by(
            domain_id=domain.id
        ).order_by(DomainTransaction.created_at.desc()).limit(10).all()
        
        domain_data['recent_transactions'] = [tx.to_dict() for tx in recent_transactions]
        
        return domain_data
    
    def update_transaction_status(self, transaction_id: int) -> Dict:
        """
        Update transaction status by checking blockchain
        
        Args:
            transaction_id: ID of the transaction to update
            
        Returns:
            Updated transaction information
        """
        transaction = DomainTransaction.query.get(transaction_id)
        if not transaction:
            raise ValueError("Transaction not found")
        
        if not transaction.transaction_hash:
            raise ValueError("Transaction has no hash to check")
        
        try:
            # Get chain name from transaction metadata
            chain_name = transaction.transaction_metadata.get('chain_name')
            if not chain_name:
                # Try to get from domain
                domain = Domain.query.get(transaction.domain_id)
                chain_name = self._get_chain_name_from_id(domain.chain_id)
            
            # Check transaction status on blockchain
            status_info = self.doma_client.get_transaction_status(
                chain_name=chain_name,
                tx_hash=transaction.transaction_hash
            )
            
            # Update transaction record
            transaction.status = status_info['status']
            transaction.block_number = status_info.get('block_number')
            transaction.gas_used = status_info.get('gas_used')
            transaction.gas_price = str(status_info.get('effective_gas_price', 0))
            
            if status_info['status'] == 'confirmed':
                transaction.confirmed_at = datetime.utcnow()
                
                # Update domain status based on transaction type
                domain = Domain.query.get(transaction.domain_id)
                if transaction.transaction_type == 'tokenize':
                    domain.status = DomainStatus.TOKENIZED
                    domain.tokenization_status = TokenizationStatus.COMPLETED
                elif transaction.transaction_type == 'claim':
                    domain.status = DomainStatus.CLAIMED
            
            elif status_info['status'] == 'failed':
                # Update domain status on failure
                domain = Domain.query.get(transaction.domain_id)
                if transaction.transaction_type == 'tokenize':
                    domain.tokenization_status = TokenizationStatus.FAILED
                
                transaction.error_message = status_info.get('error', 'Transaction failed')
            
            db.session.commit()
            
            return transaction.to_dict()
            
        except Exception as e:
            transaction.error_message = str(e)
            db.session.commit()
            raise Exception(f"Failed to update transaction status: {str(e)}")
    
    def _get_chain_name_from_id(self, chain_id: str) -> str:
        """
        Get chain name from CAIP-2 chain ID
        
        Args:
            chain_id: Chain ID in CAIP-2 format
            
        Returns:
            Chain name
        """
        chain_mapping = {
            'eip155:1': 'ethereum',
            'eip155:137': 'polygon',
            'eip155:8453': 'base'
        }
        
        return chain_mapping.get(chain_id, 'ethereum')
    
    def get_marketplace_domains(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """
        Get domains listed in the marketplace
        
        Args:
            limit: Maximum number of domains to return
            offset: Number of domains to skip
            
        Returns:
            List of marketplace domain dictionaries
        """
        domains = Domain.query.filter_by(is_listed=True).offset(offset).limit(limit).all()
        return [domain.to_dict() for domain in domains]
    
    def list_domain_for_sale(self, domain_id: int, price: float) -> Dict:
        """
        List a domain for sale in the marketplace
        
        Args:
            domain_id: ID of the domain
            price: Listing price
            
        Returns:
            Updated domain information
        """
        domain = Domain.query.get(domain_id)
        if not domain:
            raise ValueError("Domain not found")
        
        domain.is_listed = True
        domain.listing_price = price
        db.session.commit()
        
        return domain.to_dict()

