from fastapi import FastAPI, Request, HTTPException, Response, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from PIL import Image
from sqladmin import Admin
from typing import List
import uvicorn
import os
import jwt


from backend.database.models_db import create_db, engine
from backend.pydantic_models import PydanticRegistration, PydanticEnter, PydanticDetail, BodyAddPolyline, PydanticDetailPolylineId, InfoPolyline
from backend.database.requests_db import (add_user, check_user, select_fullname, insert_polyline, check_admin, insert_photo_polyline,  
                                          selet_logins_all, select_p_p_all, select_p_p_photos_all)
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
        print(check_admin(data_token['login'], data_token['password']))
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
    return {'detail': 'Вы добавили публичный маршрут', 'p_id': p_id}

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
    print(data)
    return data

@app.get('/polylines/public/', tags=['Получение всех подтверждённых публичных маршрутов пользовотеля'])
async def give_all_p_p(login = Query(...)) -> List[InfoPolyline]:
    data = select_p_p_all(login)
    return data

@app.get('/polylines/public/photos/', tags=['Получение всех фоток подтверждённых публичных маршрутов пользовотеля'])
async def give_all_p_p(p_id = Query(...)):
    data = select_p_p_photos_all(p_id)
    return data


if __name__ == '__main__':
    create_db()
    uvicorn.run('main:app', reload=True)
