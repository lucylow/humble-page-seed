from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional
import json

db = SQLAlchemy()

class DomainStatus(Enum):
    REGISTERED = "registered"
    TOKENIZED = "tokenized"
    CLAIMED = "claimed"
    BRIDGED = "bridged"
    FRACTIONALIZED = "fractionalized"

class TokenizationStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"

class Domain(db.Model):
    """
    Domain model for DomaLand.AI platform
    """
    __tablename__ = 'domains'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)
    sld = db.Column(db.String(100), nullable=False)  # Second Level Domain
    tld = db.Column(db.String(10), nullable=False)   # Top Level Domain
    
    # Ownership
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    owner_address = db.Column(db.String(42), nullable=True)
    
    # Domain status
    status = db.Column(db.Enum(DomainStatus), default=DomainStatus.REGISTERED, nullable=False)
    tokenization_status = db.Column(db.Enum(TokenizationStatus), nullable=True)
    
    # Tokenization details
    token_id = db.Column(db.String(50), nullable=True)
    chain_id = db.Column(db.String(20), nullable=True)
    contract_address = db.Column(db.String(42), nullable=True)
    voucher_nonce = db.Column(db.String(100), nullable=True)
    proof_of_contacts_handle = db.Column(db.String(100), nullable=True)
    
    # Fractionalization details
    is_fractionalized = db.Column(db.Boolean, default=False, nullable=False)
    fraction_contract_address = db.Column(db.String(42), nullable=True)
    total_shares = db.Column(db.Integer, nullable=True)
    share_price = db.Column(db.Float, nullable=True)
    
    # Domain information
    estimated_value = db.Column(db.Float, default=0.0, nullable=False)
    listing_price = db.Column(db.Float, nullable=True)
    is_listed = db.Column(db.Boolean, default=False, nullable=False)
    is_synthetic = db.Column(db.Boolean, default=False, nullable=False)
    
    # Dates
    registration_date = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    expiration_date = db.Column(db.DateTime, nullable=True)
    last_valuation_date = db.Column(db.DateTime, nullable=True)
    
    # Additional metadata
    registrar_iana_id = db.Column(db.Integer, nullable=True)
    valuation_confidence = db.Column(db.Float, nullable=True)
    ipfs_hash = db.Column(db.String(100), nullable=True)
    
    # Relationships
    transactions = db.relationship('DomainTransaction', backref='domain', lazy=True)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert domain to dictionary"""
        return {
            'id': self.id,
            'name': self.name,
            'sld': self.sld,
            'tld': self.tld,
            'owner_id': self.owner_id,
            'owner_address': self.owner_address,
            'status': self.status.value,
            'tokenization_status': self.tokenization_status.value if self.tokenization_status else None,
            'token_id': self.token_id,
            'chain_id': self.chain_id,
            'contract_address': self.contract_address,
            'voucher_nonce': self.voucher_nonce,
            'proof_of_contacts_handle': self.proof_of_contacts_handle,
            'is_fractionalized': self.is_fractionalized,
            'fraction_contract_address': self.fraction_contract_address,
            'total_shares': self.total_shares,
            'share_price': self.share_price,
            'estimated_value': self.estimated_value,
            'listing_price': self.listing_price,
            'is_listed': self.is_listed,
            'is_synthetic': self.is_synthetic,
            'registration_date': self.registration_date.isoformat() if self.registration_date else None,
            'expiration_date': self.expiration_date.isoformat() if self.expiration_date else None,
            'last_valuation_date': self.last_valuation_date.isoformat() if self.last_valuation_date else None,
            'registrar_iana_id': self.registrar_iana_id,
            'valuation_confidence': self.valuation_confidence,
            'ipfs_hash': self.ipfs_hash
        }
    
    def __repr__(self):
        return f'<Domain {self.name}>'

class DomainTransaction(db.Model):
    """
    Domain transaction model for tracking all domain-related operations
    """
    __tablename__ = 'domain_transactions'
    
    id = db.Column(db.Integer, primary_key=True)
    domain_id = db.Column(db.Integer, db.ForeignKey('domains.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Transaction details
    transaction_type = db.Column(db.String(50), nullable=False)  # tokenize, claim, bridge, etc.
    transaction_hash = db.Column(db.String(66), nullable=True)
    status = db.Column(db.String(20), default='pending', nullable=False)  # pending, confirmed, failed
    
    # Blockchain details
    block_number = db.Column(db.BigInteger, nullable=True)
    gas_used = db.Column(db.BigInteger, nullable=True)
    gas_price = db.Column(db.String(50), nullable=True)
    confirmed_at = db.Column(db.DateTime, nullable=True)
    
    # Error handling
    error_message = db.Column(db.Text, nullable=True)
    
    # Metadata (JSON field for flexible data storage)
    transaction_metadata = db.Column(db.JSON, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert transaction to dictionary"""
        return {
            'id': self.id,
            'domain_id': self.domain_id,
            'user_id': self.user_id,
            'transaction_type': self.transaction_type,
            'transaction_hash': self.transaction_hash,
            'status': self.status,
            'block_number': self.block_number,
            'gas_used': self.gas_used,
            'gas_price': self.gas_price,
            'confirmed_at': self.confirmed_at.isoformat() if self.confirmed_at else None,
            'error_message': self.error_message,
            'transaction_metadata': self.transaction_metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<DomainTransaction {self.transaction_type} for domain {self.domain_id}>'


