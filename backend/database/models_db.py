from sqlalchemy import create_engine, VARCHAR, ForeignKey
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship

engine = create_engine('sqlite:///backend/database/mydb.db', echo=True)
Base = declarative_base()

class TableUsers(Base):
    __tablename__ = 'users'
    login: Mapped[str] = mapped_column(VARCHAR(100), primary_key=True)
    password: Mapped[str] = mapped_column(VARCHAR(100))
    name: Mapped[str] = mapped_column(VARCHAR(100))
    surname: Mapped[str] = mapped_column(VARCHAR(100))
    role: Mapped[str] = mapped_column(VARCHAR(100), ForeignKey('roles.role'))
    roles = relationship('TableRoles', back_populates='users')

class TableRoles(Base):
    __tablename__ = 'roles'
    role: Mapped[str] = mapped_column(VARCHAR(100), primary_key=True)
    users = relationship('TableUsers', back_populates='roles')

def create_db():
    Base.metadata.create_all(bind=engine)