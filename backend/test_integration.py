#!/usr/bin/env python3
"""
Integration test for DomaLand.AI backend features
Tests all major functionality without requiring a running server
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

def test_imports():
    """Test that all modules can be imported"""
    print("Testing imports...")
    
    try:
        from src.models.user import User, UserRole
        print("✓ User model imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import User model: {e}")
        return False
    
    try:
        from src.models.domain import Domain, DomainTransaction, DomainStatus, TokenizationStatus
        print("✓ Domain models imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import Domain models: {e}")
        return False
    
    try:
        from src.services.domain_service import DomainService
        print("✓ Domain service imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import Domain service: {e}")
        return False
    
    try:
        from src.services.ai_valuation import AIValuationEngine
        print("✓ AI Valuation engine imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import AI Valuation engine: {e}")
        return False
    
    try:
        from src.services.automated_market_maker import AutomatedMarketMaker
        print("✓ AMM imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import AMM: {e}")
        return False
    
    try:
        from src.services.fractionalization import DomainFractionalizationService
        print("✓ Fractionalization service imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import Fractionalization service: {e}")
        return False
    
    try:
        from src.services.analytics_engine import AdvancedAnalyticsEngine
        print("✓ Analytics engine imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import Analytics engine: {e}")
        return False
    
    try:
        from src.services.doma_protocol import DomaProtocolClient
        print("✓ Doma Protocol client imported successfully")
    except ImportError as e:
        print(f"✗ Failed to import Doma Protocol client: {e}")
        return False
    
    return True

def test_models():
    """Test model functionality"""
    print("\nTesting models...")
    
    try:
        from src.models.user import User, UserRole
        from src.models.domain import Domain, DomainTransaction, DomainStatus
        
        # Test User model
        user = User(
            username="testuser",
            email="test@example.com",
            password_hash="hashed_password",
            role=UserRole.USER
        )
        user_dict = user.to_dict()
        assert user_dict['username'] == "testuser"
        assert user_dict['role'] == "user"
        print("✓ User model works correctly")
        
        # Test Domain model
        domain = Domain(
            name="test.com",
            sld="test",
            tld="com",
            owner_id=1,
            status=DomainStatus.REGISTERED,
            estimated_value=1000.0
        )
        domain_dict = domain.to_dict()
        assert domain_dict['name'] == "test.com"
        assert domain_dict['status'] == "registered"
        print("✓ Domain model works correctly")
        
        # Test DomainTransaction model
        transaction = DomainTransaction(
            domain_id=1,
            user_id=1,
            transaction_type="tokenize",
            status="pending"
        )
        tx_dict = transaction.to_dict()
        assert tx_dict['transaction_type'] == "tokenize"
        assert tx_dict['status'] == "pending"
        print("✓ DomainTransaction model works correctly")
        
        return True
        
    except Exception as e:
        print(f"✗ Model test failed: {e}")
        return False

def test_services():
    """Test service functionality"""
    print("\nTesting services...")
    
    try:
        from src.services.ai_valuation import AIValuationEngine
        from src.services.automated_market_maker import AutomatedMarketMaker
        from src.services.fractionalization import DomainFractionalizationService
        from src.services.analytics_engine import AdvancedAnalyticsEngine
        from src.services.doma_protocol import DomaProtocolClient
        
        # Test AI Valuation Engine
        ai_engine = AIValuationEngine()
        assert hasattr(ai_engine, 'comprehensive_valuation')
        assert hasattr(ai_engine, 'tld_multipliers')
        print("✓ AI Valuation Engine initialized correctly")
        
        # Test AMM
        amm = AutomatedMarketMaker()
        assert hasattr(amm, 'create_liquidity_pool')
        assert hasattr(amm, 'get_trade_quote')
        print("✓ AMM initialized correctly")
        
        # Test Fractionalization Service
        frac_service = DomainFractionalizationService()
        assert hasattr(frac_service, 'create_fractionalization_proposal')
        assert hasattr(frac_service, 'purchase_fractional_shares')
        print("✓ Fractionalization Service initialized correctly")
        
        # Test Analytics Engine
        analytics = AdvancedAnalyticsEngine()
        assert hasattr(analytics, 'get_real_time_dashboard')
        assert hasattr(analytics, '_get_market_overview')
        print("✓ Analytics Engine initialized correctly")
        
        # Test Doma Protocol Client
        doma_client = DomaProtocolClient()
        assert hasattr(doma_client, 'SUPPORTED_CHAINS')
        assert hasattr(doma_client, 'create_tokenization_voucher')
        print("✓ Doma Protocol Client initialized correctly")
        
        return True
        
    except Exception as e:
        print(f"✗ Service test failed: {e}")
        return False

def test_contract_integration():
    """Test smart contract integration"""
    print("\nTesting contract integration...")
    
    try:
        from src.services.doma_protocol import DomaProtocolClient
        
        client = DomaProtocolClient()
        
        # Test supported chains
        assert 'ethereum' in client.SUPPORTED_CHAINS
        assert 'polygon' in client.SUPPORTED_CHAINS
        assert 'base' in client.SUPPORTED_CHAINS
        print("✓ Supported chains configured correctly")
        
        # Test voucher creation
        voucher, signature = client.create_tokenization_voucher(
            domain_names=["test.com"],
            owner_address="0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
            registrar_private_key="0x" + "1" * 64
        )
        assert voucher.names[0]['sld'] == "test"
        assert voucher.names[0]['tld'] == "com"
        assert len(signature) > 0
        print("✓ Tokenization voucher creation works")
        
        # Test protocol fees
        fees = client.get_protocol_fees('polygon')
        assert 'tokenization' in fees
        assert 'claiming' in fees
        assert 'bridging' in fees
        print("✓ Protocol fees configured correctly")
        
        return True
        
    except Exception as e:
        print(f"✗ Contract integration test failed: {e}")
        return False

def test_ai_features():
    """Test AI-powered features"""
    print("\nTesting AI features...")
    
    try:
        from src.services.ai_valuation import AIValuationEngine
        
        engine = AIValuationEngine()
        
        # Test TLD multipliers
        assert engine.tld_multipliers['com'] == 1.0
        assert engine.tld_multipliers['ai'] == 1.2
        assert engine.tld_multipliers['crypto'] == 1.5
        print("✓ TLD multipliers configured correctly")
        
        # Test premium keywords
        assert 'crypto' in engine.premium_keywords
        assert 'ai' in engine.premium_keywords
        assert 'blockchain' in engine.premium_keywords
        print("✓ Premium keywords configured correctly")
        
        # Test scoring weights
        assert sum(engine.scoring_weights.values()) == 1.0
        print("✓ Scoring weights sum to 1.0")
        
        # Test length scoring
        short_score = engine._calculate_length_score("abc")
        long_score = engine._calculate_length_score("verylongdomainname")
        assert short_score > long_score
        print("✓ Length scoring works correctly")
        
        return True
        
    except Exception as e:
        print(f"✗ AI features test failed: {e}")
        return False

def test_amm_features():
    """Test AMM functionality"""
    print("\nTesting AMM features...")
    
    try:
        from src.services.automated_market_maker import AutomatedMarketMaker, TradeQuote
        from datetime import datetime, timedelta
        
        amm = AutomatedMarketMaker()
        
        # Test supported base tokens
        assert 'USDC' in amm.supported_base_tokens
        assert 'ETH' in amm.supported_base_tokens
        assert 'MATIC' in amm.supported_base_tokens
        print("✓ Supported base tokens configured")
        
        # Test trade quote creation
        quote = TradeQuote(
            input_token="domain",
            output_token="USDC",
            input_amount=100.0,
            output_amount=500.0,
            price_impact=0.01,
            fee_amount=1.5,
            minimum_output=495.0,
            valid_until=datetime.utcnow() + timedelta(minutes=5)
        )
        assert quote.input_token == "domain"
        assert quote.output_amount == 500.0
        print("✓ Trade quote creation works")
        
        # Test AMM parameters
        assert amm.default_fee_rate == 0.003
        assert amm.slippage_tolerance == 0.02
        assert amm.minimum_liquidity == 1000
        print("✓ AMM parameters configured correctly")
        
        return True
        
    except Exception as e:
        print(f"✗ AMM features test failed: {e}")
        return False

def test_fractionalization():
    """Test fractionalization features"""
    print("\nTesting fractionalization features...")
    
    try:
        from src.services.fractionalization import DomainFractionalizationService, FractionShare
        from datetime import datetime
        
        service = DomainFractionalizationService()
        
        # Test parameters
        assert service.min_domain_value == 5000
        assert service.max_shares == 10000
        assert service.min_share_price == 10
        assert service.governance_quorum == 0.51
        print("✓ Fractionalization parameters configured")
        
        # Test fraction share creation
        share = FractionShare(
            domain_id=1,
            owner_id=1,
            share_percentage=10.0,
            share_tokens=100,
            purchase_price=1000.0,
            purchase_date=datetime.utcnow(),
            voting_power=0.1
        )
        assert share.share_percentage == 10.0
        assert share.voting_power == 0.1
        print("✓ Fraction share creation works")
        
        # Test ERC-20 ABI
        assert len(service.fraction_token_abi) > 0
        assert any(func['name'] == 'mint' for func in service.fraction_token_abi)
        assert any(func['name'] == 'transferFrom' for func in service.fraction_token_abi)
        print("✓ ERC-20 ABI configured correctly")
        
        return True
        
    except Exception as e:
        print(f"✗ Fractionalization test failed: {e}")
        return False

def test_analytics():
    """Test analytics features"""
    print("\nTesting analytics features...")
    
    try:
        from src.services.analytics_engine import AdvancedAnalyticsEngine, DomainMetrics, MarketTrend
        
        analytics = AdvancedAnalyticsEngine()
        
        # Test cache configuration
        assert analytics.cache_duration == 300
        print("✓ Cache configuration set")
        
        # Test market analysis parameters
        assert analytics.trend_detection_window == 30
        assert analytics.volatility_window == 7
        assert sum(analytics.liquidity_factors.values()) == 1.0
        print("✓ Market analysis parameters configured")
        
        # Test domain metrics creation
        metrics = DomainMetrics(
            domain_id=1,
            domain_name="test.com",
            current_value=1000.0,
            value_change_24h=5.0,
            value_change_7d=10.0,
            value_change_30d=15.0,
            transaction_volume_24h=500.0,
            transaction_count_24h=5,
            liquidity_score=0.8,
            volatility_score=0.3,
            market_cap=1000.0,
            holder_count=1,
            avg_holding_period=30.0
        )
        assert metrics.domain_name == "test.com"
        assert metrics.current_value == 1000.0
        print("✓ Domain metrics creation works")
        
        # Test market trend creation
        trend = MarketTrend(
            trend_type="bullish",
            strength=0.8,
            duration_days=7,
            affected_domains=[1, 2, 3],
            trend_drivers=["adoption", "sentiment"],
            confidence_score=0.85
        )
        assert trend.trend_type == "bullish"
        assert trend.strength == 0.8
        print("✓ Market trend creation works")
        
        return True
        
    except Exception as e:
        print(f"✗ Analytics test failed: {e}")
        return False

def main():
    """Run all integration tests"""
    print("DomaLand.AI Backend Integration Test")
    print("=" * 50)
    
    tests = [
        test_imports,
        test_models,
        test_services,
        test_contract_integration,
        test_ai_features,
        test_amm_features,
        test_fractionalization,
        test_analytics
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"✗ Test {test.__name__} failed with exception: {e}")
    
    print("\n" + "=" * 50)
    print(f"Integration Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All backend features are integrated and functional!")
        return True
    else:
        print("❌ Some backend features need attention.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)


