import asyncio
import json
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from collections import defaultdict
import statistics
from src.models.domain import Domain, DomainTransaction, DomainStatus
from src.models.user import User, db
from src.services.doma_protocol import DomaProtocolClient

@dataclass
class DomainMetrics:
    """Domain performance metrics"""
    domain_id: int
    domain_name: str
    current_value: float
    value_change_24h: float
    value_change_7d: float
    value_change_30d: float
    transaction_volume_24h: float
    transaction_count_24h: int
    liquidity_score: float
    volatility_score: float
    market_cap: float
    holder_count: int
    avg_holding_period: float

@dataclass
class MarketTrend:
    """Market trend analysis"""
    trend_type: str
    strength: float
    duration_days: int
    affected_domains: List[int]
    trend_drivers: List[str]
    confidence_score: float

@dataclass
class BlockchainMetrics:
    """Blockchain activity metrics"""
    chain_name: str
    total_transactions: int
    successful_transactions: int
    failed_transactions: int
    avg_gas_price: float
    avg_confirmation_time: float
    network_congestion: float
    total_value_locked: float

class AdvancedAnalyticsEngine:
    """
    Advanced analytics engine for real-time domain performance monitoring,
    market trend analysis, and blockchain activity tracking
    """
    
    def __init__(self):
        self.doma_client = DomaProtocolClient()
        self.cache_duration = 300  # 5 minutes cache
        self.metrics_cache = {}
        
        # Market analysis parameters
        self.trend_detection_window = 30  # days
        self.volatility_window = 7       # days
        self.liquidity_factors = {
            'transaction_frequency': 0.3,
            'holder_diversity': 0.25,
            'price_stability': 0.2,
            'market_depth': 0.25
        }
    
    async def get_real_time_dashboard(self, user_id: Optional[int] = None) -> Dict:
        """
        Generate comprehensive real-time analytics dashboard
        
        Args:
            user_id: Optional user ID for personalized metrics
            
        Returns:
            Complete dashboard data
        """
        # Parallel data collection for performance
        tasks = [
            self._get_market_overview(),
            self._get_trending_domains(),
            self._get_blockchain_metrics(),
            self._get_user_portfolio_metrics(user_id) if user_id else self._get_global_portfolio_metrics(),
            self._detect_market_trends(),
            self._get_network_health_metrics()
        ]
        
        results = await asyncio.gather(*tasks)
        
        market_overview, trending_domains, blockchain_metrics, portfolio_metrics, market_trends, network_health = results
        
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'market_overview': market_overview,
            'trending_domains': trending_domains,
            'blockchain_metrics': blockchain_metrics,
            'portfolio_metrics': portfolio_metrics,
            'market_trends': market_trends,
            'network_health': network_health,
            'alerts': await self._generate_alerts(user_id),
            'recommendations': await self._generate_recommendations(user_id)
        }
    
    async def _get_market_overview(self) -> Dict:
        """Get overall market overview metrics"""
        # Get all domains
        domains = Domain.query.all()
        
        if not domains:
            return {
                'total_domains': 0,
                'total_market_cap': 0,
                'avg_domain_value': 0,
                'market_change_24h': 0,
                'active_traders': 0,
                'transaction_volume_24h': 0
            }
        
        # Calculate market metrics
        total_market_cap = sum(domain.estimated_value for domain in domains)
        avg_domain_value = total_market_cap / len(domains)
        
        # Get 24h transaction data
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_transactions = DomainTransaction.query.filter(
            DomainTransaction.created_at >= yesterday
        ).all()
        
        transaction_volume_24h = sum(
            tx.transaction_metadata.get('total_cost', 0) 
            for tx in recent_transactions 
            if tx.transaction_metadata and 'total_cost' in tx.transaction_metadata
        )
        
        active_traders = len(set(tx.user_id for tx in recent_transactions))
        
        # Calculate market change (simplified)
        market_change_24h = self._calculate_market_change_24h(domains)
        
        return {
            'total_domains': len(domains),
            'tokenized_domains': len([d for d in domains if d.status == DomainStatus.TOKENIZED]),
            'total_market_cap': round(total_market_cap, 2),
            'avg_domain_value': round(avg_domain_value, 2),
            'market_change_24h': round(market_change_24h, 2),
            'active_traders': active_traders,
            'transaction_volume_24h': round(transaction_volume_24h, 2),
            'transaction_count_24h': len(recent_transactions)
        }
    
    async def _get_trending_domains(self, limit: int = 10) -> List[Dict]:
        """Get trending domains based on activity and value changes"""
        domains = Domain.query.filter(Domain.status == DomainStatus.TOKENIZED).all()
        
        trending_scores = []
        
        for domain in domains:
            # Calculate trending score based on multiple factors
            score = await self._calculate_trending_score(domain)
            
            if score > 0:
                trending_scores.append({
                    'domain': domain.to_dict(),
                    'trending_score': score,
                    'metrics': await self._get_domain_metrics(domain.id)
                })
        
        # Sort by trending score and return top domains
        trending_scores.sort(key=lambda x: x['trending_score'], reverse=True)
        return trending_scores[:limit]
    
    async def _calculate_trending_score(self, domain: Domain) -> float:
        """Calculate trending score for a domain"""
        score = 0.0
        
        # Recent transaction activity (40% weight)
        recent_activity = self._get_recent_activity_score(domain.id)
        score += recent_activity * 0.4
        
        # Value appreciation (30% weight)
        value_change = self._get_value_change_score(domain.id)
        score += value_change * 0.3
        
        # Social signals (20% weight) - simplified
        social_score = self._get_social_signals_score(domain.name)
        score += social_score * 0.2
        
        # Liquidity (10% weight)
        liquidity_score = await self._calculate_liquidity_score(domain.id)
        score += liquidity_score * 0.1
        
        return min(100.0, max(0.0, score))
    
    async def _get_blockchain_metrics(self) -> Dict:
        """Get blockchain network metrics"""
        metrics = {}
        
        for chain_name in self.doma_client.SUPPORTED_CHAINS.keys():
            try:
                chain_metrics = await self._get_chain_metrics(chain_name)
                metrics[chain_name] = chain_metrics
            except Exception as e:
                metrics[chain_name] = {
                    'status': 'error',
                    'error': str(e)
                }
        
        return metrics
    
    async def _get_chain_metrics(self, chain_name: str) -> BlockchainMetrics:
        """Get metrics for a specific blockchain"""
        # Get recent transactions for this chain
        recent_transactions = DomainTransaction.query.filter(
            DomainTransaction.transaction_metadata.contains(f'"chain_name": "{chain_name}"'),
            DomainTransaction.created_at >= datetime.utcnow() - timedelta(days=1)
        ).all()
        
        successful_txs = [tx for tx in recent_transactions if tx.status == 'confirmed']
        failed_txs = [tx for tx in recent_transactions if tx.status == 'failed']
        
        # Calculate average gas price
        gas_prices = [
            float(tx.gas_price) for tx in successful_txs 
            if tx.gas_price and tx.gas_price.isdigit()
        ]
        avg_gas_price = statistics.mean(gas_prices) if gas_prices else 0
        
        # Calculate average confirmation time
        confirmation_times = []
        for tx in successful_txs:
            if tx.confirmed_at and tx.created_at:
                conf_time = (tx.confirmed_at - tx.created_at).total_seconds()
                confirmation_times.append(conf_time)
        
        avg_confirmation_time = statistics.mean(confirmation_times) if confirmation_times else 0
        
        # Calculate network congestion (simplified)
        network_congestion = min(1.0, len(failed_txs) / max(1, len(recent_transactions)))
        
        # Calculate total value locked (simplified)
        domains_on_chain = Domain.query.filter(
            Domain.chain_id == self.doma_client.SUPPORTED_CHAINS[chain_name]['chain_id']
        ).all()
        total_value_locked = sum(domain.estimated_value for domain in domains_on_chain)
        
        return BlockchainMetrics(
            chain_name=chain_name,
            total_transactions=len(recent_transactions),
            successful_transactions=len(successful_txs),
            failed_transactions=len(failed_txs),
            avg_gas_price=avg_gas_price,
            avg_confirmation_time=avg_confirmation_time,
            network_congestion=network_congestion,
            total_value_locked=total_value_locked
        )
    
    async def _get_user_portfolio_metrics(self, user_id: int) -> Dict:
        """Get personalized portfolio metrics for a user"""
        user_domains = Domain.query.filter_by(owner_id=user_id).all()
        
        if not user_domains:
            return {
                'total_domains': 0,
                'portfolio_value': 0,
                'portfolio_change_24h': 0,
                'best_performer': None,
                'worst_performer': None,
                'diversification_score': 0
            }
        
        # Calculate portfolio metrics
        portfolio_value = sum(domain.estimated_value for domain in user_domains)
        
        # Get performance data
        performance_data = []
        for domain in user_domains:
            metrics = await self._get_domain_metrics(domain.id)
            performance_data.append({
                'domain': domain,
                'metrics': metrics
            })
        
        # Find best and worst performers
        performance_data.sort(key=lambda x: x['metrics'].value_change_24h, reverse=True)
        best_performer = performance_data[0] if performance_data else None
        worst_performer = performance_data[-1] if performance_data else None
        
        # Calculate portfolio change
        portfolio_change_24h = statistics.mean([
            p['metrics'].value_change_24h for p in performance_data
        ]) if performance_data else 0
        
        # Calculate diversification score
        diversification_score = self._calculate_diversification_score(user_domains)
        
        return {
            'total_domains': len(user_domains),
            'portfolio_value': round(portfolio_value, 2),
            'portfolio_change_24h': round(portfolio_change_24h, 2),
            'best_performer': {
                'domain_name': best_performer['domain'].name,
                'change_24h': best_performer['metrics'].value_change_24h
            } if best_performer else None,
            'worst_performer': {
                'domain_name': worst_performer['domain'].name,
                'change_24h': worst_performer['metrics'].value_change_24h
            } if worst_performer else None,
            'diversification_score': round(diversification_score, 2),
            'domain_breakdown': [
                {
                    'domain_name': p['domain'].name,
                    'value': p['domain'].estimated_value,
                    'change_24h': p['metrics'].value_change_24h,
                    'percentage_of_portfolio': (p['domain'].estimated_value / portfolio_value) * 100
                }
                for p in performance_data
            ]
        }
    
    async def _get_global_portfolio_metrics(self) -> Dict:
        """Get global portfolio metrics"""
        all_domains = Domain.query.all()
        
        if not all_domains:
            return {'message': 'No domains found'}
        
        # Calculate global metrics
        total_value = sum(domain.estimated_value for domain in all_domains)
        avg_value = total_value / len(all_domains)
        
        # TLD distribution
        tld_distribution = defaultdict(int)
        for domain in all_domains:
            tld_distribution[domain.tld] += 1
        
        # Status distribution
        status_distribution = defaultdict(int)
        for domain in all_domains:
            status_distribution[domain.status.value] += 1
        
        return {
            'total_domains': len(all_domains),
            'total_value': round(total_value, 2),
            'average_value': round(avg_value, 2),
            'tld_distribution': dict(tld_distribution),
            'status_distribution': dict(status_distribution)
        }
    
    async def _detect_market_trends(self) -> List[MarketTrend]:
        """Detect and analyze market trends"""
        trends = []
        
        # Analyze price trends
        price_trend = await self._analyze_price_trends()
        if price_trend:
            trends.append(price_trend)
        
        # Analyze volume trends
        volume_trend = await self._analyze_volume_trends()
        if volume_trend:
            trends.append(volume_trend)
        
        # Analyze adoption trends
        adoption_trend = await self._analyze_adoption_trends()
        if adoption_trend:
            trends.append(adoption_trend)
        
        return trends
    
    async def _analyze_price_trends(self) -> Optional[MarketTrend]:
        """Analyze price trends across domains"""
        domains = Domain.query.filter(Domain.estimated_value > 0).all()
        
        if len(domains) < 10:  # Need sufficient data
            return None
        
        # Calculate price changes (simplified)
        price_changes = []
        for domain in domains:
            # Mock price change calculation
            change = (hash(domain.name) % 21 - 10) / 100  # -10% to +10%
            price_changes.append(change)
        
        avg_change = statistics.mean(price_changes)
        
        if abs(avg_change) < 0.02:  # Less than 2% change
            return None
        
        trend_type = 'bullish' if avg_change > 0 else 'bearish'
        strength = min(1.0, abs(avg_change) * 10)
        
        return MarketTrend(
            trend_type=f'price_{trend_type}',
            strength=strength,
            duration_days=7,  # Simplified
            affected_domains=[d.id for d in domains[:10]],
            trend_drivers=['market_sentiment', 'adoption_rate'],
            confidence_score=0.75
        )
    
    async def _analyze_volume_trends(self) -> Optional[MarketTrend]:
        """Analyze transaction volume trends"""
        # Get recent transaction data
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_transactions = DomainTransaction.query.filter(
            DomainTransaction.created_at >= week_ago
        ).all()
        
        if len(recent_transactions) < 5:
            return None
        
        # Group by day and calculate daily volumes
        daily_volumes = defaultdict(int)
        for tx in recent_transactions:
            day = tx.created_at.date()
            daily_volumes[day] += 1
        
        volumes = list(daily_volumes.values())
        if len(volumes) < 3:
            return None
        
        # Simple trend detection
        recent_avg = statistics.mean(volumes[-3:])
        earlier_avg = statistics.mean(volumes[:-3]) if len(volumes) > 3 else recent_avg
        
        if recent_avg > earlier_avg * 1.2:  # 20% increase
            return MarketTrend(
                trend_type='volume_surge',
                strength=min(1.0, (recent_avg / earlier_avg - 1)),
                duration_days=3,
                affected_domains=[tx.domain_id for tx in recent_transactions[-10:]],
                trend_drivers=['increased_activity', 'market_interest'],
                confidence_score=0.8
            )
        
        return None
    
    async def _analyze_adoption_trends(self) -> Optional[MarketTrend]:
        """Analyze domain adoption trends"""
        # Get tokenization rate over time
        week_ago = datetime.utcnow() - timedelta(days=7)
        recent_tokenizations = DomainTransaction.query.filter(
            DomainTransaction.transaction_type == 'tokenize',
            DomainTransaction.created_at >= week_ago
        ).all()
        
        if len(recent_tokenizations) > 5:  # Significant adoption
            return MarketTrend(
                trend_type='adoption_growth',
                strength=min(1.0, len(recent_tokenizations) / 10),
                duration_days=7,
                affected_domains=[tx.domain_id for tx in recent_tokenizations],
                trend_drivers=['doma_protocol_adoption', 'tokenization_benefits'],
                confidence_score=0.85
            )
        
        return None
    
    async def _get_network_health_metrics(self) -> Dict:
        """Get overall network health metrics"""
        # Calculate success rates
        recent_transactions = DomainTransaction.query.filter(
            DomainTransaction.created_at >= datetime.utcnow() - timedelta(hours=24)
        ).all()
        
        if not recent_transactions:
            return {
                'overall_health': 'unknown',
                'success_rate': 0,
                'avg_confirmation_time': 0,
                'network_congestion': 0
            }
        
        successful_txs = [tx for tx in recent_transactions if tx.status == 'confirmed']
        success_rate = len(successful_txs) / len(recent_transactions)
        
        # Calculate average confirmation time
        confirmation_times = []
        for tx in successful_txs:
            if tx.confirmed_at and tx.created_at:
                conf_time = (tx.confirmed_at - tx.created_at).total_seconds()
                confirmation_times.append(conf_time)
        
        avg_confirmation_time = statistics.mean(confirmation_times) if confirmation_times else 0
        
        # Determine overall health
        if success_rate >= 0.95 and avg_confirmation_time <= 300:  # 5 minutes
            health = 'excellent'
        elif success_rate >= 0.9 and avg_confirmation_time <= 600:  # 10 minutes
            health = 'good'
        elif success_rate >= 0.8:
            health = 'fair'
        else:
            health = 'poor'
        
        return {
            'overall_health': health,
            'success_rate': round(success_rate * 100, 2),
            'avg_confirmation_time': round(avg_confirmation_time, 2),
            'network_congestion': round((1 - success_rate) * 100, 2),
            'total_transactions_24h': len(recent_transactions)
        }
    
    async def _generate_alerts(self, user_id: Optional[int]) -> List[Dict]:
        """Generate relevant alerts for the user"""
        alerts = []
        
        if user_id:
            # User-specific alerts
            user_domains = Domain.query.filter_by(owner_id=user_id).all()
            
            for domain in user_domains:
                # Check for expiration alerts
                if domain.expiration_date and domain.expiration_date <= datetime.utcnow() + timedelta(days=30):
                    alerts.append({
                        'type': 'expiration_warning',
                        'severity': 'high',
                        'message': f"Domain {domain.name} expires in {(domain.expiration_date - datetime.utcnow()).days} days",
                        'domain_id': domain.id,
                        'action_required': True
                    })
                
                # Check for value changes
                metrics = await self._get_domain_metrics(domain.id)
                if metrics.value_change_24h > 20:  # 20% increase
                    alerts.append({
                        'type': 'value_surge',
                        'severity': 'medium',
                        'message': f"Domain {domain.name} value increased by {metrics.value_change_24h:.1f}% in 24h",
                        'domain_id': domain.id,
                        'action_required': False
                    })
        
        # Global alerts
        network_health = await self._get_network_health_metrics()
        if network_health['success_rate'] < 80:
            alerts.append({
                'type': 'network_issues',
                'severity': 'high',
                'message': f"Network success rate is {network_health['success_rate']:.1f}%. Transactions may be delayed.",
                'action_required': False
            })
        
        return alerts
    
    async def _generate_recommendations(self, user_id: Optional[int]) -> List[Dict]:
        """Generate personalized recommendations"""
        recommendations = []
        
        if user_id:
            user_domains = Domain.query.filter_by(owner_id=user_id).all()
            
            if not user_domains:
                recommendations.append({
                    'type': 'get_started',
                    'priority': 'high',
                    'title': 'Start Your Domain Portfolio',
                    'description': 'Register your first domain to begin building your digital asset portfolio.',
                    'action': 'register_domain'
                })
            else:
                # Portfolio diversification
                tlds = set(domain.tld for domain in user_domains)
                if len(tlds) == 1:
                    recommendations.append({
                        'type': 'diversification',
                        'priority': 'medium',
                        'title': 'Diversify Your Portfolio',
                        'description': 'Consider domains with different TLDs to reduce risk.',
                        'action': 'explore_tlds'
                    })
                
                # Tokenization recommendations
                untokenized = [d for d in user_domains if d.status == DomainStatus.REGISTERED]
                if untokenized:
                    recommendations.append({
                        'type': 'tokenization',
                        'priority': 'high',
                        'title': 'Tokenize Your Domains',
                        'description': f'You have {len(untokenized)} domains that could be tokenized for trading.',
                        'action': 'tokenize_domains'
                    })
        
        return recommendations
    
    # Helper methods
    
    async def _get_domain_metrics(self, domain_id: int) -> DomainMetrics:
        """Get comprehensive metrics for a domain"""
        domain = Domain.query.get(domain_id)
        if not domain:
            raise ValueError("Domain not found")
        
        # Calculate various metrics (simplified implementations)
        return DomainMetrics(
            domain_id=domain_id,
            domain_name=domain.name,
            current_value=domain.estimated_value,
            value_change_24h=self._calculate_value_change(domain_id, 1),
            value_change_7d=self._calculate_value_change(domain_id, 7),
            value_change_30d=self._calculate_value_change(domain_id, 30),
            transaction_volume_24h=self._get_transaction_volume(domain_id, 1),
            transaction_count_24h=self._get_transaction_count(domain_id, 1),
            liquidity_score=await self._calculate_liquidity_score(domain_id),
            volatility_score=self._calculate_volatility_score(domain_id),
            market_cap=domain.estimated_value,  # Simplified
            holder_count=1,  # Simplified
            avg_holding_period=30.0  # Simplified
        )
    
    def _calculate_market_change_24h(self, domains: List[Domain]) -> float:
        """Calculate overall market change in 24h"""
        # Simplified calculation
        changes = []
        for domain in domains:
            change = (hash(domain.name) % 21 - 10) / 10  # -1% to +1%
            changes.append(change)
        
        return statistics.mean(changes) if changes else 0
    
    def _get_recent_activity_score(self, domain_id: int) -> float:
        """Get recent activity score for a domain"""
        yesterday = datetime.utcnow() - timedelta(days=1)
        recent_txs = DomainTransaction.query.filter(
            DomainTransaction.domain_id == domain_id,
            DomainTransaction.created_at >= yesterday
        ).count()
        
        return min(100.0, recent_txs * 20)  # Max 100, 20 points per transaction
    
    def _get_value_change_score(self, domain_id: int) -> float:
        """Get value change score for a domain"""
        # Simplified - would calculate actual value changes
        return (hash(f"value_{domain_id}") % 21 - 10) * 5  # -50 to +50
    
    def _get_social_signals_score(self, domain_name: str) -> float:
        """Get social signals score for a domain"""
        # Simplified - would integrate with social media APIs
        return (hash(f"social_{domain_name}") % 51)  # 0 to 50
    
    async def _calculate_liquidity_score(self, domain_id: int) -> float:
        """Calculate liquidity score for a domain"""
        # Simplified liquidity calculation
        recent_txs = self._get_transaction_count(domain_id, 7)
        base_score = min(1.0, recent_txs / 10)  # Normalize to 0-1
        
        return base_score
    
    def _calculate_diversification_score(self, domains: List[Domain]) -> float:
        """Calculate portfolio diversification score"""
        if not domains:
            return 0
        
        # TLD diversity
        tlds = set(domain.tld for domain in domains)
        tld_score = min(1.0, len(tlds) / 5)  # Max score with 5+ different TLDs
        
        # Value distribution
        values = [domain.estimated_value for domain in domains]
        total_value = sum(values)
        
        if total_value == 0:
            return tld_score * 50
        
        # Calculate Herfindahl index for concentration
        shares = [value / total_value for value in values]
        hhi = sum(share ** 2 for share in shares)
        concentration_score = 1 - hhi  # Lower concentration = higher score
        
        return (tld_score * 0.4 + concentration_score * 0.6) * 100
    
    def _calculate_value_change(self, domain_id: int, days: int) -> float:
        """Calculate value change over specified days"""
        # Simplified - would track actual value history
        return (hash(f"change_{domain_id}_{days}") % 21 - 10) / 10  # -1% to +1%
    
    def _get_transaction_volume(self, domain_id: int, days: int) -> float:
        """Get transaction volume for domain over specified days"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        transactions = DomainTransaction.query.filter(
            DomainTransaction.domain_id == domain_id,
            DomainTransaction.created_at >= cutoff
        ).all()
        
        volume = sum(
            tx.transaction_metadata.get('total_cost', 0)
            for tx in transactions
            if tx.transaction_metadata and 'total_cost' in tx.transaction_metadata
        )
        
        return volume
    
    def _get_transaction_count(self, domain_id: int, days: int) -> int:
        """Get transaction count for domain over specified days"""
        cutoff = datetime.utcnow() - timedelta(days=days)
        return DomainTransaction.query.filter(
            DomainTransaction.domain_id == domain_id,
            DomainTransaction.created_at >= cutoff
        ).count()
    
    def _calculate_volatility_score(self, domain_id: int) -> float:
        """Calculate volatility score for a domain"""
        # Simplified volatility calculation
        changes = [
            self._calculate_value_change(domain_id, i)
            for i in range(1, 8)  # Last 7 days
        ]
        
        if not changes:
            return 0
        
        volatility = statistics.stdev(changes) if len(changes) > 1 else 0
        return min(100.0, volatility * 100)  # Normalize to 0-100

