from email.base64mime import decode

from fastapi import FastAPI, Request, HTTPException, Response
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
import jwt

from backend.database.models_db import create_db
from backend.pydantic_models import PydanticRegistration, PydanticEnter, PydanticDetail
from backend.database.requests_db import add_user, check_user, select_fullname

app = FastAPI(title='Тестовое задание технострелка 2025')

templates = Jinja2Templates(directory='frontend', cache_size=0)
app.mount('/static', StaticFiles(directory='frontend/static'), name='static')

@app.get('/{path:path}.html', tags=['Получить html'])
async def give_html(path: str, request: Request) -> HTMLResponse:
    file_path = os.path.join('frontend', f'{path}.html')
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail='Такого файла не существует')
    try:
        data_token = jwt.decode(request.cookies.get('token'), 'secret', algorithms=['HS256'])
        is_enter  = True
        fullname = select_fullname(data_token['login'], data_token['password'])
    except:
        is_enter = False
        fullname = ''
    return  templates.TemplateResponse(f'{path}.html', {'request': request, 'is_enter': is_enter, 'fullname': fullname})

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

if __name__ == '__main__':
    create_db()
    uvicorn.run('main:app', reload=True)
