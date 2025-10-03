import math
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from src.models.domain import Domain, DomainTransaction, db
from src.models.user import User
from src.services.doma_protocol import DomaProtocolClient

@dataclass
class LiquidityPool:
    """Represents a liquidity pool for domain trading"""
    pool_id: str
    domain_id: int
    base_token: str  # e.g., "USDC", "ETH"
    domain_token_reserve: float
    base_token_reserve: float
    total_liquidity_tokens: float
    fee_rate: float
    created_at: datetime
    last_updated: datetime

@dataclass
class LiquidityPosition:
    """Represents a user's liquidity position"""
    position_id: str
    pool_id: str
    user_id: int
    liquidity_tokens: float
    initial_domain_amount: float
    initial_base_amount: float
    created_at: datetime
    rewards_earned: float

@dataclass
class TradeQuote:
    """Represents a trade quote from the AMM"""
    input_token: str
    output_token: str
    input_amount: float
    output_amount: float
    price_impact: float
    fee_amount: float
    minimum_output: float
    valid_until: datetime

class AutomatedMarketMaker:
    """
    Automated Market Maker (AMM) for domain token trading
    Provides liquidity pools, automated pricing, and yield farming
    """
    
    def __init__(self):
        self.doma_client = DomaProtocolClient()
        
        # AMM parameters
        self.default_fee_rate = 0.003  # 0.3% trading fee
        self.slippage_tolerance = 0.02  # 2% default slippage
        self.minimum_liquidity = 1000   # Minimum liquidity for pool creation
        self.price_impact_threshold = 0.05  # 5% price impact warning
        
        # Supported base tokens
        self.supported_base_tokens = {
            'USDC': {
                'decimals': 6,
                'contract_address': '0xA0b86a33E6441b8dB2B2b0b0b0b0b0b0b0b0b0b0',
                'price_feed': 'usdc_usd'
            },
            'ETH': {
                'decimals': 18,
                'contract_address': '0x0000000000000000000000000000000000000000',
                'price_feed': 'eth_usd'
            },
            'MATIC': {
                'decimals': 18,
                'contract_address': '0x0000000000000000000000000000000000000001',
                'price_feed': 'matic_usd'
            }
        }
        
        # Yield farming parameters
        self.base_apy = 0.05  # 5% base APY
        self.volume_multiplier = 0.1  # Additional APY based on volume
        self.loyalty_bonus = 0.02  # 2% bonus for long-term LPs
    
    def create_liquidity_pool(self, domain_id: int, base_token: str,
                            initial_domain_amount: float, initial_base_amount: float,
                            creator_id: int) -> Dict:
        """
        Create a new liquidity pool for a domain
        
        Args:
            domain_id: ID of the domain to create pool for
            base_token: Base token for the pool (USDC, ETH, etc.)
            initial_domain_amount: Initial domain tokens to add
            initial_base_amount: Initial base tokens to add
            creator_id: ID of the pool creator
            
        Returns:
            Pool creation result
        """
        # Validate inputs
        domain = Domain.query.get(domain_id)
        if not domain:
            raise ValueError("Domain not found")
        
        if not domain.token_id:
            raise ValueError("Domain must be tokenized before creating pool")
        
        if base_token not in self.supported_base_tokens:
            raise ValueError(f"Unsupported base token: {base_token}")
        
        if initial_base_amount < self.minimum_liquidity:
            raise ValueError(f"Minimum liquidity is {self.minimum_liquidity} {base_token}")
        
        # Check if pool already exists
        existing_pool = self._get_pool_by_domain_and_base(domain_id, base_token)
        if existing_pool:
            raise ValueError("Pool already exists for this domain/base token pair")
        
        try:
            # Calculate initial liquidity tokens (geometric mean)
            initial_liquidity = math.sqrt(initial_domain_amount * initial_base_amount)
            
            # Create pool
            pool_id = f"POOL_{domain_id}_{base_token}_{int(datetime.utcnow().timestamp())}"
            
            pool = LiquidityPool(
                pool_id=pool_id,
                domain_id=domain_id,
                base_token=base_token,
                domain_token_reserve=initial_domain_amount,
                base_token_reserve=initial_base_amount,
                total_liquidity_tokens=initial_liquidity,
                fee_rate=self.default_fee_rate,
                created_at=datetime.utcnow(),
                last_updated=datetime.utcnow()
            )
            
            # Deploy pool contract on blockchain
            pool_contract_address = self._deploy_pool_contract(pool)
            
            # Transfer tokens to pool
            domain_transfer_tx = self._transfer_domain_tokens_to_pool(
                domain_id, initial_domain_amount, pool_contract_address
            )
            base_transfer_tx = self._transfer_base_tokens_to_pool(
                base_token, initial_base_amount, pool_contract_address, creator_id
            )
            
            # Create initial liquidity position for creator
            position = LiquidityPosition(
                position_id=f"POS_{pool_id}_{creator_id}",
                pool_id=pool_id,
                user_id=creator_id,
                liquidity_tokens=initial_liquidity,
                initial_domain_amount=initial_domain_amount,
                initial_base_amount=initial_base_amount,
                created_at=datetime.utcnow(),
                rewards_earned=0.0
            )
            
            # Store pool and position data
            self._store_liquidity_pool(pool)
            self._store_liquidity_position(position)
            
            # Create transaction records
            self._create_pool_creation_transactions(
                pool, domain_transfer_tx, base_transfer_tx, creator_id
            )
            
            return {
                'success': True,
                'pool_id': pool_id,
                'pool_contract_address': pool_contract_address,
                'initial_price': initial_base_amount / initial_domain_amount,
                'liquidity_tokens_minted': initial_liquidity,
                'position_id': position.position_id,
                'transactions': {
                    'domain_transfer': domain_transfer_tx,
                    'base_transfer': base_transfer_tx
                }
            }
            
        except Exception as e:
            raise Exception(f"Pool creation failed: {str(e)}")
    
    def add_liquidity(self, pool_id: str, user_id: int,
                     domain_amount: float, base_amount: float) -> Dict:
        """
        Add liquidity to an existing pool
        
        Args:
            pool_id: ID of the liquidity pool
            user_id: ID of the liquidity provider
            domain_amount: Amount of domain tokens to add
            base_amount: Amount of base tokens to add
            
        Returns:
            Liquidity addition result
        """
        pool = self._get_pool_by_id(pool_id)
        if not pool:
            raise ValueError("Pool not found")
        
        # Calculate optimal amounts to maintain pool ratio
        current_ratio = pool.base_token_reserve / pool.domain_token_reserve
        optimal_base_amount = domain_amount * current_ratio
        optimal_domain_amount = base_amount / current_ratio
        
        # Use the smaller of the two to maintain ratio
        if optimal_base_amount <= base_amount:
            final_domain_amount = domain_amount
            final_base_amount = optimal_base_amount
        else:
            final_domain_amount = optimal_domain_amount
            final_base_amount = base_amount
        
        # Calculate liquidity tokens to mint
        liquidity_tokens = min(
            (final_domain_amount / pool.domain_token_reserve) * pool.total_liquidity_tokens,
            (final_base_amount / pool.base_token_reserve) * pool.total_liquidity_tokens
        )
        
        try:
            # Transfer tokens to pool
            domain_tx = self._transfer_domain_tokens_to_pool(
                pool.domain_id, final_domain_amount, pool_id
            )
            base_tx = self._transfer_base_tokens_to_pool(
                pool.base_token, final_base_amount, pool_id, user_id
            )
            
            # Update pool reserves
            pool.domain_token_reserve += final_domain_amount
            pool.base_token_reserve += final_base_amount
            pool.total_liquidity_tokens += liquidity_tokens
            pool.last_updated = datetime.utcnow()
            
            # Create or update user's liquidity position
            existing_position = self._get_user_position(pool_id, user_id)
            if existing_position:
                existing_position.liquidity_tokens += liquidity_tokens
                existing_position.initial_domain_amount += final_domain_amount
                existing_position.initial_base_amount += final_base_amount
            else:
                position = LiquidityPosition(
                    position_id=f"POS_{pool_id}_{user_id}_{int(datetime.utcnow().timestamp())}",
                    pool_id=pool_id,
                    user_id=user_id,
                    liquidity_tokens=liquidity_tokens,
                    initial_domain_amount=final_domain_amount,
                    initial_base_amount=final_base_amount,
                    created_at=datetime.utcnow(),
                    rewards_earned=0.0
                )
                self._store_liquidity_position(position)
            
            # Update pool data
            self._update_liquidity_pool(pool)
            
            # Create transaction record
            transaction = DomainTransaction(
                domain_id=pool.domain_id,
                user_id=user_id,
                transaction_type='add_liquidity',
                transaction_hash=f"{domain_tx}_{base_tx}",
                status='confirmed',
                transaction_metadata={
                    'pool_id': pool_id,
                    'domain_amount': final_domain_amount,
                    'base_amount': final_base_amount,
                    'liquidity_tokens': liquidity_tokens
                }
            )
            db.session.add(transaction)
            db.session.commit()
            
            return {
                'success': True,
                'liquidity_tokens_minted': liquidity_tokens,
                'domain_amount_used': final_domain_amount,
                'base_amount_used': final_base_amount,
                'unused_domain': domain_amount - final_domain_amount,
                'unused_base': base_amount - final_base_amount,
                'new_pool_share': (liquidity_tokens / pool.total_liquidity_tokens) * 100,
                'transactions': {
                    'domain_transfer': domain_tx,
                    'base_transfer': base_tx
                }
            }
            
        except Exception as e:
            raise Exception(f"Add liquidity failed: {str(e)}")
    
    def remove_liquidity(self, pool_id: str, user_id: int,
                        liquidity_tokens: float) -> Dict:
        """
        Remove liquidity from a pool
        
        Args:
            pool_id: ID of the liquidity pool
            user_id: ID of the liquidity provider
            liquidity_tokens: Amount of liquidity tokens to burn
            
        Returns:
            Liquidity removal result
        """
        pool = self._get_pool_by_id(pool_id)
        if not pool:
            raise ValueError("Pool not found")
        
        position = self._get_user_position(pool_id, user_id)
        if not position or position.liquidity_tokens < liquidity_tokens:
            raise ValueError("Insufficient liquidity tokens")
        
        # Calculate withdrawal amounts
        share = liquidity_tokens / pool.total_liquidity_tokens
        domain_amount = pool.domain_token_reserve * share
        base_amount = pool.base_token_reserve * share
        
        # Calculate rewards
        rewards = self._calculate_liquidity_rewards(position, pool)
        
        try:
            # Transfer tokens from pool to user
            domain_tx = self._transfer_domain_tokens_from_pool(
                pool.domain_id, domain_amount, pool_id, user_id
            )
            base_tx = self._transfer_base_tokens_from_pool(
                pool.base_token, base_amount, pool_id, user_id
            )
            
            # Transfer rewards if any
            rewards_tx = None
            if rewards > 0:
                rewards_tx = self._transfer_rewards(user_id, rewards, pool.base_token)
            
            # Update pool reserves
            pool.domain_token_reserve -= domain_amount
            pool.base_token_reserve -= base_amount
            pool.total_liquidity_tokens -= liquidity_tokens
            pool.last_updated = datetime.utcnow()
            
            # Update user position
            position.liquidity_tokens -= liquidity_tokens
            position.rewards_earned += rewards
            
            # Remove position if no tokens left
            if position.liquidity_tokens <= 0:
                self._remove_liquidity_position(position.position_id)
            else:
                self._update_liquidity_position(position)
            
            # Update pool data
            self._update_liquidity_pool(pool)
            
            # Create transaction record
            transaction = DomainTransaction(
                domain_id=pool.domain_id,
                user_id=user_id,
                transaction_type='remove_liquidity',
                transaction_hash=f"{domain_tx}_{base_tx}",
                status='confirmed',
                transaction_metadata={
                    'pool_id': pool_id,
                    'liquidity_tokens_burned': liquidity_tokens,
                    'domain_amount_received': domain_amount,
                    'base_amount_received': base_amount,
                    'rewards_earned': rewards
                }
            )
            db.session.add(transaction)
            db.session.commit()
            
            return {
                'success': True,
                'domain_amount_received': domain_amount,
                'base_amount_received': base_amount,
                'rewards_earned': rewards,
                'liquidity_tokens_burned': liquidity_tokens,
                'remaining_liquidity_tokens': position.liquidity_tokens if position.liquidity_tokens > 0 else 0,
                'transactions': {
                    'domain_transfer': domain_tx,
                    'base_transfer': base_tx,
                    'rewards_transfer': rewards_tx
                }
            }
            
        except Exception as e:
            raise Exception(f"Remove liquidity failed: {str(e)}")
    
    def get_trade_quote(self, pool_id: str, input_token: str,
                       input_amount: float, slippage_tolerance: Optional[float] = None) -> TradeQuote:
        """
        Get a quote for trading tokens in a pool
        
        Args:
            pool_id: ID of the liquidity pool
            input_token: Token being sold ('domain' or base token symbol)
            input_amount: Amount of input token
            slippage_tolerance: Maximum acceptable slippage
            
        Returns:
            Trade quote
        """
        pool = self._get_pool_by_id(pool_id)
        if not pool:
            raise ValueError("Pool not found")
        
        slippage = slippage_tolerance or self.slippage_tolerance
        
        # Determine input/output reserves
        if input_token == 'domain':
            input_reserve = pool.domain_token_reserve
            output_reserve = pool.base_token_reserve
            output_token = pool.base_token
        elif input_token == pool.base_token:
            input_reserve = pool.base_token_reserve
            output_reserve = pool.domain_token_reserve
            output_token = 'domain'
        else:
            raise ValueError(f"Invalid input token: {input_token}")
        
        # Calculate output amount using constant product formula (x * y = k)
        # With fee deduction
        input_amount_with_fee = input_amount * (1 - pool.fee_rate)
        output_amount = (output_reserve * input_amount_with_fee) / (input_reserve + input_amount_with_fee)
        
        # Calculate price impact
        price_before = output_reserve / input_reserve
        new_input_reserve = input_reserve + input_amount
        new_output_reserve = output_reserve - output_amount
        price_after = new_output_reserve / new_input_reserve
        price_impact = abs(price_after - price_before) / price_before
        
        # Calculate fee amount
        fee_amount = input_amount * pool.fee_rate
        
        # Calculate minimum output with slippage
        minimum_output = output_amount * (1 - slippage)
        
        return TradeQuote(
            input_token=input_token,
            output_token=output_token,
            input_amount=input_amount,
            output_amount=output_amount,
            price_impact=price_impact,
            fee_amount=fee_amount,
            minimum_output=minimum_output,
            valid_until=datetime.utcnow() + timedelta(minutes=5)
        )
    
    def execute_trade(self, pool_id: str, quote: TradeQuote, trader_id: int) -> Dict:
        """
        Execute a trade based on a quote
        
        Args:
            pool_id: ID of the liquidity pool
            quote: Trade quote to execute
            trader_id: ID of the trader
            
        Returns:
            Trade execution result
        """
        # Validate quote is still valid
        if datetime.utcnow() > quote.valid_until:
            raise ValueError("Quote has expired")
        
        pool = self._get_pool_by_id(pool_id)
        if not pool:
            raise ValueError("Pool not found")
        
        # Check for excessive price impact
        if quote.price_impact > self.price_impact_threshold:
            raise ValueError(f"Price impact too high: {quote.price_impact:.2%}")
        
        try:
            # Execute the trade
            if quote.input_token == 'domain':
                # Selling domain tokens for base tokens
                input_tx = self._transfer_domain_tokens_to_pool(
                    pool.domain_id, quote.input_amount, pool_id
                )
                output_tx = self._transfer_base_tokens_from_pool(
                    pool.base_token, quote.output_amount, pool_id, trader_id
                )
                
                # Update pool reserves
                pool.domain_token_reserve += quote.input_amount
                pool.base_token_reserve -= quote.output_amount
                
            else:
                # Selling base tokens for domain tokens
                input_tx = self._transfer_base_tokens_to_pool(
                    pool.base_token, quote.input_amount, pool_id, trader_id
                )
                output_tx = self._transfer_domain_tokens_from_pool(
                    pool.domain_id, quote.output_amount, pool_id, trader_id
                )
                
                # Update pool reserves
                pool.base_token_reserve += quote.input_amount
                pool.domain_token_reserve -= quote.output_amount
            
            # Update pool timestamp
            pool.last_updated = datetime.utcnow()
            self._update_liquidity_pool(pool)
            
            # Distribute fees to liquidity providers
            self._distribute_trading_fees(pool_id, quote.fee_amount)
            
            # Create transaction record
            transaction = DomainTransaction(
                domain_id=pool.domain_id,
                user_id=trader_id,
                transaction_type='swap',
                transaction_hash=f"{input_tx}_{output_tx}",
                status='confirmed',
                transaction_metadata={
                    'pool_id': pool_id,
                    'input_token': quote.input_token,
                    'output_token': quote.output_token,
                    'input_amount': quote.input_amount,
                    'output_amount': quote.output_amount,
                    'price_impact': quote.price_impact,
                    'fee_amount': quote.fee_amount
                }
            )
            db.session.add(transaction)
            db.session.commit()
            
            return {
                'success': True,
                'input_amount': quote.input_amount,
                'output_amount': quote.output_amount,
                'price_impact': quote.price_impact,
                'fee_paid': quote.fee_amount,
                'execution_price': quote.output_amount / quote.input_amount,
                'transactions': {
                    'input_transfer': input_tx,
                    'output_transfer': output_tx
                }
            }
            
        except Exception as e:
            raise Exception(f"Trade execution failed: {str(e)}")
    
    def get_pool_analytics(self, pool_id: str) -> Dict:
        """Get comprehensive analytics for a liquidity pool"""
        pool = self._get_pool_by_id(pool_id)
        if not pool:
            raise ValueError("Pool not found")
        
        # Calculate current price
        current_price = pool.base_token_reserve / pool.domain_token_reserve
        
        # Get 24h trading volume
        volume_24h = self._get_trading_volume_24h(pool_id)
        
        # Calculate TVL (Total Value Locked)
        base_token_price = self._get_token_price(pool.base_token)
        tvl = (pool.base_token_reserve * 2) * base_token_price  # Simplified TVL calculation
        
        # Calculate APY for liquidity providers
        apy = self._calculate_pool_apy(pool_id)
        
        # Get liquidity provider count
        lp_count = self._get_liquidity_provider_count(pool_id)
        
        # Calculate price change
        price_change_24h = self._get_price_change_24h(pool_id)
        
        return {
            'pool_id': pool_id,
            'domain_name': Domain.query.get(pool.domain_id).name,
            'base_token': pool.base_token,
            'current_price': current_price,
            'price_change_24h': price_change_24h,
            'reserves': {
                'domain_tokens': pool.domain_token_reserve,
                'base_tokens': pool.base_token_reserve
            },
            'tvl': tvl,
            'volume_24h': volume_24h,
            'fee_rate': pool.fee_rate,
            'apy': apy,
            'liquidity_providers': lp_count,
            'total_liquidity_tokens': pool.total_liquidity_tokens,
            'created_at': pool.created_at.isoformat(),
            'last_updated': pool.last_updated.isoformat()
        }
    
    def get_user_positions(self, user_id: int) -> List[Dict]:
        """Get all liquidity positions for a user"""
        positions = self._get_user_positions(user_id)
        
        result = []
        for position in positions:
            pool = self._get_pool_by_id(position.pool_id)
            if not pool:
                continue
            
            # Calculate current value
            share = position.liquidity_tokens / pool.total_liquidity_tokens
            current_domain_value = pool.domain_token_reserve * share
            current_base_value = pool.base_token_reserve * share
            
            # Calculate impermanent loss
            il = self._calculate_impermanent_loss(position, pool)
            
            # Calculate pending rewards
            pending_rewards = self._calculate_liquidity_rewards(position, pool)
            
            result.append({
                'position_id': position.position_id,
                'pool_id': position.pool_id,
                'domain_name': Domain.query.get(pool.domain_id).name,
                'base_token': pool.base_token,
                'liquidity_tokens': position.liquidity_tokens,
                'pool_share': share * 100,
                'initial_value': {
                    'domain_amount': position.initial_domain_amount,
                    'base_amount': position.initial_base_amount
                },
                'current_value': {
                    'domain_amount': current_domain_value,
                    'base_amount': current_base_value
                },
                'impermanent_loss': il,
                'rewards_earned': position.rewards_earned,
                'pending_rewards': pending_rewards,
                'created_at': position.created_at.isoformat()
            })
        
        return result
    
    # Helper methods (simplified implementations)
    
    def _get_pool_by_domain_and_base(self, domain_id: int, base_token: str) -> Optional[LiquidityPool]:
        """Check if pool exists for domain/base token pair"""
        # In production, would query pools table
        return None
    
    def _get_pool_by_id(self, pool_id: str) -> Optional[LiquidityPool]:
        """Get pool by ID"""
        # Simplified - would query database
        return LiquidityPool(
            pool_id=pool_id,
            domain_id=1,
            base_token='USDC',
            domain_token_reserve=1000.0,
            base_token_reserve=5000.0,
            total_liquidity_tokens=2236.0,
            fee_rate=0.003,
            created_at=datetime.utcnow(),
            last_updated=datetime.utcnow()
        )
    
    def _deploy_pool_contract(self, pool: LiquidityPool) -> str:
        """Deploy AMM pool contract"""
        # Simplified - would deploy actual contract
        return f"0x{hash(pool.pool_id) % (10**40):040x}"
    
    def _transfer_domain_tokens_to_pool(self, domain_id: int, amount: float, pool_address: str) -> str:
        """Transfer domain tokens to pool"""
        return f"0x{hash(f'domain_to_pool_{domain_id}_{amount}') % (10**64):064x}"
    
    def _transfer_base_tokens_to_pool(self, base_token: str, amount: float, pool_address: str, user_id: int) -> str:
        """Transfer base tokens to pool"""
        return f"0x{hash(f'base_to_pool_{base_token}_{amount}_{user_id}') % (10**64):064x}"
    
    def _transfer_domain_tokens_from_pool(self, domain_id: int, amount: float, pool_id: str, user_id: int) -> str:
        """Transfer domain tokens from pool"""
        return f"0x{hash(f'domain_from_pool_{domain_id}_{amount}_{user_id}') % (10**64):064x}"
    
    def _transfer_base_tokens_from_pool(self, base_token: str, amount: float, pool_id: str, user_id: int) -> str:
        """Transfer base tokens from pool"""
        return f"0x{hash(f'base_from_pool_{base_token}_{amount}_{user_id}') % (10**64):064x}"
    
    def _transfer_rewards(self, user_id: int, amount: float, token: str) -> str:
        """Transfer rewards to user"""
        return f"0x{hash(f'rewards_{user_id}_{amount}_{token}') % (10**64):064x}"
    
    def _store_liquidity_pool(self, pool: LiquidityPool):
        """Store pool in database"""
        # In production, would store in pools table
        pass
    
    def _store_liquidity_position(self, position: LiquidityPosition):
        """Store position in database"""
        # In production, would store in positions table
        pass
    
    def _update_liquidity_pool(self, pool: LiquidityPool):
        """Update pool in database"""
        # In production, would update database
        pass
    
    def _update_liquidity_position(self, position: LiquidityPosition):
        """Update position in database"""
        # In production, would update database
        pass
    
    def _remove_liquidity_position(self, position_id: str):
        """Remove position from database"""
        # In production, would remove from database
        pass
    
    def _get_user_position(self, pool_id: str, user_id: int) -> Optional[LiquidityPosition]:
        """Get user's position in a pool"""
        # Simplified - would query database
        return None
    
    def _get_user_positions(self, user_id: int) -> List[LiquidityPosition]:
        """Get all positions for a user"""
        # Simplified - would query database
        return []
    
    def _calculate_liquidity_rewards(self, position: LiquidityPosition, pool: LiquidityPool) -> float:
        """Calculate pending liquidity rewards"""
        # Simplified rewards calculation
        days_active = (datetime.utcnow() - position.created_at).days
        base_rewards = position.initial_base_amount * self.base_apy * (days_active / 365)
        
        # Volume-based bonus
        volume_bonus = self._get_trading_volume_24h(pool.pool_id) * self.volume_multiplier * (days_active / 365)
        
        # Loyalty bonus
        loyalty_bonus = base_rewards * self.loyalty_bonus if days_active > 30 else 0
        
        return base_rewards + volume_bonus + loyalty_bonus
    
    def _distribute_trading_fees(self, pool_id: str, fee_amount: float):
        """Distribute trading fees to liquidity providers"""
        # In production, would distribute fees proportionally
        pass
    
    def _get_trading_volume_24h(self, pool_id: str) -> float:
        """Get 24h trading volume for pool"""
        # Simplified - would calculate from transactions
        return 1000.0
    
    def _get_token_price(self, token: str) -> float:
        """Get current token price in USD"""
        # Simplified price feed
        prices = {'USDC': 1.0, 'ETH': 2000.0, 'MATIC': 0.8}
        return prices.get(token, 1.0)
    
    def _calculate_pool_apy(self, pool_id: str) -> float:
        """Calculate APY for liquidity providers"""
        # Simplified APY calculation
        return 15.5  # 15.5% APY
    
    def _get_liquidity_provider_count(self, pool_id: str) -> int:
        """Get number of liquidity providers"""
        # Simplified - would count unique LPs
        return 25
    
    def _get_price_change_24h(self, pool_id: str) -> float:
        """Get 24h price change percentage"""
        # Simplified - would calculate from price history
        return 2.5  # 2.5% increase
    
    def _calculate_impermanent_loss(self, position: LiquidityPosition, pool: LiquidityPool) -> float:
        """Calculate impermanent loss for a position"""
        # Simplified IL calculation
        initial_ratio = position.initial_base_amount / position.initial_domain_amount
        current_ratio = pool.base_token_reserve / pool.domain_token_reserve
        
        ratio_change = current_ratio / initial_ratio
        il = 2 * math.sqrt(ratio_change) / (1 + ratio_change) - 1
        
        return il * 100  # Return as percentage
    
    def _create_pool_creation_transactions(self, pool: LiquidityPool, domain_tx: str, base_tx: str, creator_id: int):
        """Create transaction records for pool creation"""
        transaction = DomainTransaction(
            domain_id=pool.domain_id,
            user_id=creator_id,
            transaction_type='create_pool',
            transaction_hash=f"{domain_tx}_{base_tx}",
            status='confirmed',
            transaction_metadata={
                'pool_id': pool.pool_id,
                'base_token': pool.base_token,
                'initial_domain_reserve': pool.domain_token_reserve,
                'initial_base_reserve': pool.base_token_reserve
            }
        )
        db.session.add(transaction)
        db.session.commit()

