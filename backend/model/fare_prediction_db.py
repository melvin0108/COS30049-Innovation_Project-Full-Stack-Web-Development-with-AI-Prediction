# backend/model/fare_prediction_db.py
import os
import logging
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define database URL using an environment variable
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./fare_prediction.db")

# Create the database engine
engine = create_engine(DATABASE_URL)
Base = declarative_base()

# Define the FarePrediction model
class FarePrediction(Base):
    __tablename__ = "fare_prediction"

    id = Column(Integer, primary_key=True, index=True)
    airline = Column(String, nullable=False)
    source_city = Column(String, nullable=False)
    destination_city = Column(String, nullable=False)
    departure_time = Column(String, nullable=False)
    arrival_time = Column(String, nullable=False)
    stops = Column(String, nullable=False)
    flight_class = Column(String, nullable=False)
    duration = Column(Float, nullable=False) 
    days_left = Column(Integer, nullable=False)
    predicted_fare = Column(Float, nullable=False)

# Create the table
Base.metadata.create_all(bind=engine)

# Create a session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
