from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base

engine = create_engine('sqlite:///backend/database/mydb.db')
Base = declarative_base()

def create_db():
    Base.metadata.create_all(bind=engine)