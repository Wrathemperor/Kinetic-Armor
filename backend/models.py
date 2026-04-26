import os
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Organization(db.Model):
    __tablename__ = 'organizations'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    api_key = db.Column(db.String(100), unique=True, nullable=False)

class SystemConfig(db.Model):
    __tablename__ = 'system_config'
    id = db.Column(db.Integer, primary_key=True)
    scan_threshold = db.Column(db.Integer, default=35)
    webhook_url = db.Column(db.String(255))

class Asset(db.Model):
    __tablename__ = 'assets'
    id = db.Column(db.Integer, primary_key=True)
    org_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    phash = db.Column(db.String(64), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Violation(db.Model):
    __tablename__ = 'violations'
    id = db.Column(db.Integer, primary_key=True)
    asset_id = db.Column(db.Integer, db.ForeignKey('assets.id'), nullable=False)
    found_url = db.Column(db.String(500), nullable=False)
    found_image_path = db.Column(db.String(500))  # New field
    severity = db.Column(db.Integer)  # 1-10
    status = db.Column(db.String(50), default='open')  # open, taken_down
    context = db.Column(db.String(255))
    draft_dmca = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
