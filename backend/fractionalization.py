import math
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from src.models.domain import Domain, DomainTransaction, db
from src.models.user import User
from src.services.doma_protocol import DomaProtocolClient

@dataclass
class FractionShare:
    """Represents a fractional share of a domain"""
    domain_id: int
    owner_id: int
    share_percentage: float
    share_tokens: int
    purchase_price: float
    purchase_date: datetime
    voting_power: float

@dataclass
class FractionalizationProposal:
    """Proposal for domain fractionalization"""
    domain_id: int
    proposer_id: int
    total_shares: int
    share_price: float
    minimum_investment: float
    voting_threshold: float
    proposal_expires: datetime
    governance_model: str

class DomainFractionalizationService:
    """
    Advanced domain fractionalization service enabling shared ownership
    and governance of high-value domains through the Doma Protocol
    """
    
    def __init__(self):
        self.doma_client = DomaProtocolClient()
        
        # Fractionalization parameters
        self.min_domain_value = 5000  # Minimum value for fractionalization
        self.max_shares = 10000       # Maximum number of shares per domain
        self.min_share_price = 10     # Minimum price per share
        self.governance_quorum = 0.51 # 51% quorum for governance decisions
        
        # ERC-20 contract ABI for fractional tokens (simplified)
        self.fraction_token_abi = [
            {
                "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
                "name": "mint",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "from", "type": "address"}, {"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
                "name": "transferFrom",
                "outputs": [{"name": "", "type": "bool"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [{"name": "account", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            }
        ]
    
    def create_fractionalization_proposal(self, domain_id: int, proposer_id: int,
                                        fractionalization_params: Dict) -> Dict:
        """
        Create a proposal to fractionalize a domain
        
        Args:
            domain_id: ID of the domain to fractionalize
            proposer_id: ID of the user proposing fractionalization
            fractionalization_params: Parameters for fractionalization
            
        Returns:
            Proposal creation result
        """
        # Validate domain
        domain = Domain.query.get(domain_id)
        if not domain:
            raise ValueError("Domain not found")
        
        if domain.owner_id != proposer_id:
            raise ValueError("Only domain owner can propose fractionalization")
        
        if domain.estimated_value < self.min_domain_value:
            raise ValueError(f"Domain value must be at least ${self.min_domain_value}")
        
        # Validate parameters
        total_shares = fractionalization_params.get('total_shares', 1000)
        if total_shares > self.max_shares:
            raise ValueError(f"Maximum {self.max_shares} shares allowed")
        
        share_price = domain.estimated_value / total_shares
        if share_price < self.min_share_price:
            raise ValueError(f"Share price too low. Reduce total shares.")
        
        # Create proposal
        proposal = FractionalizationProposal(
            domain_id=domain_id,
            proposer_id=proposer_id,
            total_shares=total_shares,
            share_price=share_price,
            minimum_investment=fractionalization_params.get('minimum_investment', share_price),
            voting_threshold=fractionalization_params.get('voting_threshold', 0.6),
            proposal_expires=datetime.utcnow() + timedelta(days=7),
            governance_model=fractionalization_params.get('governance_model', 'democratic')
        )
        
        # Store proposal in database (would need a proposals table in production)
        proposal_data = {
            'domain_id': domain_id,
            'proposer_id': proposer_id,
            'proposal_type': 'fractionalization',
            'parameters': {
                'total_shares': total_shares,
                'share_price': share_price,
                'minimum_investment': proposal.minimum_investment,
                'voting_threshold': proposal.voting_threshold,
                'governance_model': proposal.governance_model
            },
            'status': 'active',
            'expires_at': proposal.proposal_expires
        }
        
        return {
            'success': True,
            'proposal_id': f"FRAC_{domain_id}_{int(datetime.utcnow().timestamp())}",
            'proposal': proposal_data,
            'estimated_completion': proposal.proposal_expires.isoformat(),
            'next_steps': [
                'Deploy fractional token contract',
                'Set up governance structure',
                'Begin share offering'
            ]
        }
    
    def execute_fractionalization(self, domain_id: int, chain_name: str,
                                fractionalization_params: Dict) -> Dict:
        """
        Execute domain fractionalization on blockchain
        
        Args:
            domain_id: ID of the domain to fractionalize
            chain_name: Target blockchain network
            fractionalization_params: Fractionalization parameters
            
        Returns:
            Fractionalization execution result
        """
        domain = Domain.query.get(domain_id)
        if not domain:
            raise ValueError("Domain not found")
        
        if not domain.token_id:
            raise ValueError("Domain must be tokenized before fractionalization")
        
        try:
            # Deploy fractional token contract
            token_contract_address = self._deploy_fractional_token_contract(
                domain, chain_name, fractionalization_params
            )
            
            # Lock original NFT in fractionalization contract
            lock_tx_hash = self._lock_original_nft(domain, chain_name, token_contract_address)
            
            # Mint fractional tokens
            mint_tx_hash = self._mint_fractional_tokens(
                domain, chain_name, token_contract_address, fractionalization_params
            )
            
            # Update domain record
            domain.is_fractionalized = True
            domain.fraction_contract_address = token_contract_address
            domain.total_shares = fractionalization_params['total_shares']
            domain.share_price = fractionalization_params['share_price']
            db.session.commit()
            
            # Create transaction records
            self._create_fractionalization_transactions(
                domain, lock_tx_hash, mint_tx_hash, fractionalization_params
            )
            
            return {
                'success': True,
                'domain_id': domain_id,
                'token_contract_address': token_contract_address,
                'lock_transaction': lock_tx_hash,
                'mint_transaction': mint_tx_hash,
                'total_shares': fractionalization_params['total_shares'],
                'share_price': fractionalization_params['share_price'],
                'status': 'fractionalized'
            }
            
        except Exception as e:
            raise Exception(f"Fractionalization failed: {str(e)}")
    
    def purchase_fractional_shares(self, domain_id: int, buyer_id: int,
                                 share_amount: int, payment_details: Dict) -> Dict:
        """
        Purchase fractional shares of a domain
        
        Args:
            domain_id: ID of the fractionalized domain
            buyer_id: ID of the buyer
            share_amount: Number of shares to purchase
            payment_details: Payment information
            
        Returns:
            Purchase result
        """
        domain = Domain.query.get(domain_id)
        if not domain or not domain.is_fractionalized:
            raise ValueError("Domain not found or not fractionalized")
        
        # Calculate purchase cost
        total_cost = share_amount * domain.share_price
        
        # Validate purchase
        if share_amount <= 0:
            raise ValueError("Share amount must be positive")
        
        if total_cost < domain.minimum_investment:
            raise ValueError(f"Minimum investment is ${domain.minimum_investment}")
        
        # Check available shares
        available_shares = self._get_available_shares(domain_id)
        if share_amount > available_shares:
            raise ValueError(f"Only {available_shares} shares available")
        
        try:
            # Process payment (simplified - would integrate with payment processor)
            payment_result = self._process_share_payment(total_cost, payment_details)
            
            # Transfer fractional tokens
            transfer_tx_hash = self._transfer_fractional_tokens(
                domain, buyer_id, share_amount
            )
            
            # Create share record
            share = FractionShare(
                domain_id=domain_id,
                owner_id=buyer_id,
                share_percentage=(share_amount / domain.total_shares) * 100,
                share_tokens=share_amount,
                purchase_price=total_cost,
                purchase_date=datetime.utcnow(),
                voting_power=(share_amount / domain.total_shares)
            )
            
            # Store share ownership (would need shares table in production)
            self._record_share_ownership(share)
            
            # Create transaction record
            transaction = DomainTransaction(
                domain_id=domain_id,
                user_id=buyer_id,
                transaction_type='share_purchase',
                transaction_hash=transfer_tx_hash,
                status='confirmed',
                transaction_metadata={
                    'share_amount': share_amount,
                    'share_price': domain.share_price,
                    'total_cost': total_cost,
                    'payment_method': payment_details.get('method', 'crypto')
                }
            )
            db.session.add(transaction)
            db.session.commit()
            
            return {
                'success': True,
                'transaction_hash': transfer_tx_hash,
                'shares_purchased': share_amount,
                'total_cost': total_cost,
                'ownership_percentage': share.share_percentage,
                'voting_power': share.voting_power,
                'share_details': {
                    'domain_name': domain.name,
                    'share_price': domain.share_price,
                    'total_shares': domain.total_shares
                }
            }
            
        except Exception as e:
            raise Exception(f"Share purchase failed: {str(e)}")
    
    def create_governance_proposal(self, domain_id: int, proposer_id: int,
                                 proposal_details: Dict) -> Dict:
        """
        Create a governance proposal for a fractionalized domain
        
        Args:
            domain_id: ID of the fractionalized domain
            proposer_id: ID of the proposal creator
            proposal_details: Proposal details
            
        Returns:
            Governance proposal result
        """
        # Validate proposer has shares
        proposer_shares = self._get_user_shares(domain_id, proposer_id)
        if not proposer_shares or proposer_shares.voting_power < 0.05:  # 5% minimum
            raise ValueError("Insufficient voting power to create proposal")
        
        proposal_types = {
            'sell_domain': 'Proposal to sell the entire domain',
            'change_management': 'Change domain management strategy',
            'distribute_revenue': 'Distribute domain revenue to shareholders',
            'upgrade_domain': 'Invest in domain improvements',
            'change_governance': 'Modify governance parameters'
        }
        
        proposal_type = proposal_details.get('type')
        if proposal_type not in proposal_types:
            raise ValueError(f"Invalid proposal type. Allowed: {list(proposal_types.keys())}")
        
        # Create governance proposal
        proposal_id = f"GOV_{domain_id}_{proposer_id}_{int(datetime.utcnow().timestamp())}"
        
        proposal = {
            'proposal_id': proposal_id,
            'domain_id': domain_id,
            'proposer_id': proposer_id,
            'type': proposal_type,
            'title': proposal_details.get('title', proposal_types[proposal_type]),
            'description': proposal_details.get('description', ''),
            'parameters': proposal_details.get('parameters', {}),
            'voting_starts': datetime.utcnow(),
            'voting_ends': datetime.utcnow() + timedelta(days=7),
            'quorum_required': self.governance_quorum,
            'status': 'active',
            'votes_for': 0,
            'votes_against': 0,
            'total_voting_power': 0
        }
        
        # Store proposal (would need governance_proposals table)
        self._store_governance_proposal(proposal)
        
        return {
            'success': True,
            'proposal_id': proposal_id,
            'proposal': proposal,
            'voting_period': '7 days',
            'quorum_required': f"{self.governance_quorum * 100}%"
        }
    
    def vote_on_proposal(self, proposal_id: str, voter_id: int, vote: str) -> Dict:
        """
        Vote on a governance proposal
        
        Args:
            proposal_id: ID of the proposal
            voter_id: ID of the voter
            vote: 'for' or 'against'
            
        Returns:
            Voting result
        """
        if vote not in ['for', 'against']:
            raise ValueError("Vote must be 'for' or 'against'")
        
        # Get proposal
        proposal = self._get_governance_proposal(proposal_id)
        if not proposal:
            raise ValueError("Proposal not found")
        
        if proposal['status'] != 'active':
            raise ValueError("Proposal is not active")
        
        if datetime.utcnow() > proposal['voting_ends']:
            raise ValueError("Voting period has ended")
        
        # Get voter's shares
        voter_shares = self._get_user_shares(proposal['domain_id'], voter_id)
        if not voter_shares:
            raise ValueError("Voter has no shares in this domain")
        
        # Check if already voted
        if self._has_voted(proposal_id, voter_id):
            raise ValueError("User has already voted on this proposal")
        
        # Record vote
        vote_record = {
            'proposal_id': proposal_id,
            'voter_id': voter_id,
            'vote': vote,
            'voting_power': voter_shares.voting_power,
            'timestamp': datetime.utcnow()
        }
        
        self._record_vote(vote_record)
        
        # Update proposal vote counts
        if vote == 'for':
            proposal['votes_for'] += voter_shares.voting_power
        else:
            proposal['votes_against'] += voter_shares.voting_power
        
        proposal['total_voting_power'] += voter_shares.voting_power
        
        # Check if proposal can be executed
        if proposal['total_voting_power'] >= proposal['quorum_required']:
            if proposal['votes_for'] > proposal['votes_against']:
                proposal['status'] = 'passed'
                execution_result = self._execute_governance_proposal(proposal)
            else:
                proposal['status'] = 'rejected'
                execution_result = None
        else:
            execution_result = None
        
        self._update_governance_proposal(proposal)
        
        return {
            'success': True,
            'vote_recorded': vote,
            'voting_power_used': voter_shares.voting_power,
            'proposal_status': proposal['status'],
            'current_results': {
                'votes_for': proposal['votes_for'],
                'votes_against': proposal['votes_against'],
                'total_voting_power': proposal['total_voting_power'],
                'quorum_reached': proposal['total_voting_power'] >= proposal['quorum_required']
            },
            'execution_result': execution_result
        }
    
    def get_domain_shareholders(self, domain_id: int) -> List[Dict]:
        """Get all shareholders of a fractionalized domain"""
        # In production, this would query the shares table
        shareholders = self._get_all_shareholders(domain_id)
        
        return [
            {
                'user_id': share.owner_id,
                'share_percentage': share.share_percentage,
                'share_tokens': share.share_tokens,
                'voting_power': share.voting_power,
                'purchase_date': share.purchase_date.isoformat(),
                'purchase_price': share.purchase_price
            }
            for share in shareholders
        ]
    
    def calculate_revenue_distribution(self, domain_id: int, total_revenue: float) -> Dict:
        """Calculate revenue distribution among shareholders"""
        shareholders = self._get_all_shareholders(domain_id)
        
        distributions = []
        total_distributed = 0
        
        for share in shareholders:
            share_revenue = total_revenue * (share.share_percentage / 100)
            distributions.append({
                'user_id': share.owner_id,
                'share_percentage': share.share_percentage,
                'revenue_amount': round(share_revenue, 2)
            })
            total_distributed += share_revenue
        
        return {
            'domain_id': domain_id,
            'total_revenue': total_revenue,
            'total_distributed': round(total_distributed, 2),
            'distributions': distributions,
            'distribution_date': datetime.utcnow().isoformat()
        }
    
    # Helper methods (simplified implementations)
    
    def _deploy_fractional_token_contract(self, domain: Domain, chain_name: str,
                                        params: Dict) -> str:
        """Deploy ERC-20 contract for fractional tokens"""
        # Simplified - would deploy actual contract
        return f"0x{hash(f'{domain.name}_{chain_name}') % (10**40):040x}"
    
    def _lock_original_nft(self, domain: Domain, chain_name: str, 
                          token_contract: str) -> str:
        """Lock original NFT in fractionalization contract"""
        # Simplified - would create actual transaction
        return f"0x{hash(f'lock_{domain.token_id}_{token_contract}') % (10**64):064x}"
    
    def _mint_fractional_tokens(self, domain: Domain, chain_name: str,
                               token_contract: str, params: Dict) -> str:
        """Mint fractional tokens"""
        # Simplified - would create actual transaction
        total_shares = params.get('total_shares', 0)
        return f"0x{hash(f'mint_{domain.token_id}_{total_shares}') % (10**64):064x}"
    
    def _create_fractionalization_transactions(self, domain: Domain, lock_tx: str,
                                             mint_tx: str, params: Dict):
        """Create transaction records for fractionalization"""
        transactions = [
            DomainTransaction(
                domain_id=domain.id,
                user_id=domain.owner_id,
                transaction_type='nft_lock',
                transaction_hash=lock_tx,
                status='confirmed',
                transaction_metadata={'action': 'lock_for_fractionalization'}
            ),
            DomainTransaction(
                domain_id=domain.id,
                user_id=domain.owner_id,
                transaction_type='token_mint',
                transaction_hash=mint_tx,
                status='confirmed',
                transaction_metadata={
                    'total_shares': params['total_shares'],
                    'share_price': params['share_price']
                }
            )
        ]
        
        for tx in transactions:
            db.session.add(tx)
        db.session.commit()
    
    def _get_available_shares(self, domain_id: int) -> int:
        """Get number of available shares for purchase"""
        domain = Domain.query.get(domain_id)
        if not domain:
            return 0
        
        # Simplified - would calculate from actual share ownership
        return max(0, domain.total_shares - int(domain.total_shares * 0.1))  # 10% sold
    
    def _process_share_payment(self, amount: float, payment_details: Dict) -> Dict:
        """Process payment for share purchase"""
        # Simplified payment processing
        return {
            'payment_id': f"PAY_{int(datetime.utcnow().timestamp())}",
            'amount': amount,
            'status': 'confirmed'
        }
    
    def _transfer_fractional_tokens(self, domain: Domain, buyer_id: int, 
                                   share_amount: int) -> str:
        """Transfer fractional tokens to buyer"""
        # Simplified - would create actual blockchain transaction
        return f"0x{hash(f'transfer_{domain.id}_{buyer_id}_{share_amount}') % (10**64):064x}"
    
    def _record_share_ownership(self, share: FractionShare):
        """Record share ownership in database"""
        # In production, would store in shares table
        pass
    
    def _get_user_shares(self, domain_id: int, user_id: int) -> Optional[FractionShare]:
        """Get user's shares in a domain"""
        # Simplified - would query shares table
        return FractionShare(
            domain_id=domain_id,
            owner_id=user_id,
            share_percentage=10.0,
            share_tokens=100,
            purchase_price=1000.0,
            purchase_date=datetime.utcnow(),
            voting_power=0.1
        )
    
    def _store_governance_proposal(self, proposal: Dict):
        """Store governance proposal in database"""
        # In production, would store in governance_proposals table
        pass
    
    def _get_governance_proposal(self, proposal_id: str) -> Optional[Dict]:
        """Get governance proposal by ID"""
        # Simplified - would query database
        return {
            'proposal_id': proposal_id,
            'domain_id': 1,
            'status': 'active',
            'voting_ends': datetime.utcnow() + timedelta(days=7),
            'votes_for': 0,
            'votes_against': 0,
            'total_voting_power': 0,
            'quorum_required': 0.51
        }
    
    def _has_voted(self, proposal_id: str, voter_id: int) -> bool:
        """Check if user has already voted"""
        # Simplified - would query votes table
        return False
    
    def _record_vote(self, vote_record: Dict):
        """Record vote in database"""
        # In production, would store in votes table
        pass
    
    def _execute_governance_proposal(self, proposal: Dict) -> Dict:
        """Execute a passed governance proposal"""
        # Implementation depends on proposal type
        return {
            'executed': True,
            'execution_date': datetime.utcnow().isoformat(),
            'result': 'Proposal executed successfully'
        }
    
    def _update_governance_proposal(self, proposal: Dict):
        """Update governance proposal in database"""
        # In production, would update database
        pass
    
    def _get_all_shareholders(self, domain_id: int) -> List[FractionShare]:
        """Get all shareholders of a domain"""
        # Simplified - would query shares table
        return [
            FractionShare(
                domain_id=domain_id,
                owner_id=1,
                share_percentage=60.0,
                share_tokens=600,
                purchase_price=6000.0,
                purchase_date=datetime.utcnow(),
                voting_power=0.6
            ),
            FractionShare(
                domain_id=domain_id,
                owner_id=2,
                share_percentage=40.0,
                share_tokens=400,
                purchase_price=4000.0,
                purchase_date=datetime.utcnow(),
                voting_power=0.4
            )
        ]

