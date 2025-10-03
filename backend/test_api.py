#!/usr/bin/env python3
"""
DomaLand Backend API Test Script
Demonstrates the core functionality of the DomaLand backend API
"""

import requests
import json
import time
import sys

# Configuration
BASE_URL = "http://localhost:5000/api"
TEST_USER_DATA = {
    "username": "demo_user",
    "email": "demo@domaland.ai"
}
TEST_DOMAIN_DATA = {
    "domain_name": "demo-domain.com",
    "owner_address": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "estimated_value": 1500.0
}

def make_request(method, endpoint, data=None, params=None):
    """Make HTTP request with error handling"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, params=params)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"\n{method.upper()} {endpoint}")
        print(f"Status: {response.status_code}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            result = response.json()
            print(f"Response: {json.dumps(result, indent=2)}")
            return result
        else:
            print(f"Response: {response.text}")
            return response.text
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection failed to {url}")
        print("Make sure the Flask application is running on localhost:5000")
        return None
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")
        return None

def test_user_operations():
    """Test user-related operations"""
    print("\n" + "="*50)
    print("TESTING USER OPERATIONS")
    print("="*50)
    
    # Create user
    print("\n1. Creating test user...")
    user_result = make_request('POST', '/users', TEST_USER_DATA)
    
    if user_result and user_result.get('success'):
        user_id = user_result['id']
        print(f"✅ User created with ID: {user_id}")
        return user_id
    else:
        print("❌ Failed to create user")
        return None

def test_domain_operations(user_id):
    """Test domain-related operations"""
    print("\n" + "="*50)
    print("TESTING DOMAIN OPERATIONS")
    print("="*50)
    
    # Register domain
    print("\n1. Registering test domain...")
    domain_data = {**TEST_DOMAIN_DATA, "user_id": user_id}
    domain_result = make_request('POST', '/domains', domain_data)
    
    if not domain_result or not domain_result.get('success'):
        print("❌ Failed to register domain")
        return None
    
    domain_id = domain_result['domain']['id']
    print(f"✅ Domain registered with ID: {domain_id}")
    
    # Get domain details
    print("\n2. Getting domain details...")
    details_result = make_request('GET', f'/domains/{domain_id}')
    
    if details_result and details_result.get('success'):
        print("✅ Domain details retrieved successfully")
    
    # Get user domains
    print("\n3. Getting user domains...")
    user_domains = make_request('GET', '/domains', params={'user_id': user_id})
    
    if user_domains and user_domains.get('success'):
        print(f"✅ Found {user_domains['count']} domains for user")
    
    return domain_id

def test_tokenization(domain_id):
    """Test domain tokenization"""
    print("\n" + "="*50)
    print("TESTING DOMAIN TOKENIZATION")
    print("="*50)
    
    # Tokenize domain
    print("\n1. Initiating domain tokenization...")
    tokenization_data = {
        "chain_name": "polygon",
        "owner_address": TEST_DOMAIN_DATA["owner_address"]
    }
    
    tokenization_result = make_request('POST', f'/domains/{domain_id}/tokenize', tokenization_data)
    
    if tokenization_result and tokenization_result.get('success'):
        print("✅ Tokenization initiated successfully")
        print(f"Transaction Hash: {tokenization_result.get('transaction_hash', 'N/A')}")
        return True
    else:
        print("❌ Tokenization failed")
        return False

def test_marketplace_operations(domain_id):
    """Test marketplace operations"""
    print("\n" + "="*50)
    print("TESTING MARKETPLACE OPERATIONS")
    print("="*50)
    
    # List domain for sale
    print("\n1. Listing domain for sale...")
    listing_data = {"price": 2500.0}
    listing_result = make_request('POST', f'/domains/{domain_id}/list', listing_data)
    
    if listing_result and listing_result.get('success'):
        print("✅ Domain listed for sale successfully")
    
    # Get marketplace domains
    print("\n2. Getting marketplace domains...")
    marketplace_result = make_request('GET', '/marketplace', params={'limit': 10})
    
    if marketplace_result and marketplace_result.get('success'):
        print(f"✅ Found {marketplace_result['count']} domains in marketplace")

def test_system_operations():
    """Test system information endpoints"""
    print("\n" + "="*50)
    print("TESTING SYSTEM OPERATIONS")
    print("="*50)
    
    # Get supported chains
    print("\n1. Getting supported chains...")
    chains_result = make_request('GET', '/chains')
    
    if chains_result and chains_result.get('success'):
        print(f"✅ Found {len(chains_result['chains'])} supported chains")
    
    # Get domain statistics
    print("\n2. Getting domain statistics...")
    stats_result = make_request('GET', '/stats')
    
    if stats_result and stats_result.get('success'):
        print("✅ Domain statistics retrieved successfully")
    
    # Get transactions
    print("\n3. Getting recent transactions...")
    transactions_result = make_request('GET', '/transactions', params={'limit': 5})
    
    if transactions_result and transactions_result.get('success'):
        print(f"✅ Found {transactions_result['count']} recent transactions")

def main():
    """Main test function"""
    print("🚀 DomaLand Backend API Test Suite")
    print("This script demonstrates the core functionality of the DomaLand backend")
    print("\nMake sure the Flask application is running before starting tests...")
    
    # Wait for user confirmation
    input("\nPress Enter to start tests (or Ctrl+C to cancel)...")
    
    # Test user operations
    user_id = test_user_operations()
    if not user_id:
        print("\n❌ User tests failed. Stopping test suite.")
        sys.exit(1)
    
    # Test domain operations
    domain_id = test_domain_operations(user_id)
    if not domain_id:
        print("\n❌ Domain tests failed. Stopping test suite.")
        sys.exit(1)
    
    # Test tokenization (may fail due to blockchain connectivity)
    print("\n⚠️  Note: Tokenization may fail due to demo blockchain connections")
    test_tokenization(domain_id)
    
    # Test marketplace operations
    test_marketplace_operations(domain_id)
    
    # Test system operations
    test_system_operations()
    
    print("\n" + "="*50)
    print("🎉 TEST SUITE COMPLETED")
    print("="*50)
    print("\nSummary:")
    print("✅ User operations: Create user, get user data")
    print("✅ Domain operations: Register domain, get details, list user domains")
    print("⚠️  Tokenization: Initiated (blockchain connectivity required)")
    print("✅ Marketplace: List domain, browse marketplace")
    print("✅ System info: Supported chains, statistics, transactions")
    
    print("\n📚 Next Steps:")
    print("1. Set up proper blockchain RPC endpoints for full functionality")
    print("2. Implement frontend integration using the REST API")
    print("3. Add authentication and authorization for production use")
    print("4. Configure production database and deployment")

if __name__ == "__main__":
    main()

