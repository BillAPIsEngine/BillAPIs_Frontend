from sqlalchemy import Column, String, Integer, Boolean, DateTime, Text, Float, JSON, ForeignKey, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class BillingPlan(Base):
    __tablename__ = "billing_plans"
    
    plan_id = Column(String(255), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    rules = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Consumer(Base):
    __tablename__ = "consumers"
    
    consumer_id = Column(String(255), primary_key=True, default=generate_uuid)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    metadata = Column(JSON, default={})
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class APIProduct(Base):
    __tablename__ = "api_products"
    
    product_id = Column(String(255), primary_key=True, default=generate_uuid)
    consumer_id = Column(String(255), ForeignKey('consumers.consumer_id'), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    apis = Column(JSON, nullable=False)  # Array of API IDs
    is_active = Column(Boolean, default=True)
    metadata = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class BillingAssignment(Base):
    __tablename__ = "billing_assignments"
    
    assignment_id = Column(String(255), primary_key=True, default=generate_uuid)
    consumer_id = Column(String(255), ForeignKey('consumers.consumer_id'), nullable=False)
    billing_plan_id = Column(String(255), ForeignKey('billing_plans.plan_id'), nullable=False)
    target_type = Column(String(50), nullable=False)  # 'api', 'consumer', 'api_product'
    target_id = Column(String(255), nullable=False)
    effective_date = Column(Date, nullable=False)
    end_date = Column(Date)
    is_active = Column(Boolean, default=True)
    metadata = Column(JSON, default={})
    created_by = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class APIConnector(Base):
    __tablename__ = "api_connectors"
    
    connector_id = Column(String(255), primary_key=True, default=generate_uuid)
    connector_type = Column(String(50), nullable=False)
    name = Column(String(255), nullable=False)
    config = Column(JSON, nullable=False)
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime(timezone=True))
    sync_status = Column(String(50), default='pending')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class MLConfiguration(Base):
    __tablename__ = "ml_configuration"
    
    config_id = Column(String(255), primary_key=True, default=generate_uuid)
    global_enabled = Column(Boolean, default=False)
    data_collection_enabled = Column(Boolean, default=False)
    data_collection_settings = Column(JSON, default={})
    training_status = Column(String(50), default='disabled')
    last_training_run = Column(DateTime(timezone=True))
    next_scheduled_training = Column(DateTime(timezone=True))
    created_by = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_by = Column(String(255))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
