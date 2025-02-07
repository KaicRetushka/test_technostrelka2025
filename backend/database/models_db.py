from sqlalchemy import create_engine, VARCHAR, ForeignKey, JSON, LargeBinary
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship
from sqlalchemy.orm import Session

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
    polylines_public = relationship('TablePolylinePublic', back_populates='users')
    polylines_private = relationship('TablePolylinePrivate', back_populates='users')
    avatar_blob: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    polylines_public_comments = relationship('TableCommentsPolylinePublic', back_populates='users')
    viseted_polylines_public: Mapped[str] = mapped_column(JSON, default='[]')

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
    login_user: Mapped[int] = mapped_column(ForeignKey('users.login'))
    users = relationship('TableUsers', back_populates='polylines_public')
    polylines_public_comments = relationship('TableCommentsPolylinePublic', back_populates='polylines_public')

class TablePhotosPolylinePublic(Base):
    __tablename__ = 'polylines_public_photos'
    id_photo: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    photo_blob: Mapped[bytes] = mapped_column(LargeBinary)
    polylines_public = relationship('TablePolylinePublic', back_populates='polylines_public_photos')
    p_id: Mapped[int] = mapped_column(ForeignKey('polylines_public.p_id'))

class TableCommentsPolylinePublic(Base):
    __tablename__ = 'polylines_public_comments'
    c_id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    c_text: Mapped[str]
    polylines_public = relationship('TablePolylinePublic', back_populates='polylines_public_comments')
    p_id: Mapped[int] = mapped_column(ForeignKey('polylines_public.p_id'))
    users = relationship('TableUsers', back_populates='polylines_public_comments')
    login_user: Mapped[int] = mapped_column(ForeignKey('users.login'))

class TablePolylinePrivate(Base):
    __tablename__ = 'polylines_private'
    p_id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    p_name: Mapped[str] = mapped_column(VARCHAR(100))
    p_text: Mapped[str]
    p_arr: Mapped[list] = mapped_column(JSON)
    p_color: Mapped[str] = mapped_column(VARCHAR(100))
    polylines_private_photos = relationship('TablePhotosPolylinePrivate', back_populates='polylines_private')
    login_user: Mapped[int] = mapped_column(ForeignKey('users.login'))
    users = relationship('TableUsers', back_populates='polylines_private')

class TablePhotosPolylinePrivate(Base):
    __tablename__ = 'polylines_private_photos'
    id_photo: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    photo_blob: Mapped[bytes] = mapped_column(LargeBinary)
    polylines_private = relationship('TablePolylinePrivate', back_populates='polylines_private_photos')
    p_id: Mapped[int] = mapped_column(ForeignKey('polylines_private.p_id'))

def create_db():
    Base.metadata.create_all(bind=engine)
    with Session(bind=engine, autoflush=False) as session:
        if not(session.query(TableRoles.role).filter(TableRoles.role == 'Admin').first()):
            role_admin = TableRoles(role='Admin')
            role_user = TableRoles(role='User')
            session.add_all([role_admin, role_user])
            session.commit()