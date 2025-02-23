from fastapi import FastAPI, Request, HTTPException, Response, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqladmin import Admin
from typing import List
import uvicorn
import os
import jwt


from backend.database.models_db import create_db, engine
from backend.pydantic_models import (PydanticRegistration, PydanticEnter, PydanticDetail, BodyAddPolyline, PydanticDetailPolylineId, InfoPolyline, 
                                     BodyCom, InfoCom, ResponseInfoUser, MarksPolyline, BodyLike, BodyChangePolyline, ReturnHistoryPolyline)
from backend.database.requests_db import (add_user, check_user, select_fullname, insert_polyline, check_admin, insert_photo_polyline,  
                                          selet_logins_all, select_p_p_all, select_p_p_photos_all, select_private_p_all, select_private_p_photos_all,
                                          update_avatar, select_avatar, insert_message, update_visited_polylines, select_comments, select_info_user,
                                          update_login, add_mark, drop_mark, select_marks, delte_visited_polylines, select_mark_polyline_user,
                                          delete_polyline_db, update_polyline, select_history_polylines)
from backend.admin_models import PolylinePublicAdmin, PhotosPolylinePublicAdmin

app = FastAPI(title='Тестовое задание технострелка 2025')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

templates = Jinja2Templates(directory='frontend', cache_size=0)
app.mount('/static', StaticFiles(directory='frontend/static'), name='static')

admin = Admin(app, engine)
admin.add_view(PolylinePublicAdmin)
admin.add_view(PhotosPolylinePublicAdmin)

@app.get('/{path:path}.html', tags=['Получить html'])
async def give_html(path: str, request: Request) -> HTMLResponse:
    file_path = os.path.join('frontend', f'{path}.html')
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail='Такого файла не существует')
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])
        is_enter  = True
        fullname = select_fullname(data_token['login'], data_token['password'])
        if check_admin(data_token['login'], data_token['password']):
            url_admin = 'http://127.0.0.1:8000/admin/'
        else:
            url_admin = ''
    except:
        is_enter = False
        fullname = ''
        url_admin = ''
    return  templates.TemplateResponse(f'{path}.html', {'request': request, 'is_enter': is_enter, 'fullname': fullname, 'url_admin': url_admin})

@app.post('/registration', tags=['Регистрация'])
async def registration(body: PydanticRegistration, response: Response) -> PydanticDetail:
    data = add_user(body.login, body.password, body.name, body.surname)
    if data['status_code'] == 400:
        raise HTTPException(status_code=400, detail=data['detail'])
    token = jwt.encode({'login': body.login, 'password': body.password}, 'secret', algorithm='HS256')
    response.set_cookie(key='token', value=token)
    return {'detail': data['detail']}

@app.post('/enter', tags=['Вход'])
async def enter(body: PydanticEnter, response: Response) -> PydanticDetail:
    data = check_user(body.login, body.password)
    if data['status_code'] == 400:
        raise HTTPException(status_code=400, detail='Неверный логин или пароль')
    token = jwt.encode({'login': body.login, 'password': body.password}, 'secret', algorithm='HS256')
    response.set_cookie(key='token', value=token)
    return {'detail': 'Вы успешно вошли'}

@app.delete('/exit', tags=['Выход'])
async def exit(response: Response):
    response.delete_cookie(key='token')
    return {'detail': 'Вы успешно вышли из аккаунта'}

@app.post('/polyline/add/',  tags=['Добавить маршрут'])
async def add_polyline(request: Request, body: BodyAddPolyline) -> PydanticDetailPolylineId:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')
    data = check_user(data_token['login'], data_token['password'])
    if data['status_code'] == 400:
        raise HTTPException(status_code=400, detail='Неверный логин или пароль')
    p_id =  insert_polyline(body.p_name, body.p_text, body.p_arr, body.p_color, body.is_public, data_token['login'])
    if body.is_public:
        return {'detail': 'Ваш маршрут отправлен на проверку', 'p_id': p_id}
    return {'detail': 'Вы добавили приватный маршрут', 'p_id': p_id}

@app.post('/polyline/add/photo/', tags=['Добавление фотографии к маршруту'])
async def add_photo_polyline(request: Request, p_id: int = Query(...), is_public: bool = Query(...),  photo: UploadFile = File(...)) -> PydanticDetail:
    if photo.content_type[0:5] != 'image':
        raise HTTPException(status_code=400, detail='Неверный тип файла')
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')
    photo_blob = await photo.read()
    data = insert_photo_polyline(data_token['login'], data_token['password'], p_id, is_public, photo_blob)
    if data['status_code'] == 400:
        raise HTTPException(status_code=400, detail=data['detail'])
    return {'status_code': 200, 'detail': data['detail']}

@app.get('/login/all/', tags=['Получение всех логинов пользователей'])
async def give_logins_all() -> List[str]:
    data = selet_logins_all()
    return data

@app.get('/polylines/public/', tags=['Получение всех подтверждённых публичных маршрутов пользовотеля'])
async def give_all_p_p(request: Request, login = Query(None)) -> List[InfoPolyline]:
    if login == None:
        try:
            data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])
            login = data_token['login']
        except:
            raise HTTPException(status_code=400, detail='Вы не зарегистрированы')  
    data = select_p_p_all(login)
    return data

@app.get('/polylines/public/photos/', tags=['Получение всех фоток подтверждённого публичных маршрутов пользовотеля'])
async def give_all_p_p(p_id = Query(...)) -> List:
    data = select_p_p_photos_all(p_id)
    return data

@app.get('/polylines/private/', tags=['Получение всех приватных маршрутов пользовотеля'])
async def give_all_private_p(request: Request) -> List[InfoPolyline]:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')
    data = select_private_p_all(data_token['login'])
    return data


@app.get('/polylines/private/photos/', tags=['Получение всех фоток приватного маршрутов пользовотеля'])
async def give_all_private_p(request: Request, p_id = Query(...)) -> List:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')
    data = select_private_p_photos_all(data_token['login'], p_id)
    return data

@app.put('/user/avatar/', tags=['Изменение аватарки пользователя'])
async def put_avatar(request: Request, avatar: UploadFile = File(...)) -> PydanticDetail:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')
    avatar_blob = await avatar.read()
    update_avatar(data_token['login'], avatar_blob)
    return {'detail': 'Вы успешно изменили аватарку'}

@app.get('/user/avatar', tags=['Получение аватарки пользователя'])
async def give_avatar(request: Request, login: str = None):
    if login == None:
        try:
            data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])
            login = data_token['login']
        except:
            raise HTTPException(status_code=400, detail='Вы не зарегистрированы')        
    data = select_avatar(login)
    return data

@app.post('/polylines/public/comment/', tags=['Добовление коментария к публичному маршруту'])
async def add_com_polylines(request: Request, body: BodyCom):
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])    
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')      
    data = insert_message(data_token['login'], body.comment, body.p_id)
    if not(data):
        raise HTTPException(status_code=400, detail='Неверный p_id')
    return {'detail': 'Коментарий добавлен'}

@app.get('/polylines/public/comment/', tags=['Получение всех комментарий к маршруту'])
async def give_comments(p_id) -> List[InfoCom]:
    data = select_comments(p_id)
    return data

@app.put('/users/visited/public/polyline', tags=['Добавление отметки о посещении маршрута'])
async def add_visited(request: Request, p_id: int) -> PydanticDetail:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])    
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')
    data = update_visited_polylines(data_token['login'], p_id)
    if not(data):
        raise HTTPException(status_code=400, detail='Неверный p_id')
    return {'detail': 'Отметка о посещении добавлена'}

@app.delete('/users/visited/public/polyline', tags=['Удаление отметки о посещении маршрута'])
async def delete_visited(request: Request, p_id: int) -> PydanticDetail:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])    
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')
    data = delte_visited_polylines(data_token['login'], p_id)
    if data:
        return {'detail': 'Вы удалили отметку'}
    raise HTTPException(status_code=400, detail='Вы не посещали этот маршрут')

@app.get('/user/info/', tags=['Получение всей информации о пользователе'])
async def give_user_indo(request: Request) -> ResponseInfoUser:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])    
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')
    data = select_info_user(data_token['login'])
    return data    

@app.put('/user/login/', tags=['Изменение логина']) 
async def change_login(request: Request, response: Response, new_login: str = Query(...)) -> PydanticDetail:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])    
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')
    data = update_login(data_token['login'], new_login)
    if data:
        token = jwt.encode({'login': new_login, 'password': data_token['password']}, 'secret', algorithm='HS256')
        response.set_cookie(key='token', value=token)
        return {'detail': 'Логин изменён'}
    raise HTTPException(status_code=400, detail='Такой логин занят')

@app.put('/mark/polyline/', tags=['Поставить лайк или дизлайк к маршруту'])
async def give_mark(request: Request, p_id: int = Query(...), is_like: bool = Query(...)) -> PydanticDetail:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])    
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')   
    data = add_mark(p_id, data_token['login'], is_like)
    if data:
        return {'detail': 'Оценка поставлена'}
    raise HTTPException(status_code=400, detail='Неверные данные')

@app.delete('/mark/polyline/', tags=['Удалить лайк или дизлайк к маршруту'])
async def delete_mark(request: Request, p_id: int = Query(...)) -> PydanticDetail:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])    
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')   
    data = drop_mark(p_id, data_token['login']) 
    if data:
        return {'detail': 'Оценка удалена'}
    raise HTTPException(status_code=400, detail='Неверные данные')   

@app.get('/mark/polyline/', tags=['Получить все оценки маршрута'])
async def give_marks(p_id: int = Query(...)) -> MarksPolyline:
    data = select_marks(p_id)
    return data

@app.get('/user/mark/polyline/', tags=['Получение оценки пользователя маршрута'])
async def give_mark_polyline(request: Request, p_id: int = Query(...)) -> BodyLike:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])    
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы')  
    data = select_mark_polyline_user(data_token['login'], p_id)  
    return data  

@app.delete('/polyline/', tags=['Удаление маршрута'])
async def delete_polyline(request: Request, p_id: int = Query(...), is_public: bool = Query(...)) -> PydanticDetail:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])    
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы') 
    data = delete_polyline_db(data_token['login'], p_id, is_public)
    if data:
        return {'detail': 'Вы удалили маршрут'}
    raise HTTPException(status_code=400, detail='Неверные данные')    

@app.put('/polyline/change/', tags=['Изменить маршрут'])
async def change_polyline(request: Request, body: BodyChangePolyline) -> PydanticDetail:
    print(body.photos_arr)
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])    
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы') 
    data = update_polyline(data_token['login'], body.is_public, body.p_id, body.p_name, body.p_text, body.p_arr, body.p_color, body.photos_arr)
    if data:
        return {'detail': 'Маршрут изменён'}
    raise HTTPException(status_code=400, detail='Неверные данные')

@app.get('/polyline/history/', tags=['Получить историю маршрута'])
async def give_history_polylines(request: Request, p_id: int = Query(...), is_public: bool = Query(...)) -> List[ReturnHistoryPolyline]:
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])    
    except:
        raise HTTPException(status_code=400, detail='Вы не зарегистрированы') 
    data = select_history_polylines(data_token['login'], p_id, is_public)
    return data

if __name__ == '__main__':
    create_db()
    uvicorn.run('main:app', reload=True)
