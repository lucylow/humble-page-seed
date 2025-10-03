from flask import Blueprint, jsonify, request
from src.services.domain_service import DomainService
from src.models.domain import Domain, DomainTransaction
from src.models.user import User, db
import traceback

domain_bp = Blueprint('domain', __name__)
domain_service = DomainService()

@domain_bp.route('/domains', methods=['GET'])
def get_domains():
    """Get all domains with optional filtering"""
    try:
        # Get query parameters
        user_id = request.args.get('user_id', type=int)
        status = request.args.get('status')
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        if user_id:
            # Get domains for specific user
            domains = domain_service.get_user_domains(user_id, status)
        else:
            # Get all domains (for admin or marketplace)
            query = Domain.query
            if status:
                try:
                    from src.models.domain import DomainStatus
                    status_enum = DomainStatus(status)
                    query = query.filter_by(status=status_enum)
                except ValueError:
                    return jsonify({'error': 'Invalid status filter'}), 400
            
            domains_obj = query.offset(offset).limit(limit).all()
            domains = [domain.to_dict() for domain in domains_obj]
        
        return jsonify({
            'success': True,
            'domains': domains,
            'count': len(domains)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/domains', methods=['POST'])
def register_domain():
    """Register a new domain"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['user_id', 'domain_name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Register domain
        domain = domain_service.register_domain(
            user_id=data['user_id'],
            domain_name=data['domain_name'],
            registration_data={
                'owner_address': data.get('owner_address'),
                'estimated_value': data.get('estimated_value', 100.0),
                'registrar_iana_id': data.get('registrar_iana_id', 1)
            }
        )
        
        return jsonify({
            'success': True,
            'domain': domain.to_dict(),
            'message': 'Domain registered successfully'
        }), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/domains/<int:domain_id>', methods=['GET'])
def get_domain_details(domain_id):
    """Get detailed information about a specific domain"""
    try:
        domain_details = domain_service.get_domain_details(domain_id)
        
        return jsonify({
            'success': True,
            'domain': domain_details
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/domains/<int:domain_id>/tokenize', methods=['POST'])
def tokenize_domain(domain_id):
    """Initiate domain tokenization"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['chain_name', 'owner_address']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Validate chain name
        supported_chains = ['ethereum', 'polygon', 'base']
        if data['chain_name'] not in supported_chains:
            return jsonify({
                'success': False,
                'error': f'Unsupported chain. Supported chains: {supported_chains}'
            }), 400
        
        # Initiate tokenization
        result = domain_service.initiate_tokenization(
            domain_id=domain_id,
            chain_name=data['chain_name'],
            owner_address=data['owner_address']
        )
        
        return jsonify(result), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/domains/<int:domain_id>/claim', methods=['POST'])
def claim_domain_ownership(domain_id):
    """Claim ownership of a tokenized domain"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['token_id', 'registrant_handle']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Claim ownership
        result = domain_service.claim_domain_ownership(
            domain_id=domain_id,
            token_id=data['token_id'],
            registrant_handle=data['registrant_handle']
        )
        
        return jsonify(result), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/domains/<int:domain_id>/bridge', methods=['POST'])
def bridge_domain_token(domain_id):
    """Bridge domain token to another chain"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['target_chain', 'target_address']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Missing required field: {field}'
                }), 400
        
        # Validate target chain
        supported_chains = ['ethereum', 'polygon', 'base']
        if data['target_chain'] not in supported_chains:
            return jsonify({
                'success': False,
                'error': f'Unsupported target chain. Supported chains: {supported_chains}'
            }), 400
        
        # Bridge token
        result = domain_service.bridge_domain_token(
            domain_id=domain_id,
            target_chain=data['target_chain'],
            target_address=data['target_address']
        )
        
        return jsonify(result), 201
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/domains/<int:domain_id>/list', methods=['POST'])
def list_domain_for_sale(domain_id):
    """List a domain for sale in the marketplace"""
    try:
        data = request.json
        
        # Validate required fields
        if 'price' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: price'
            }), 400
        
        # Validate price
        try:
            price = float(data['price'])
            if price <= 0:
                raise ValueError("Price must be positive")
        except (ValueError, TypeError):
            return jsonify({
                'success': False,
                'error': 'Invalid price format'
            }), 400
        
        # List domain
        result = domain_service.list_domain_for_sale(domain_id, price)
        
        return jsonify({
            'success': True,
            'domain': result,
            'message': 'Domain listed for sale successfully'
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/domains/<int:domain_id>/unlist', methods=['POST'])
def unlist_domain(domain_id):
    """Remove domain from marketplace"""
    try:
        domain = Domain.query.get(domain_id)
        if not domain:
            return jsonify({
                'success': False,
                'error': 'Domain not found'
            }), 404
        
        domain.is_listed = False
        domain.listing_price = None
        db.session.commit()
        
        return jsonify({
            'success': True,
            'domain': domain.to_dict(),
            'message': 'Domain removed from marketplace'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/marketplace', methods=['GET'])
def get_marketplace_domains():
    """Get domains listed in the marketplace"""
    try:
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        min_price = request.args.get('min_price', type=float)
        max_price = request.args.get('max_price', type=float)
        tld = request.args.get('tld')
        
        # Build query
        query = Domain.query.filter_by(is_listed=True)
        
        if min_price is not None:
            query = query.filter(Domain.listing_price >= min_price)
        if max_price is not None:
            query = query.filter(Domain.listing_price <= max_price)
        if tld:
            query = query.filter(Domain.tld == tld)
        
        # Get domains
        domains_obj = query.offset(offset).limit(limit).all()
        domains = [domain.to_dict() for domain in domains_obj]
        
        # Get total count
        total_count = query.count()
        
        return jsonify({
            'success': True,
            'domains': domains,
            'count': len(domains),
            'total_count': total_count,
            'has_more': offset + len(domains) < total_count
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """Get domain transactions"""
    try:
        user_id = request.args.get('user_id', type=int)
        domain_id = request.args.get('domain_id', type=int)
        transaction_type = request.args.get('type')
        status = request.args.get('status')
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        
        # Build query
        query = DomainTransaction.query
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        if domain_id:
            query = query.filter_by(domain_id=domain_id)
        if transaction_type:
            query = query.filter_by(transaction_type=transaction_type)
        if status:
            query = query.filter_by(status=status)
        
        # Order by creation date (newest first)
        query = query.order_by(DomainTransaction.created_at.desc())
        
        # Get transactions
        transactions_obj = query.offset(offset).limit(limit).all()
        transactions = [tx.to_dict() for tx in transactions_obj]
        
        return jsonify({
            'success': True,
            'transactions': transactions,
            'count': len(transactions)
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/transactions/<int:transaction_id>/status', methods=['PUT'])
def update_transaction_status(transaction_id):
    """Update transaction status by checking blockchain"""
    try:
        result = domain_service.update_transaction_status(transaction_id)
        
        return jsonify({
            'success': True,
            'transaction': result,
            'message': 'Transaction status updated'
        })
        
    except ValueError as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 404
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/stats', methods=['GET'])
def get_domain_stats():
    """Get domain statistics"""
    try:
        # Get overall statistics
        total_domains = Domain.query.count()
        tokenized_domains = Domain.query.filter_by(status='tokenized').count()
        listed_domains = Domain.query.filter_by(is_listed=True).count()
        
        # Get transaction statistics
        total_transactions = DomainTransaction.query.count()
        pending_transactions = DomainTransaction.query.filter_by(status='pending').count()
        confirmed_transactions = DomainTransaction.query.filter_by(status='confirmed').count()
        
        # Get TLD distribution
        from sqlalchemy import func
        tld_stats = db.session.query(
            Domain.tld,
            func.count(Domain.id).label('count')
        ).group_by(Domain.tld).all()
        
        tld_distribution = {tld: count for tld, count in tld_stats}
        
        return jsonify({
            'success': True,
            'stats': {
                'domains': {
                    'total': total_domains,
                    'tokenized': tokenized_domains,
                    'listed': listed_domains,
                    'tokenization_rate': (tokenized_domains / total_domains * 100) if total_domains > 0 else 0
                },
                'transactions': {
                    'total': total_transactions,
                    'pending': pending_transactions,
                    'confirmed': confirmed_transactions,
                    'success_rate': (confirmed_transactions / total_transactions * 100) if total_transactions > 0 else 0
                },
                'tld_distribution': tld_distribution
            }
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@domain_bp.route('/chains', methods=['GET'])
def get_supported_chains():
    """Get supported blockchain networks"""
    try:
        chains = []
        for chain_name, config in domain_service.doma_client.SUPPORTED_CHAINS.items():
            fees = domain_service.doma_client.get_protocol_fees(chain_name)
            
            chains.append({
                'name': chain_name,
                'chain_id': config['chain_id'],
                'rpc_url': config['rpc_url'],
                'proxy_contract': config['proxy_contract'],
                'fees': {
                    'tokenization': str(fees['tokenization']),
                    'claiming': str(fees['claiming']),
                    'bridging': str(fees['bridging'])
                }
            })
        
        return jsonify({
            'success': True,
            'chains': chains
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

