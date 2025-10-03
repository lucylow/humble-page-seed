from flask import Blueprint, request, jsonify
from src.models.domain import Domain, DomainTransaction, DomainStatus, TokenizationStatus, db
from src.models.user import User
from src.services.domain_service import DomainService
from datetime import datetime, timedelta
import re

domain_bp = Blueprint('domain', __name__)
domain_service = DomainService()

@domain_bp.route('/domains', methods=['POST'])
def register_domain():
    """Register a new domain"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['domain_name', 'user_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'{field} is required'}), 400
        
        domain_name = data['domain_name']
        user_id = data['user_id']
        
        # Validate domain name format
        domain_pattern = r'^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$'
        if not re.match(domain_pattern, domain_name):
            return jsonify({'success': False, 'error': 'Invalid domain name format'}), 400
        
        # Register domain using service
        domain = domain_service.register_domain(
            user_id=user_id,
            domain_name=domain_name,
            registration_data=data
        )
        
        return jsonify({
            'success': True,
            'domain': domain.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/domains', methods=['GET'])
def list_domains():
    """List all domains with optional filtering"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        status = request.args.get('status')
        tld = request.args.get('tld')
        min_value = request.args.get('min_value', type=float)
        max_value = request.args.get('max_value', type=float)
        search = request.args.get('search')
        
        # Build query
        query = Domain.query
        
        if status:
            try:
                status_enum = DomainStatus(status)
                query = query.filter_by(status=status_enum)
            except ValueError:
                return jsonify({'success': False, 'error': 'Invalid status'}), 400
        
        if tld:
            query = query.filter_by(tld=tld)
        
        if min_value is not None:
            query = query.filter(Domain.estimated_value >= min_value)
        
        if max_value is not None:
            query = query.filter(Domain.estimated_value <= max_value)
        
        if search:
            query = query.filter(Domain.name.contains(search))
        
        # Apply pagination
        total_count = query.count()
        domains = query.order_by(Domain.created_at.desc()).offset(offset).limit(limit).all()
        
        return jsonify({
            'success': True,
            'domains': [domain.to_dict() for domain in domains],
            'total_count': total_count,
            'limit': limit,
            'offset': offset
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/domains/<int:domain_id>', methods=['GET'])
def get_domain(domain_id):
    """Get domain details"""
    try:
        domain_details = domain_service.get_domain_details(domain_id)
        
        return jsonify({
            'success': True,
            'domain': domain_details
        })
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/domains/<int:domain_id>/tokenize', methods=['POST'])
def tokenize_domain(domain_id):
    """Initiate domain tokenization"""
    try:
        data = request.json
        
        chain_name = data.get('chain_name', 'polygon')
        owner_address = data.get('owner_address')
        
        if not owner_address:
            return jsonify({'success': False, 'error': 'Owner address is required'}), 400
        
        result = domain_service.initiate_tokenization(
            domain_id=domain_id,
            chain_name=chain_name,
            owner_address=owner_address
        )
        
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/domains/<int:domain_id>/claim', methods=['POST'])
def claim_domain_ownership(domain_id):
    """Claim ownership of a tokenized domain"""
    try:
        data = request.json
        
        token_id = data.get('token_id')
        registrant_handle = data.get('registrant_handle')
        
        if not all([token_id, registrant_handle]):
            return jsonify({'success': False, 'error': 'Token ID and registrant handle are required'}), 400
        
        result = domain_service.claim_domain_ownership(
            domain_id=domain_id,
            token_id=token_id,
            registrant_handle=registrant_handle
        )
        
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/domains/<int:domain_id>/bridge', methods=['POST'])
def bridge_domain_token(domain_id):
    """Bridge domain token to another chain"""
    try:
        data = request.json
        
        target_chain = data.get('target_chain')
        target_address = data.get('target_address')
        
        if not all([target_chain, target_address]):
            return jsonify({'success': False, 'error': 'Target chain and address are required'}), 400
        
        result = domain_service.bridge_domain_token(
            domain_id=domain_id,
            target_chain=target_chain,
            target_address=target_address
        )
        
        return jsonify(result)
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/domains/<int:domain_id>/list', methods=['POST'])
def list_domain_for_sale(domain_id):
    """List domain for sale"""
    try:
        data = request.json
        
        price = data.get('price')
        if not price or price <= 0:
            return jsonify({'success': False, 'error': 'Valid price is required'}), 400
        
        result = domain_service.list_domain_for_sale(domain_id, price)
        
        return jsonify({
            'success': True,
            'domain': result
        })
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/domains/<int:domain_id>/transactions', methods=['GET'])
def get_domain_transactions(domain_id):
    """Get all transactions for a domain"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        transaction_type = request.args.get('type')
        
        # Build query
        query = DomainTransaction.query.filter_by(domain_id=domain_id)
        
        if transaction_type:
            query = query.filter_by(transaction_type=transaction_type)
        
        # Apply pagination
        total_count = query.count()
        transactions = query.order_by(DomainTransaction.created_at.desc()).offset(offset).limit(limit).all()
        
        return jsonify({
            'success': True,
            'domain_id': domain_id,
            'transactions': [tx.to_dict() for tx in transactions],
            'total_count': total_count,
            'limit': limit,
            'offset': offset
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/transactions/<int:transaction_id>/status', methods=['PUT'])
def update_transaction_status(transaction_id):
    """Update transaction status by checking blockchain"""
    try:
        result = domain_service.update_transaction_status(transaction_id)
        
        return jsonify({
            'success': True,
            'transaction': result
        })
        
    except ValueError as e:
        return jsonify({'success': False, 'error': str(e)}), 404
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/domains/marketplace', methods=['GET'])
def get_marketplace_domains():
    """Get domains listed in the marketplace"""
    try:
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        domains = domain_service.get_marketplace_domains(limit, offset)
        
        return jsonify({
            'success': True,
            'domains': domains,
            'total_count': len(domains),
            'limit': limit,
            'offset': offset
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/domains/search', methods=['GET'])
def search_domains():
    """Search domains by name or other criteria"""
    try:
        query = request.args.get('q', '')
        limit = request.args.get('limit', 20, type=int)
        
        if not query:
            return jsonify({'success': False, 'error': 'Search query is required'}), 400
        
        # Search domains by name
        domains = Domain.query.filter(Domain.name.contains(query)).limit(limit).all()
        
        return jsonify({
            'success': True,
            'query': query,
            'domains': [domain.to_dict() for domain in domains],
            'total_results': len(domains)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/domains/trending', methods=['GET'])
def get_trending_domains():
    """Get trending domains based on activity"""
    try:
        limit = request.args.get('limit', 10, type=int)
        
        # Get domains with recent activity
        week_ago = datetime.utcnow() - timedelta(days=7)
        trending_domains = Domain.query.join(DomainTransaction).filter(
            DomainTransaction.created_at >= week_ago
        ).distinct().limit(limit).all()
        
        return jsonify({
            'success': True,
            'trending_domains': [domain.to_dict() for domain in trending_domains],
            'total_count': len(trending_domains)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@domain_bp.route('/domains/stats', methods=['GET'])
def get_domain_stats():
    """Get overall domain statistics"""
    try:
        total_domains = Domain.query.count()
        tokenized_domains = Domain.query.filter_by(status=DomainStatus.TOKENIZED).count()
        listed_domains = Domain.query.filter_by(is_listed=True).count()
        
        # Calculate total market value
        total_value = db.session.query(db.func.sum(Domain.estimated_value)).scalar() or 0
        
        # Get TLD distribution
        tld_stats = db.session.query(
            Domain.tld, 
            db.func.count(Domain.id).label('count')
        ).group_by(Domain.tld).all()
        
        return jsonify({
            'success': True,
            'stats': {
                'total_domains': total_domains,
                'tokenized_domains': tokenized_domains,
                'listed_domains': listed_domains,
                'total_market_value': total_value,
                'tld_distribution': {tld: count for tld, count in tld_stats}
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


