import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Get DB URL from Environment Variable (Render provides this automatically)
# If not found (e.g., running locally), fall back to SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./visionvoice.db")

# 2. CRITICAL FIX FOR RENDER
# Render database URLs start with "postgres://", but SQLAlchemy requires "postgresql://"
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# 3. Configure the Engine
if "sqlite" in DATABASE_URL:
    # SQLite specific args (needed for local development)
    engine = create_engine(
        DATABASE_URL, connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL configuration (Production)
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()