from sqlalchemy import create_engine, VARCHAR, ForeignKey, JSON, LargeBinary, event, TEXT
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship
from sqlalchemy.orm import Session

engine = create_engine('sqlite:///backend/database/mydb.db')
# engine = create_engine('mysql+mysqlconnector://hakaton_user:hakaton@212.22.82.237:3306/hakaton')
Base = declarative_base()

@event.listens_for(engine, "connect")
def set_foreign_keys(dbapi_connection, connection_record):
    dbapi_connection.execute("PRAGMA foreign_keys = ON")

class TableUsers(Base):
    __tablename__ = 'users'
    login: Mapped[str] = mapped_column(VARCHAR(100), primary_key=True)
    password: Mapped[str] = mapped_column(VARCHAR(100))
    name: Mapped[str] = mapped_column(VARCHAR(100))
    surname: Mapped[str] = mapped_column(VARCHAR(100))
    role: Mapped[str] = mapped_column(VARCHAR(100), ForeignKey('roles.role', onupdate='CASCADE', ondelete='CASCADE'))
    roles = relationship('TableRoles', back_populates='users')
    polylines_public = relationship('TablePolylinePublic', back_populates='users')
    polylines_private = relationship('TablePolylinePrivate', back_populates='users')
    avatar_blob: Mapped[bytes] = mapped_column(LargeBinary, nullable=True)
    polylines_public_comments = relationship('TableCommentsPolylinePublic', back_populates='users')
    viseted_polylines_public: Mapped[list] = mapped_column(JSON, default='[]')
    polylines_public_marks = relationship('TableMarksPolylinePublic', back_populates='users')
    history_polyline_public = relationship('TableHistoryPolylinePublic', back_populates='users', cascade='all, delete-orphan')
    history_polyline_private = relationship('TableHistoryPolylinePrivate', back_populates='users', cascade='all, delete-orphan')

class TableRoles(Base):
    __tablename__ = 'roles'
    role: Mapped[str] = mapped_column(VARCHAR(100), primary_key=True)
    users = relationship('TableUsers', back_populates='roles')

class TablePolylinePublic(Base):
    __tablename__ = 'polylines_public'
    p_id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    p_name: Mapped[str] = mapped_column(VARCHAR(100))
    p_text: Mapped[str] = mapped_column(TEXT)
    p_arr: Mapped[list] = mapped_column(JSON)
    p_color: Mapped[str] = mapped_column(VARCHAR(100))
    is_conf: Mapped[bool]
    polylines_public_photos = relationship('TablePhotosPolylinePublic', back_populates='polylines_public', cascade="all, delete-orphan")
    login_user: Mapped[str] = mapped_column(ForeignKey('users.login', onupdate='CASCADE', ondelete='CASCADE'))
    users = relationship('TableUsers', back_populates='polylines_public')
    polylines_public_comments = relationship('TableCommentsPolylinePublic', back_populates='polylines_public', cascade="all, delete-orphan")
    polylines_public_marks = relationship('TableMarksPolylinePublic', back_populates='polylines_public', cascade="all, delete-orphan")
    history_polyline_public = relationship('TableHistoryPolylinePublic', back_populates='polylines_public', cascade="all, delete-orphan")

class TableHistoryPolylinePublic(Base):
    __tablename__ = 'history_polyline_public'
    p_id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    head_p_id: Mapped[int] = mapped_column(ForeignKey('polylines_public.p_id', onupdate='CASCADE', ondelete='CASCADE'))
    polylines_public = relationship('TablePolylinePublic', back_populates='history_polyline_public')
    p_name: Mapped[str] = mapped_column(VARCHAR(100))
    p_text: Mapped[str] = mapped_column(TEXT)
    p_arr: Mapped[list] = mapped_column(JSON)
    p_color: Mapped[str] = mapped_column(VARCHAR(100))
    login_user: Mapped[str] = mapped_column(ForeignKey('users.login', onupdate='CASCADE', ondelete='CASCADE'))
    users = relationship('TableUsers', back_populates='history_polyline_public')
    photos_arr: Mapped[list] = mapped_column(JSON, default='[]')

class TableMarksPolylinePublic(Base):
    __tablename__ = 'polylines_public_marks'
    login_user: Mapped[str] = mapped_column(ForeignKey('users.login', onupdate='CASCADE', ondelete='CASCADE'), primary_key=True)
    users = relationship('TableUsers', back_populates='polylines_public_marks')
    p_id: Mapped[int] = mapped_column(ForeignKey('polylines_public.p_id', onupdate='CASCADE', ondelete='CASCADE'), primary_key=True)
    polylines_public = relationship('TablePolylinePublic', back_populates='polylines_public_marks')
    is_like: Mapped[bool]

class TablePhotosPolylinePublic(Base):
    __tablename__ = 'polylines_public_photos'
    id_photo: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    photo_blob: Mapped[bytes] = mapped_column(LargeBinary)
    polylines_public = relationship('TablePolylinePublic', back_populates='polylines_public_photos')
    p_id: Mapped[int] = mapped_column(ForeignKey('polylines_public.p_id', onupdate='CASCADE', ondelete='CASCADE'))

class TableCommentsPolylinePublic(Base):
    __tablename__ = 'polylines_public_comments'
    c_id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    c_text: Mapped[str] = mapped_column(TEXT)
    polylines_public = relationship('TablePolylinePublic', back_populates='polylines_public_comments')
    p_id: Mapped[int] = mapped_column(ForeignKey('polylines_public.p_id', onupdate='CASCADE', ondelete='CASCADE'))
    users = relationship('TableUsers', back_populates='polylines_public_comments')
    login_user: Mapped[str] = mapped_column(ForeignKey('users.login', onupdate='CASCADE', ondelete='CASCADE'))

class TablePolylinePrivate(Base):
    __tablename__ = 'polylines_private'
    p_id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    p_name: Mapped[str] = mapped_column(VARCHAR(100))
    p_text: Mapped[str] = mapped_column(TEXT)
    p_arr: Mapped[list] = mapped_column(JSON)
    p_color: Mapped[str] = mapped_column(VARCHAR(100))
    polylines_private_photos = relationship('TablePhotosPolylinePrivate', back_populates='polylines_private', cascade="all, delete-orphan")
    login_user: Mapped[int] = mapped_column(ForeignKey('users.login', onupdate='CASCADE', ondelete='CASCADE'))
    users = relationship('TableUsers', back_populates='polylines_private')
    history_polyline_private = relationship('TableHistoryPolylinePrivate', back_populates='polylines_private', cascade="all, delete-orphan")

class TableHistoryPolylinePrivate(Base):
    __tablename__ = 'history_polyline_private'
    p_id: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    head_p_id: Mapped[int] = mapped_column(ForeignKey('polylines_private.p_id', onupdate='CASCADE', ondelete='CASCADE'))
    polylines_private = relationship('TablePolylinePrivate', back_populates='history_polyline_private')
    p_name: Mapped[str] = mapped_column(VARCHAR(100))
    p_text: Mapped[str] = mapped_column(TEXT)
    p_arr: Mapped[list] = mapped_column(JSON)
    p_color: Mapped[str] = mapped_column(VARCHAR(100))
    login_user: Mapped[str] = mapped_column(ForeignKey('users.login', onupdate='CASCADE', ondelete='CASCADE'))
    users = relationship('TableUsers', back_populates='history_polyline_private')
    photos_arr: Mapped[list] = mapped_column(JSON, default='[]')

class TablePhotosPolylinePrivate(Base):
    __tablename__ = 'polylines_private_photos'
    id_photo: Mapped[int] = mapped_column(autoincrement=True, primary_key=True)
    photo_blob: Mapped[bytes] = mapped_column(LargeBinary)
    polylines_private = relationship('TablePolylinePrivate', back_populates='polylines_private_photos')
    p_id: Mapped[int] = mapped_column(ForeignKey('polylines_private.p_id', onupdate='CASCADE', ondelete='CASCADE'))

def create_db():
    # Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    with Session(bind=engine, autoflush=False) as session:
        if not(session.query(TableRoles.role).filter(TableRoles.role == 'Admin').first()):
            role_admin = TableRoles(role='Admin')
            role_user = TableRoles(role='User')
            session.add_all([role_admin, role_user])
            session.commit()