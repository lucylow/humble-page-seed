from flask import Blueprint, request, jsonify
from datetime import datetime
import asyncio
from src.services.ai_valuation import AIValuationEngine
from src.services.fractionalization import DomainFractionalizationService
from src.services.analytics_engine import AdvancedAnalyticsEngine
from src.services.automated_market_maker import AutomatedMarketMaker
from src.models.domain import Domain, DomainTransaction
from src.models.user import User

# Create blueprint for advanced features
advanced_bp = Blueprint('advanced', __name__)

# Initialize services
ai_valuation = AIValuationEngine()
fractionalization = DomainFractionalizationService()
analytics = AdvancedAnalyticsEngine()
amm = AutomatedMarketMaker()

@advanced_bp.route('/domains/<int:domain_id>/ai-valuation', methods=['POST'])
def get_ai_valuation(domain_id):
    """Get AI-powered domain valuation"""
    try:
        domain = Domain.query.get(domain_id)
        if not domain:
            return jsonify({'success': False, 'error': 'Domain not found'}), 404
        
        additional_data = request.json or {}
        
        # Run async valuation
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            valuation = loop.run_until_complete(
                ai_valuation.comprehensive_valuation(domain.name, additional_data)
            )
        finally:
            loop.close()
        
        # Update domain with new valuation
        domain.estimated_value = valuation['estimated_value']
        domain.last_valuation_date = datetime.utcnow()
        domain.valuation_confidence = valuation['confidence_score']
        
        from src.models.user import db
        db.session.commit()
        
        return jsonify({
            'success': True,
            'valuation': valuation
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/domains/<int:domain_id>/fractionalize/propose', methods=['POST'])
def propose_fractionalization(domain_id):
    """Propose domain fractionalization"""
    try:
        data = request.json
        proposer_id = data.get('proposer_id')
        
        if not proposer_id:
            return jsonify({'success': False, 'error': 'Proposer ID required'}), 400
        
        result = fractionalization.create_fractionalization_proposal(
            domain_id, proposer_id, data
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/domains/<int:domain_id>/fractionalize/execute', methods=['POST'])
def execute_fractionalization(domain_id):
    """Execute domain fractionalization"""
    try:
        data = request.json
        chain_name = data.get('chain_name', 'polygon')
        
        result = fractionalization.execute_fractionalization(
            domain_id, chain_name, data
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/domains/<int:domain_id>/shares/purchase', methods=['POST'])
def purchase_shares(domain_id):
    """Purchase fractional shares of a domain"""
    try:
        data = request.json
        buyer_id = data.get('buyer_id')
        share_amount = data.get('share_amount')
        payment_details = data.get('payment_details', {})
        
        if not all([buyer_id, share_amount]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        result = fractionalization.purchase_fractional_shares(
            domain_id, buyer_id, share_amount, payment_details
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/domains/<int:domain_id>/governance/propose', methods=['POST'])
def create_governance_proposal(domain_id):
    """Create a governance proposal for a fractionalized domain"""
    try:
        data = request.json
        proposer_id = data.get('proposer_id')
        
        if not proposer_id:
            return jsonify({'success': False, 'error': 'Proposer ID required'}), 400
        
        result = fractionalization.create_governance_proposal(
            domain_id, proposer_id, data
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/governance/<proposal_id>/vote', methods=['POST'])
def vote_on_proposal(proposal_id):
    """Vote on a governance proposal"""
    try:
        data = request.json
        voter_id = data.get('voter_id')
        vote = data.get('vote')
        
        if not all([voter_id, vote]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        result = fractionalization.vote_on_proposal(proposal_id, voter_id, vote)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/domains/<int:domain_id>/shareholders', methods=['GET'])
def get_shareholders(domain_id):
    """Get all shareholders of a fractionalized domain"""
    try:
        shareholders = fractionalization.get_domain_shareholders(domain_id)
        
        return jsonify({
            'success': True,
            'domain_id': domain_id,
            'shareholders': shareholders,
            'total_shareholders': len(shareholders)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/analytics/dashboard', methods=['GET'])
def get_analytics_dashboard():
    """Get comprehensive analytics dashboard"""
    try:
        user_id = request.args.get('user_id', type=int)
        
        # Run async analytics
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            dashboard = loop.run_until_complete(
                analytics.get_real_time_dashboard(user_id)
            )
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'dashboard': dashboard
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/analytics/domains/<int:domain_id>/metrics', methods=['GET'])
def get_domain_metrics(domain_id):
    """Get detailed metrics for a specific domain"""
    try:
        # Run async metrics calculation
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            metrics = loop.run_until_complete(
                analytics._get_domain_metrics(domain_id)
            )
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'domain_id': domain_id,
            'metrics': {
                'domain_name': metrics.domain_name,
                'current_value': metrics.current_value,
                'value_change_24h': metrics.value_change_24h,
                'value_change_7d': metrics.value_change_7d,
                'value_change_30d': metrics.value_change_30d,
                'transaction_volume_24h': metrics.transaction_volume_24h,
                'transaction_count_24h': metrics.transaction_count_24h,
                'liquidity_score': metrics.liquidity_score,
                'volatility_score': metrics.volatility_score,
                'market_cap': metrics.market_cap,
                'holder_count': metrics.holder_count,
                'avg_holding_period': metrics.avg_holding_period
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/amm/pools', methods=['POST'])
def create_liquidity_pool():
    """Create a new liquidity pool"""
    try:
        data = request.json
        domain_id = data.get('domain_id')
        base_token = data.get('base_token')
        initial_domain_amount = data.get('initial_domain_amount')
        initial_base_amount = data.get('initial_base_amount')
        creator_id = data.get('creator_id')
        
        if not all([domain_id, base_token, initial_domain_amount, initial_base_amount, creator_id]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        result = amm.create_liquidity_pool(
            domain_id, base_token, initial_domain_amount, initial_base_amount, creator_id
        )
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/amm/pools/<pool_id>/add-liquidity', methods=['POST'])
def add_liquidity(pool_id):
    """Add liquidity to an existing pool"""
    try:
        data = request.json
        user_id = data.get('user_id')
        domain_amount = data.get('domain_amount')
        base_amount = data.get('base_amount')
        
        if not all([user_id, domain_amount, base_amount]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        result = amm.add_liquidity(pool_id, user_id, domain_amount, base_amount)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/amm/pools/<pool_id>/remove-liquidity', methods=['POST'])
def remove_liquidity(pool_id):
    """Remove liquidity from a pool"""
    try:
        data = request.json
        user_id = data.get('user_id')
        liquidity_tokens = data.get('liquidity_tokens')
        
        if not all([user_id, liquidity_tokens]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        result = amm.remove_liquidity(pool_id, user_id, liquidity_tokens)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/amm/pools/<pool_id>/quote', methods=['POST'])
def get_trade_quote(pool_id):
    """Get a trade quote for token swap"""
    try:
        data = request.json
        input_token = data.get('input_token')
        input_amount = data.get('input_amount')
        slippage_tolerance = data.get('slippage_tolerance')
        
        if not all([input_token, input_amount]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        quote = amm.get_trade_quote(pool_id, input_token, input_amount, slippage_tolerance)
        
        return jsonify({
            'success': True,
            'quote': {
                'input_token': quote.input_token,
                'output_token': quote.output_token,
                'input_amount': quote.input_amount,
                'output_amount': quote.output_amount,
                'price_impact': quote.price_impact,
                'fee_amount': quote.fee_amount,
                'minimum_output': quote.minimum_output,
                'valid_until': quote.valid_until.isoformat()
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/amm/pools/<pool_id>/swap', methods=['POST'])
def execute_swap():
    """Execute a token swap"""
    try:
        data = request.json
        pool_id = data.get('pool_id')
        trader_id = data.get('trader_id')
        quote_data = data.get('quote')
        
        if not all([pool_id, trader_id, quote_data]):
            return jsonify({'success': False, 'error': 'Missing required fields'}), 400
        
        # Reconstruct quote object
        from src.services.automated_market_maker import TradeQuote
        quote = TradeQuote(
            input_token=quote_data['input_token'],
            output_token=quote_data['output_token'],
            input_amount=quote_data['input_amount'],
            output_amount=quote_data['output_amount'],
            price_impact=quote_data['price_impact'],
            fee_amount=quote_data['fee_amount'],
            minimum_output=quote_data['minimum_output'],
            valid_until=datetime.fromisoformat(quote_data['valid_until'])
        )
        
        result = amm.execute_trade(pool_id, quote, trader_id)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/amm/pools/<pool_id>/analytics', methods=['GET'])
def get_pool_analytics(pool_id):
    """Get comprehensive analytics for a liquidity pool"""
    try:
        analytics_data = amm.get_pool_analytics(pool_id)
        
        return jsonify({
            'success': True,
            'analytics': analytics_data
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/amm/users/<int:user_id>/positions', methods=['GET'])
def get_user_liquidity_positions(user_id):
    """Get all liquidity positions for a user"""
    try:
        positions = amm.get_user_positions(user_id)
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'positions': positions,
            'total_positions': len(positions)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/domains/<int:domain_id>/revenue/distribute', methods=['POST'])
def distribute_revenue(domain_id):
    """Distribute revenue among domain shareholders"""
    try:
        data = request.json
        total_revenue = data.get('total_revenue')
        
        if not total_revenue:
            return jsonify({'success': False, 'error': 'Total revenue required'}), 400
        
        distribution = fractionalization.calculate_revenue_distribution(domain_id, total_revenue)
        
        return jsonify({
            'success': True,
            'distribution': distribution
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/analytics/trending', methods=['GET'])
def get_trending_domains():
    """Get trending domains based on activity and performance"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        # Run async trending analysis
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            trending = loop.run_until_complete(
                analytics._get_trending_domains(limit)
            )
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'trending_domains': trending,
            'count': len(trending)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/analytics/market-trends', methods=['GET'])
def get_market_trends():
    """Get current market trends analysis"""
    try:
        # Run async trend detection
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            trends = loop.run_until_complete(
                analytics._detect_market_trends()
            )
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'market_trends': [
                {
                    'trend_type': trend.trend_type,
                    'strength': trend.strength,
                    'duration_days': trend.duration_days,
                    'affected_domains': trend.affected_domains,
                    'trend_drivers': trend.trend_drivers,
                    'confidence_score': trend.confidence_score
                }
                for trend in trends
            ],
            'trends_count': len(trends)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/analytics/network-health', methods=['GET'])
def get_network_health():
    """Get network health metrics"""
    try:
        # Run async network health check
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            health = loop.run_until_complete(
                analytics._get_network_health_metrics()
            )
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'network_health': health
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/users/<int:user_id>/portfolio/analysis', methods=['GET'])
def get_portfolio_analysis(user_id):
    """Get comprehensive portfolio analysis for a user"""
    try:
        # Run async portfolio analysis
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            portfolio = loop.run_until_complete(
                analytics._get_user_portfolio_metrics(user_id)
            )
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'portfolio_analysis': portfolio
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/domains/batch-valuation', methods=['POST'])
def batch_domain_valuation():
    """Perform AI valuation on multiple domains"""
    try:
        data = request.json
        domain_names = data.get('domain_names', [])
        
        if not domain_names:
            return jsonify({'success': False, 'error': 'Domain names required'}), 400
        
        results = []
        
        # Run async batch valuation
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            for domain_name in domain_names:
                try:
                    valuation = loop.run_until_complete(
                        ai_valuation.comprehensive_valuation(domain_name)
                    )
                    results.append({
                        'domain_name': domain_name,
                        'valuation': valuation,
                        'status': 'success'
                    })
                except Exception as e:
                    results.append({
                        'domain_name': domain_name,
                        'error': str(e),
                        'status': 'error'
                    })
        finally:
            loop.close()
        
        return jsonify({
            'success': True,
            'batch_results': results,
            'total_processed': len(results),
            'successful': len([r for r in results if r['status'] == 'success']),
            'failed': len([r for r in results if r['status'] == 'error'])
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/amm/pools', methods=['GET'])
def list_liquidity_pools():
    """List all available liquidity pools"""
    try:
        # In production, would query pools from database
        pools = [
            {
                'pool_id': 'POOL_1_USDC_1234567890',
                'domain_name': 'example.com',
                'base_token': 'USDC',
                'tvl': 10000.0,
                'apy': 15.5,
                'volume_24h': 2500.0,
                'created_at': datetime.utcnow().isoformat()
            }
        ]
        
        return jsonify({
            'success': True,
            'pools': pools,
            'total_pools': len(pools)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@advanced_bp.route('/health/advanced', methods=['GET'])
def advanced_health_check():
    """Advanced health check for all services"""
    try:
        health_status = {
            'ai_valuation': 'operational',
            'fractionalization': 'operational',
            'analytics_engine': 'operational',
            'automated_market_maker': 'operational',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Test each service
        try:
            # Test AI valuation
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                test_valuation = loop.run_until_complete(
                    ai_valuation.comprehensive_valuation('test.com')
                )
            finally:
                loop.close()
        except Exception:
            health_status['ai_valuation'] = 'degraded'
        
        try:
            # Test analytics
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            try:
                test_dashboard = loop.run_until_complete(
                    analytics.get_real_time_dashboard()
                )
            finally:
                loop.close()
        except Exception:
            health_status['analytics_engine'] = 'degraded'
        
        # Determine overall status
        statuses = list(health_status.values())[:-1]  # Exclude timestamp
        if all(status == 'operational' for status in statuses):
            overall_status = 'healthy'
        elif any(status == 'operational' for status in statuses):
            overall_status = 'degraded'
        else:
            overall_status = 'unhealthy'
        
        health_status['overall_status'] = overall_status
        
        return jsonify({
            'success': True,
            'health': health_status
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'overall_status': 'unhealthy'
        }), 500

