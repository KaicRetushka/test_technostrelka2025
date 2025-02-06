from sqlalchemy.orm import sessionmaker

from backend.database.models_db import engine, TableUsers, TablePolylinePublic, TablePolylinePrivate, TablePhotosPolylinePublic, TablePhotosPolylinePrivate

Session = sessionmaker(bind=engine, autoflush=False)

def add_user(login, password, name, surname):
    with Session() as session:
        user = session.query(TableUsers).filter(TableUsers.login == login).first()
        if user:
            return {'status_code': 400, 'detail': 'Такой логин уже занят'}
        else:
            user = TableUsers(login=login, password=password, name=name, surname=surname, role='User')
            session.add(user)
            session.commit()
            return {'status_code': 200, 'detail': 'Успешная регистрация'}

def check_user(login, password):
    with Session() as session:
        user = session.query(TableUsers).filter((TableUsers.login == login) & (TableUsers.password == password)).first()
        if user:
            return {'status_code': 200, 'detail': 'Такой пользователь существует'}
        else:
            return {'status_code': 400, 'detail': 'Такого пользователя нет'}

def select_fullname(login, password):
    with Session() as session:
        user = session.query(TableUsers).filter((TableUsers.login == login) & (TableUsers.password == password)).first()
    fullname = user.name + ' ' + user.surname
    return  fullname

def check_admin(login, password):
    try:
        with Session() as session:
            user = session.query(TableUsers.role).filter((TableUsers.login == login) & (TableUsers.password == password)).first()
        if user.role == 'Admin':
            return True
        return False
    except:
        return False

def insert_polyline(p_name, p_text, p_arr, p_color, is_public, login_user, arr_blob):
    with Session() as session:
        if is_public:
            polyline = TablePolylinePublic(p_name=p_name, p_text=p_text, p_arr=p_arr, p_color=p_color, is_conf=False, login_user=login_user)
        else:
            polyline = TablePolylinePrivate(p_name=p_name, p_text=p_text, p_arr=p_arr, p_color=p_color, login_user=login_user)
        session.add(polyline)
        session.commit()
        p_id = polyline.p_id
        for photo_blob in arr_blob:
            if is_public:
                photo = TablePhotosPolylinePublic(photo_blob=photo_blob, p_id=p_id)
            else:
                photo = TablePhotosPolylinePrivate(photo_blob=photo_blob, p_id=p_id)
            session.add(photo)
            session.commit()