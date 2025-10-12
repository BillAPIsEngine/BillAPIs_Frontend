import os
import logging
from typing import Optional
import asyncpg
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool

logger = logging.getLogger(__name__)

class DatabaseConfig:
    """Database configuration and connection management"""
    
    def __init__(self):
        self.db_url = self._get_database_url()
        self.engine = None
        self.async_session = None
        self.is_connected = False
    
    def _get_database_url(self) -> str:
        """Get database URL from environment variables"""
        db_host = os.getenv('POSTGRES_HOST', 'localhost')
        db_port = os.getenv('POSTGRES_PORT', '5432')
        db_name = os.getenv('POSTGRES_DB', 'monetization')
        db_user = os.getenv('POSTGRES_USER', 'user')
        db_password = os.getenv('POSTGRES_PASSWORD', 'password')
        
        return f"postgresql+asyncpg://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    async def initialize(self):
        """Initialize database connection and create tables"""
        try:
            # Create async engine
            self.engine = create_async_engine(
                self.db_url,
                echo=False,  # Set to True for SQL query logging
                poolclass=NullPool,  # Better for async
                pool_pre_ping=True,  # Check connection before using
                pool_recycle=3600,   # Recycle connections after 1 hour
            )
            
            # Create session factory
            self.async_session = async_sessionmaker(
                self.engine,
                class_=AsyncSession,
                expire_on_commit=False,
                autoflush=True
            )
            
            # Test connection
            async with self.engine.begin() as conn:
                await conn.execute("SELECT 1")
            
            self.is_connected = True
            logger.info("Database connection established successfully")
            
            # Run database migrations
            await self._run_migrations()
            
        except Exception as e:
            logger.error(f"Failed to initialize database: {str(e)}")
            raise
    
    async def _run_migrations(self):
        """Run database migrations and ensure tables exist"""
        try:
            from .models import Base  # Import your SQLAlchemy models
            
            async with self.engine.begin() as conn:
                # Create all tables
                await conn.run_sync(Base.metadata.create_all)
                
            logger.info("Database migrations completed successfully")
            
        except Exception as e:
            logger.error(f"Database migration failed: {str(e)}")
            raise
    
    async def get_session(self) -> AsyncSession:
        """Get database session"""
        if not self.is_connected:
            await self.initialize()
        
        async with self.async_session() as session:
            try:
                yield session
            except Exception as e:
                await session.rollback()
                logger.error(f"Database session error: {str(e)}")
                raise
            finally:
                await session.close()
    
    async def close(self):
        """Close database connections"""
        if self.engine:
            await self.engine.dispose()
        self.is_connected = False
        logger.info("Database connections closed")

# Global database instance
db_config = DatabaseConfig()
