from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, or_
import logging
from .models import BillingPlan, Consumer, APIProduct, BillingAssignment, APIConnector, MLConfiguration

logger = logging.getLogger(__name__)

class BillingPlanRepository:
    """Repository for billing plan operations"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, billing_plan_data: Dict[str, Any]) -> BillingPlan:
        """Create a new billing plan"""
        billing_plan = BillingPlan(**billing_plan_data)
        self.session.add(billing_plan)
        await self.session.commit()
        await self.session.refresh(billing_plan)
        return billing_plan
    
    async def get_by_id(self, plan_id: str) -> Optional[BillingPlan]:
        """Get billing plan by ID"""
        result = await self.session.execute(
            select(BillingPlan).where(BillingPlan.plan_id == plan_id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(self, active_only: bool = True) -> List[BillingPlan]:
        """Get all billing plans"""
        query = select(BillingPlan)
        if active_only:
            query = query.where(BillingPlan.is_active == True)
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def update(self, plan_id: str, updates: Dict[str, Any]) -> Optional[BillingPlan]:
        """Update billing plan"""
        await self.session.execute(
            update(BillingPlan)
            .where(BillingPlan.plan_id == plan_id)
            .values(**updates)
        )
        await self.session.commit()
        return await self.get_by_id(plan_id)
    
    async def delete(self, plan_id: str) -> bool:
        """Soft delete billing plan"""
        await self.session.execute(
            update(BillingPlan)
            .where(BillingPlan.plan_id == plan_id)
            .values(is_active=False)
        )
        await self.session.commit()
        return True

class ConsumerRepository:
    """Repository for consumer operations"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, consumer_data: Dict[str, Any]) -> Consumer:
        """Create a new consumer"""
        consumer = Consumer(**consumer_data)
        self.session.add(consumer)
        await self.session.commit()
        await self.session.refresh(consumer)
        return consumer
    
    async def get_by_id(self, consumer_id: str) -> Optional[Consumer]:
        """Get consumer by ID"""
        result = await self.session.execute(
            select(Consumer).where(Consumer.consumer_id == consumer_id)
        )
        return result.scalar_one_or_none()
    
    async def get_all(self, active_only: bool = True) -> List[Consumer]:
        """Get all consumers"""
        query = select(Consumer)
        if active_only:
            query = query.where(Consumer.is_active == True)
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def get_by_email(self, email: str) -> Optional[Consumer]:
        """Get consumer by email"""
        result = await self.session.execute(
            select(Consumer).where(Consumer.email == email)
        )
        return result.scalar_one_or_none()

class BillingAssignmentRepository:
    """Repository for billing assignment operations"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, assignment_data: Dict[str, Any]) -> BillingAssignment:
        """Create a new billing assignment"""
        assignment = BillingAssignment(**assignment_data)
        self.session.add(assignment)
        await self.session.commit()
        await self.session.refresh(assignment)
        return assignment
    
    async def get_assignments(
        self, 
        consumer_id: str,
        target_type: Optional[str] = None,
        target_id: Optional[str] = None
    ) -> List[BillingAssignment]:
        """Get billing assignments with filters"""
        query = select(BillingAssignment).where(
            BillingAssignment.consumer_id == consumer_id,
            BillingAssignment.is_active == True
        )
        
        if target_type:
            query = query.where(BillingAssignment.target_type == target_type)
        
        if target_id:
            query = query.where(BillingAssignment.target_id == target_id)
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def get_active_assignment(
        self, 
        consumer_id: str, 
        target_type: str, 
        target_id: str
    ) -> Optional[BillingAssignment]:
        """Get active assignment for specific target"""
        result = await self.session.execute(
            select(BillingAssignment).where(
                BillingAssignment.consumer_id == consumer_id,
                BillingAssignment.target_type == target_type,
                BillingAssignment.target_id == target_id,
                BillingAssignment.is_active == True
            )
        )
        return result.scalar_one_or_none()

class APIConnectorRepository:
    """Repository for API connector operations"""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, connector_data: Dict[str, Any]) -> APIConnector:
        """Create a new API connector"""
        connector = APIConnector(**connector_data)
        self.session.add(connector)
        await self.session.commit()
        await self.session.refresh(connector)
        return connector
    
    async def get_all(self, active_only: bool = True) -> List[APIConnector]:
        """Get all API connectors"""
        query = select(APIConnector)
        if active_only:
            query = query.where(APIConnector.is_active == True)
        
        result = await self.session.execute(query)
        return result.scalars().all()
    
    async def get_by_type(self, connector_type: str) -> List[APIConnector]:
        """Get connectors by type"""
        result = await self.session.execute(
            select(APIConnector).where(
                APIConnector.connector_type == connector_type,
                APIConnector.is_active == True
            )
        )
        return result.scalars().all()
    
    async def update_sync_status(self, connector_id: str, status: str, last_sync=None):
        """Update connector sync status"""
        update_data = {"sync_status": status}
        if last_sync:
            update_data["last_sync"] = last_sync
        
        await self.session.execute(
            update(APIConnector)
            .where(APIConnector.connector_id == connector_id)
            .values(**update_data)
        )
        await self.session.commit()
