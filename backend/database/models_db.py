from sqlalchemy import create_engine, VARCHAR, ForeignKey, JSON, LargeBinary
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship

engine = create_engine('sqlite:///backend/database/mydb.db')
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

class TablePolylinePublic(Base):
    __tablename__ = 'polylines_public'
    p_id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    p_name: Mapped[str] = mapped_column(VARCHAR(100))
    p_text: Mapped[str]
    p_arr: Mapped[list] = mapped_column(JSON)
    p_color: Mapped[str] = mapped_column(VARCHAR(100))
    is_conf: Mapped[bool]
    polylines_public_photos = relationship('TablePhotosPolylinePublic', back_populates='polylines_public')

class TablePhotosPolylinePublic(Base):
    __tablename__ = 'polylines_public_photos'
    id_photo: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    photo_blob: Mapped[bytes] = mapped_column(LargeBinary)
    polylines_public = relationship('TablePolylinePublic', back_populates='polylines_public_photos')
    p_id: Mapped[int] = mapped_column(ForeignKey('polylines_public.p_id'))

class TablePolylinePrivate(Base):
    __tablename__ = 'polylines_private'
    p_id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    p_name: Mapped[str] = mapped_column(VARCHAR(100))
    p_text: Mapped[str]
    p_arr: Mapped[list] = mapped_column(JSON)
    p_color: Mapped[str] = mapped_column(VARCHAR(100))
    polylines_private_photos = relationship('TablePhotosPolylinePrivate', back_populates='polylines_private')

class TablePhotosPolylinePrivate(Base):
    __tablename__ = 'polylines_private_photos'
    id_photo: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    photo_blob: Mapped[bytes] = mapped_column(LargeBinary)
    polylines_private = relationship('TablePolylinePrivate', back_populates='polylines_private_photos')
    p_id: Mapped[int] = mapped_column(ForeignKey('polylines_private.p_id'))


def create_db():
    Base.metadata.create_all(bind=engine)