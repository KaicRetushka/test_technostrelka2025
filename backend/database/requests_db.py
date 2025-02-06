from sqlalchemy.orm import sessionmaker
import base64

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

def insert_polyline(p_name, p_text, p_arr, p_color, is_public, login_user):
    with Session() as session:
        if is_public:
            polyline = TablePolylinePublic(p_name=p_name, p_text=p_text, p_arr=p_arr, p_color=p_color, is_conf=False, login_user=login_user)
        else:
            polyline = TablePolylinePrivate(p_name=p_name, p_text=p_text, p_arr=p_arr, p_color=p_color, login_user=login_user)
        session.add(polyline)
        session.commit()
        p_id = polyline.p_id
    return p_id

def insert_photo_polyline(login, password, p_id, is_public, photo_blob):
    if check_user(login, password)['status_code'] == 400:
        return {'status_code': 400, 'detail': 'Неверный токен'}
    with Session() as session:
        if is_public:
            polyline =  session.query(TablePolylinePublic).filter((TablePolylinePublic.login_user == login) & (TablePolylinePublic.p_id == p_id)).first()
            if not(polyline):
                return {'status_code': 400, 'detail': 'Неверный p_id'}
            photo_polyline = TablePhotosPolylinePublic(photo_blob=photo_blob, p_id=p_id)
        else:
            polyline =  session.query(TablePolylinePrivate).filter((TablePolylinePrivate.login_user == login) & (TablePolylinePrivate.p_id == p_id)).first()
            if not(polyline):
                return {'status_code': 400, 'detail': 'Неверный p_id'}
            photo_polyline = TablePhotosPolylinePrivate(photo_blob=photo_blob, p_id=p_id)
        session.add(photo_polyline)
        session.commit()
        return {'status_code': 200, 'detail': 'Фотография вставлен успешно'}
    
def selet_logins_all():
    with Session() as session:
        logins = session.query(TableUsers.login).all()
        arr_logins = []
        for login in logins:
            arr_logins.append(login[0])
    return arr_logins

def select_p_p_all(login):
    with Session() as session:
        polylines_arr = []
        polylines = session.query(TablePolylinePublic).filter((TablePolylinePublic.login_user == login) & (TablePolylinePublic.is_conf == True)).all()
        for polyline in polylines:
            polylines_arr.append({'p_id': polyline.p_id, 
                                 'p_name': polyline.p_name, 
                                 'p_text': polyline.p_text, 
                                 'p_arr': polyline.p_arr, 
                                 'p_color': polyline.p_color})
    return polylines_arr

def select_p_p_photos_all(p_id):
    with Session() as session:
        photos_blob_arr = []
        photos_blob = session.query(TablePhotosPolylinePublic.photo_blob).filter(TablePhotosPolylinePublic.p_id == p_id).all()
        for photo_blob in photos_blob:
            photos_blob_arr.append(base64.b64encode(photo_blob[0]).decode('utf-8'))
    return photos_blob_arr

def select_private_p_all(login):
    with Session() as session:
        polylines_arr = []
        polylines = session.query(TablePolylinePrivate).filter(TablePolylinePrivate.login_user == login).all()
        for polyline in polylines:
            polylines_arr.append({'p_id': polyline.p_id, 
                                 'p_name': polyline.p_name, 
                                 'p_text': polyline.p_text, 
                                 'p_arr': polyline.p_arr, 
                                 'p_color': polyline.p_color})
    return polylines_arr   

def select_private_p_photos_all(login, p_id):
    with Session() as session:
        photos_blob_arr = []
        photos_blob = session.query(TablePhotosPolylinePrivate.photo_blob).filter(TablePhotosPolylinePrivate.p_id == p_id).all()
        for photo_blob in photos_blob:
            photos_blob_arr.append(base64.b64encode(photo_blob[0]).decode('utf-8'))
    return photos_blob_arr
