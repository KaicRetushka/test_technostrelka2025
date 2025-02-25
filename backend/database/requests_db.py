from sqlalchemy.orm import sessionmaker
from sqlalchemy import func
import base64
import json

from backend.database.models_db import (engine, TableUsers, TablePolylinePublic, TablePolylinePrivate, TablePhotosPolylinePublic, TablePhotosPolylinePrivate,
                                        TableCommentsPolylinePublic, TableMarksPolylinePublic, TableHistoryPolylinePublic, TableHistoryPolylinePrivate)

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
        photos_blob = session.query(TablePhotosPolylinePrivate.photo_blob).filter((TablePhotosPolylinePrivate.p_id == p_id)).all()
        for photo_blob in photos_blob:
            photos_blob_arr.append(base64.b64encode(photo_blob[0]).decode('utf-8'))
    return photos_blob_arr

def update_avatar(login, avatar_blob):
    with Session() as session:
        avatar_blob_db = session.query(TableUsers).filter(TableUsers.login == login).first()
        avatar_blob_db.avatar_blob = avatar_blob
        session.commit()

def select_avatar(login):
    with Session() as session:
        avatar_blob = session.query(TableUsers.avatar_blob).filter(TableUsers.login == login).first()
        if avatar_blob[0] is None:
            with open('base.jpg', 'rb') as file:
                avatar_blob = file.read()
                avatar_base64 = base64.b64encode(avatar_blob).decode('utf-8')
                return avatar_base64
        avatar_base64 = base64.b64encode(avatar_blob[0]).decode('utf-8')
        return avatar_base64
    
def insert_message(login, comment, p_id):
    with Session() as session:
        polyline = session.query(TablePolylinePublic).filter(TablePolylinePublic.p_id == p_id).first()
        if not(polyline):
            return False
        comment = TableCommentsPolylinePublic(login_user=login, c_text=comment, p_id=p_id)
        session.add(comment)
        session.commit()
    return True

def update_visited_polylines(login, p_id):
    with Session() as session:
        polyline = session.query(TablePolylinePublic).filter((TablePolylinePublic.p_id == p_id) & (TablePolylinePublic.is_conf == True)).filter()
        if not(polyline):
            return False
        user = session.query(TableUsers).filter(TableUsers.login == login).first()
        viseted_polylines_public = json.loads(user.viseted_polylines_public)
        if not(p_id in viseted_polylines_public):
            viseted_polylines_public.append(p_id)
        user.viseted_polylines_public = json.dumps(viseted_polylines_public)
        session.commit()
    return True

def delte_visited_polylines(login, p_id):
    with Session() as session:
        polyline = session.query(TablePolylinePublic).filter((TablePolylinePublic.p_id == p_id) & (TablePolylinePublic.is_conf == True)).filter()
        if not(polyline):
            return False
        user = session.query(TableUsers).filter(TableUsers.login == login).first()
        viseted_polylines_public = json.loads(user.viseted_polylines_public)
        if not(p_id in viseted_polylines_public):
            return False
        viseted_polylines_public.remove(p_id)  
        user.viseted_polylines_public = json.dumps(viseted_polylines_public)
        session.commit()
    return True 

def select_comments(p_id):
    with Session() as session:
        arr_comments = []
        comments = session.query(TableCommentsPolylinePublic).filter(TableCommentsPolylinePublic.p_id == p_id).all()
        for comment in comments:
            arr_comments.append({'login_user': comment.login_user, 'c_text': comment.c_text})
    return arr_comments

def select_info_user(login):
    with Session() as session:
        user = session.query(TableUsers).filter(TableUsers.login == login).first()
    data = {
        'login': user.login,
        'password': user.password,
        'name': user.name,
        'surname': user.surname,
        'role': user.role,
        'viseted_polylines_public': json.loads(user.viseted_polylines_public)
    } 
    return data

def update_login(login, new_login):
    with Session() as session:
        user = session.query(TableUsers).filter(TableUsers.login == new_login).first()
    if user:
        return False
    with Session() as session:
        user = session.query(TableUsers).filter(TableUsers.login == login).first()
        user.login = new_login
        session.commit()
    return True

def add_mark(p_id, login, is_like):
    with Session() as session:
        polyline = session.query(TablePolylinePublic).filter((TablePolylinePublic.p_id == p_id) & (TablePolylinePublic.is_conf == True)).first()
        if polyline:
            mark = session.query(TableMarksPolylinePublic).filter((TableMarksPolylinePublic.login_user == login) & (TableMarksPolylinePublic.p_id == p_id)).first()
            if mark:
                session.delete(mark)
            try:
                mark = TableMarksPolylinePublic(p_id=p_id, login_user=login, is_like=is_like)
                session.add(mark)
                session.commit()
                return True
            except:
                return False
        
def drop_mark(p_id, login):
    with Session() as session:
        polyline = session.query(TablePolylinePublic).filter((TablePolylinePublic.p_id == p_id) & (TablePolylinePublic.is_conf == True)).first()
        if polyline:
            mark = session.query(TableMarksPolylinePublic).filter((TableMarksPolylinePublic.login_user == login) & (TableMarksPolylinePublic.p_id == p_id)).first()
            if mark:
                session.delete(mark)
                session.commit()
                return True
            return False
    
def select_marks(p_id):
    with Session() as session:
        count_like = session.query(func.count(TableMarksPolylinePublic.is_like)).filter((TableMarksPolylinePublic.p_id == p_id) & 
                                                                                        (TableMarksPolylinePublic.is_like == True)).scalar()
        count_dislike = session.query(func.count(TableMarksPolylinePublic.is_like)).filter((TableMarksPolylinePublic.p_id == p_id) & 
                                                                                        (TableMarksPolylinePublic.is_like == False)).scalar()
        return {'count_like': count_like, 'count_dislike': count_dislike}
    
def select_mark_polyline_user(login, p_id):
    with Session() as session:
        mark = session.query(TableMarksPolylinePublic).filter((TableMarksPolylinePublic.login_user == login) &
                                                              (TableMarksPolylinePublic.p_id == p_id)).first()
        if mark:
            return {'is_like': mark.is_like}
        return {'is_like': None}
    
def delete_polyline_db(login, p_id, is_public):
    with Session() as session:
        if is_public:
            polyline = session.query(TablePolylinePublic).filter((TablePolylinePublic.login_user == login)
                                                                 & (TablePolylinePublic.p_id == p_id)).first()
        else:
            polyline = session.query(TablePolylinePrivate).filter((TablePolylinePrivate.login_user == login)
                                                                 & (TablePolylinePrivate.p_id == p_id)).first()
        if polyline:
            session.delete(polyline)
            session.commit()
            return True
        return False
    
def update_polyline(login, is_public, p_id, p_name, p_text, p_arr, p_color, photos_arr):
    with Session() as session:
        if is_public:
            polyline = session.query(TablePolylinePublic).filter((TablePolylinePublic.login_user == login)
                                                                & (TablePolylinePublic.p_id == p_id)).first()
        else:
            polyline = session.query(TablePolylinePrivate).filter((TablePolylinePrivate.login_user == login)
                                                                & (TablePolylinePrivate.p_id == p_id)).first()
        if polyline:
            if is_public:
                photos = session.query(TablePhotosPolylinePublic).filter(TablePhotosPolylinePublic.p_id == p_id).all()
                new_photos_arr = []
                for photo in photos:
                    new_photos_arr.append(base64.b64encode(photo.photo_blob).decode('utf-8'))
                history_polyline = TableHistoryPolylinePublic(head_p_id=polyline.p_id, p_name=polyline.p_name, p_text=polyline.p_text,  p_arr=polyline.p_arr, p_color=polyline.p_color, login_user=polyline.login_user, photos_arr=json.dumps(new_photos_arr))
            else:
                photos = session.query(TablePhotosPolylinePrivate).filter(TablePhotosPolylinePrivate.p_id == p_id).all()
                new_photos_arr = []
                for photo in photos:
                    new_photos_arr.append(base64.b64encode(photo.photo_blob).decode('utf-8'))
                history_polyline = TableHistoryPolylinePrivate(head_p_id=polyline.p_id, p_name=polyline.p_name, p_text=polyline.p_text,  p_arr=polyline.p_arr, p_color=polyline.p_color, login_user=polyline.login_user, photos_arr=json.dumps(new_photos_arr))
            session.add(history_polyline)
            if p_name:
                polyline.p_name = p_name
            if p_text:
                polyline.p_text = p_text
            if p_arr:
                polyline.p_arr = p_arr
            if p_color:
                polyline.p_color = p_color
            print('p', photos_arr)
            if photos_arr:
                print('a')
                if is_public:
                    print('aa')
                    photos = session.query(TablePhotosPolylinePublic).filter(TablePhotosPolylinePublic.p_id == p_id).all()
                    for photo in photos:
                        session.delete(photo)
                    for photo_blob in photos_arr:
                        photo = TablePhotosPolylinePublic(photo_blob=photo_blob, p_id=p_id)
                        session.add(photo)
                else:
                    photos = session.query(TablePhotosPolylinePrivate).filter(TablePhotosPolylinePrivate.p_id == p_id).all()
                    for photo in photos:
                        session.delete(photo)
                    for photo_blob in photos_arr:
                        photo = TablePhotosPolylinePrivate(photo_blob=photo_blob, p_id=p_id)
                        session.add(photo)
            session.commit()
            return True             
        return False
    
def select_history_polylines(login, p_id, is_public):
    with Session() as session:
        history_polylines = []
        if is_public:
            responses = session.query(TableHistoryPolylinePublic).filter((TableHistoryPolylinePublic.login_user == login) &
                                                                         (TableHistoryPolylinePublic.head_p_id == p_id)).all()
            for response in responses:
                history_polylines.append({
                    'id': response.p_id,
                    'p_name': response.p_name,
                    'p_text': response.p_text,
                    'p_arr': response.p_arr,
                    'p_color': response.p_color,
                    'photos_arr': json.loads(response.photos_arr)
                })
        else:
            responses = session.query(TableHistoryPolylinePrivate).filter((TableHistoryPolylinePrivate.login_user == login) &
                                                                         (TableHistoryPolylinePrivate.head_p_id == p_id)).all()
            for response in responses:
                history_polylines.append({
                    'id': response.p_id,
                    'p_name': response.p_name,
                    'p_text': response.p_text,
                    'p_arr': response.p_arr,
                    'p_color': response.p_color,
                    'photos_arr': json.loads(response.photos_arr)
                })
        return history_polylines