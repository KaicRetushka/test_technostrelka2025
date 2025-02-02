from sqlalchemy.orm import sessionmaker

from backend.database.models_db import engine, TableUsers

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
            return {'status_code': 200, 'detail': 'Такой ользователь существует'}
        else:
            return {'status_code': 400, 'detail': 'Такого пользователя нет'}

def select_fullname(login, password):
    with Session() as session:
        user = session.query(TableUsers).filter((TableUsers.login == login) & (TableUsers.password == password)).first()
        fullname = user.name + ' ' + user.surname
        return  fullname