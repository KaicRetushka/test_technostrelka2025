from fastapi import FastAPI, Request, HTTPException, Response, UploadFile, File
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
from backend.pydantic_models import PydanticRegistration, PydanticEnter, PydanticDetail, BodyAddPolyline
from backend.database.requests_db import add_user, check_user, select_fullname, insert_polyline, check_admin
from backend.admin_models import PolylinePublicAdmin

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
async def add_polyline(request: Request, body: BodyAddPolyline, image: List[UploadFile] = File(...)) -> PydanticDetail:
    data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])
    data = check_user(data_token['login'], data_token['password'])
    if data['status_code'] == 400:
        raise HTTPException(status_code=400, detail='Неверный логин или пароль')
    insert_polyline(body.p_name, body.p_text, body.p_arr, body.p_color, body.is_public)
    if body.is_public:
        return {'detail': 'Ваш маршрут отправлен на проверку'}
    return {'detail': 'Вы добавили публичный маршрут'}

if __name__ == '__main__':
    create_db()
    uvicorn.run('main:app', reload=True)
