from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import uvicorn
import os

from backend.database.models_db import create_db

app = FastAPI(title='Тестовое задание технострелка 2025')

templates = Jinja2Templates(directory='frontend')
app.mount('/static', StaticFiles(directory='frontend/static'), name='static')

@app.get('/{path:path}.html')
async def give_html(path: str, request: Request) -> HTMLResponse:
    file_path = os.path.join('frontend', f'{path}.html')
    if not os.path.isfile(file_path):
        raise HTTPException(status_code=404, detail='Такого файла не существует')
    return  templates.TemplateResponse(f'{path}.html', {'request': request})


if __name__ == '__main__':
    create_db()
    uvicorn.run('main:app', reload=True)
