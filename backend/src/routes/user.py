from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from src.models.user import User, UserRole, db
from datetime import datetime
import re

user_bp = Blueprint('user', __name__)

@user_bp.route('/users', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'{field} is required'}), 400
        
        # Validate email format
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, data['email']):
            return jsonify({'success': False, 'error': 'Invalid email format'}), 400
        
        # Check if user already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'success': False, 'error': 'Username already exists'}), 409
        
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'success': False, 'error': 'Email already exists'}), 409
        
        # Create new user
        user = User(
            username=data['username'],
            email=data['email'],
            password_hash=generate_password_hash(data['password']),
            wallet_address=data.get('wallet_address'),
            first_name=data.get('first_name'),
            last_name=data.get('last_name'),
            bio=data.get('bio'),
            avatar_url=data.get('avatar_url')
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get user by ID"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user information"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        data = request.json
        
        # Update allowed fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'bio' in data:
            user.bio = data['bio']
        if 'avatar_url' in data:
            user.avatar_url = data['avatar_url']
        if 'wallet_address' in data:
            user.wallet_address = data['wallet_address']
        
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>/domains', methods=['GET'])
def get_user_domains(user_id):
    """Get all domains owned by a user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        domains = [domain.to_dict() for domain in user.domains]
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'domains': domains,
            'total_domains': len(domains)
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>/transactions', methods=['GET'])
def get_user_transactions(user_id):
    """Get all transactions for a user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Get query parameters
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        transaction_type = request.args.get('type')
        
        # Build query
        query = db.session.query(DomainTransaction).filter_by(user_id=user_id)
        
        if transaction_type:
            query = query.filter_by(transaction_type=transaction_type)
        
        # Apply pagination
        transactions = query.order_by(DomainTransaction.created_at.desc()).offset(offset).limit(limit).all()
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'transactions': [tx.to_dict() for tx in transactions],
            'total_transactions': query.count()
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/users/verify-email', methods=['POST'])
def verify_email():
    """Verify user email address"""
    try:
        data = request.json
        email = data.get('email')
        verification_code = data.get('verification_code')
        
        if not email or not verification_code:
            return jsonify({'success': False, 'error': 'Email and verification code required'}), 400
        
        user = User.query.filter_by(email=email).first()
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # In a real implementation, you would verify the code
        # For now, just mark as verified
        user.email_verified = True
        user.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Email verified successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/users/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'error': 'Username and password required'}), 400
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == username) | (User.email == username)
        ).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'success': False, 'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'success': False, 'error': 'Account is deactivated'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'user': user.to_dict(),
            'message': 'Login successful'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

@user_bp.route('/users/<int:user_id>/stats', methods=['GET'])
def get_user_stats(user_id):
    """Get user statistics"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404
        
        # Calculate stats
        total_domains = len(user.domains)
        tokenized_domains = len([d for d in user.domains if d.status.value == 'tokenized'])
        total_transactions = len(user.transactions)
        
        # Calculate portfolio value
        portfolio_value = sum(domain.estimated_value for domain in user.domains)
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'stats': {
                'total_domains': total_domains,
                'tokenized_domains': tokenized_domains,
                'total_transactions': total_transactions,
                'portfolio_value': portfolio_value,
                'account_age_days': (datetime.utcnow() - user.created_at).days
            }
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500


