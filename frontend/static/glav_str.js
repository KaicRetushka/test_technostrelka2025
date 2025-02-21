const btn_add_polyline = document.getElementById('btn_add_route')
const dobav_foto = document.getElementById('dobav_foto')
const universe = document.getElementById('info_photo_route')
let open_comment = document.querySelector('#comments')
console.log(btn_add_polyline)
let is_polyline = false
let arr = []
let mass = []
let polyline
let info_route = document.querySelector('#info_route')
let star = document.querySelector('#info_name')
let space = document.querySelector('#info_opisanie')
let exit_glav_str = document.getElementById('button_glav_exit')
let lich_kab = document.getElementById('fullname')
let mark_good = document.querySelector('#kolvo_mark_good')
let mark_bad = document.querySelector('#kolvo_mark_bad')
let but_mark_good = document.querySelector('#but_mark_good')
let but_mark_bad = document.querySelector('#but_mark_bad')
let myMap
let but_visit_route = document.querySelector('#visit_route')


document.addEventListener('DOMContentLoaded', () => {
    if (exit_glav_str !== null) {
        exit_glav_str.addEventListener('click', async () => {
            let response = await fetch('http://127.0.0.1:8000/exit', {
                method: 'DELETE',
                headers: {'Content-Type': 'application/json'}
            });
            window.location.href = 'glav_str.html'; 
        });
    }


    if (lich_kab !== undefined) {
        lich_kab.addEventListener('click', () => {
            console.log('fsd')
            window.location.href = 'http://127.0.0.1:8000/lich_kab.html'
        })
    }
    
});



//создание карты и возможность добавлять маршрут
ymaps.ready(init);

async function init(){
    
    myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 16
    });
    


    const el = document.getElementById('login_all');
    let data = await fetch('http://127.0.0.1:8000/login/all/', {
        headers: {'Content-Type': 'application/json'}
    });

    let logs = await data.json();
    console.log('МАССИВ ЛОГИНОВ: ', logs);

    //если запрос возвращает ok, то проходимся по каждому пользователю
    if (data.ok) { 
        //очищаем элемент перед добавлением новых кнопок
        el.innerHTML = '';

    } else {
        console.error('Ошибка при загрузке данных:', data.statusText);
    }


    
    //отображение всех логинов и создание к ним кнопок
    for (let i = 0; i < logs.length; i++) {
        
        //создаем контейнер для логина и аватарки
        const userContainer = document.createElement('div');

        //создаем кнопку с логином
        const button = document.createElement('button');
        button.id = `but_login${i}`;
        button.innerText = logs[i];
        userContainer.appendChild(button); // Добавляем кнопку в контейнер

        //получаем аватарку пользователя
        let response = await fetch(`http://127.0.0.1:8000/user/avatar?login=${logs[i]}`, {
            headers: {'Content-Type': 'application/json'}
        });

        let base64 = await response.json();
        const img = document.createElement('img');
        img.src = `data:image/png;base64,${base64}`;
        img.style.width = '100px';
        img.style.height = '100px';
        img.style.marginLeft = '10px'; // Отступ между логином и аватаркой

        userContainer.appendChild(img); // Добавляем аватарку в контейнер
        el.appendChild(userContainer); // Добавляем контейнер в основной элемент

        let login_for_route = logs[i]
        but_route = document.getElementById(`but_login${i}`)
        console.log(`but_login${i}: `, login_for_route)

        //то, что будет происходить при нажатии на кнопки с логинами
        but_route.addEventListener('click', async () => {

            console.log('ЧТО-ТО НАЖАЛОСЬ')

            myMap.geoObjects.removeAll(polyline);
            
            let response = await fetch(`http://127.0.0.1:8000/polylines/public/?login=${login_for_route}`, {
                headers: {'Content-Type': 'application/json'}
            })

            let route = await response.json()
            console.log('Маршруты: ', route)
            
            //вывод всех маршрутов пользователя при нажатии на его кнопку с логином
            for (let j = 0; j < route.length; ++j){
                polyline = new ymaps.Polyline(route[j].p_arr, {}, {
                    strokeColor: route[j].p_color,
                    strokeWidth: 4
                })     
                myMap.geoObjects.add(polyline)

                //вывод информации о маршруте, при нажатии на линию маршрута
                polyline.events.add(['click'], async () => {
                    
                    info_route.showModal()

                    star.innerHTML = ''
                    space.innerHTML = ''
                    universe.innerHTML = ''
                    
                    star.innerHTML += route[j].p_name
                    space.innerHTML += route[j].p_text

                    let p_id_route = route[j].p_id

                    info_image(p_id_route)


                    open_comment.removeEventListener('click', () => {
                        comment_route.showModal()
                    });

                    open_comment.addEventListener('click', () => {
                        comment_route.showModal()
                    });

                    let p_id = route[j].p_id; 
                    console.log('Это маршрут номер ', p_id)

                    get_user_comment(p_id);

                    let otpravka = document.getElementById('set_comments')
                    otpravka.addEventListener('click', () => {
                        add_user_comment(p_id)
                    })
                    

                    get_mark_route(p_id)
                    
                    but_mark_good.onclick = async () => {
                        // if () СДЕЛАТЬ ПРОВЕРКУ УСЛОВИЯ (ЕСЛИ is_like = 1 или 0, то delete + то, что ниже, либо только то, что ниже)
                        let user_mark = await fetch(`http://127.0.0.1:8000/user/mark/polyline/?p_id=${p_id}`, {
                            headers: {'Content-Type': 'application/json'}
                        })

                        user_mark = await user_mark.json()
                        let user_is_like = user_mark.is_like

                        console.log('p_id: ', p_id)
                        console.log('user_is_like: ', user_is_like)
 
                        if (user_is_like === 1) {
                            // Убираем лайк
                            await delete_mark_route(p_id);
                            console.log('Убрали лайк');
                        } else if (user_is_like === 0) {
                            // Убираем дизлайк и ставим лайк
                            await delete_mark_route(p_id);
                            await set_mark_route(p_id, true);
                            console.log('Поставили лайк');
                        } else {
                            // Ставим лайк
                            await set_mark_route(p_id, true);
                            console.log('Поставили лайк');
                        }
                        
                    };
            
                    // Обработчик для дизлайка
                    but_mark_bad.onclick = async () => {

                        let user_mark = await fetch(`http://127.0.0.1:8000/user/mark/polyline/?p_id=${p_id}`, {
                            headers: {'Content-Type': 'application/json'}
                        })

                        user_mark = await user_mark.json()
                        let user_is_like = user_mark.is_like
                        
                        console.log('p_id: ', p_id)

                        console.log('user_is_like: ', user_is_like)
 
                        if (user_is_like === 0) {
                            // Убираем дизлайк
                            await delete_mark_route(p_id);
                            console.log('Убрали дизлайк');
                        } else if (user_is_like === 1) {
                            // Убираем лайк и ставим дизлайк
                            await delete_mark_route(p_id);
                            await set_mark_route(p_id, false);
                            console.log('Поставили дизлайк');
                        } else {
                            // Ставим дизлайк
                            await set_mark_route(p_id, false);
                            console.log('Поставили дизлайк');
                        }
                        
                    };


                    //получаем инфу о пользователе, чтобы видеть его отметки о посещении маршрутов
                    let user_info = await get_user_info()
                    
                    let isVisited = user_info.viseted_polylines_public.includes(p_id);
                    but_visit_route.textContent = isVisited ? '𒊹' : '𒊹';

                    but_visit_route.onclick = async () => {
                        if (isVisited) {
                            await delete_visit_route(p_id);
                            but_visit_route.textContent = '𒊹';
                            but_visit_route.style.color = 'rgb(255, 0, 0)'
                        } else {
                            await add_visit_route(p_id);
                            but_visit_route.textContent = '𒊹';
                            but_visit_route.style.color = 'rgb(0, 255, 0)'
                        }
                        isVisited = !isVisited; // Переключаем состояние
                    };





                })

            }
        
        })

    }
    btn_add_polyline.addEventListener('click', () => {
        myMap.geoObjects.removeAll(polyline);
        let myPolyline = new ymaps.Polyline([], {}, {
            strokeColor: "#00000088",
            // Ширину линии.
            strokeWidth: 4,
        
            // Добавляем в контекстное меню новый пункт, позволяющий удалить ломаную.
            editorMenuManager: function (items) {
                items.push({
                    title: "Удалить линию",
                    onClick: function () {
                        arr = []
                        myPolyline.geometry.setCoordinates(arr)
                        is_polyline = false
                    }
                });
                return items;
            }
        });
        arr = []
        console.log('Было нажатие')
        is_polyline = true
        myMap.geoObjects.add(myPolyline)
        myMap.events.add('click', (event) => {
        if (is_polyline){
            let eCoords = event.get('coords');
            arr.push(eCoords)
            myPolyline.geometry.setCoordinates(arr)
        }
        });
        myPolyline.editor.startEditing();
    })

}


//получение фоток публичного маршрута
async function info_image(p_id_route) { 
    let info_image = await fetch(`http://127.0.0.1:8000/polylines/public/photos/?p_id=${p_id_route}`, {
        headers: {'Content-Type': 'application/json'}
    }) 

    image = await info_image.json()
    console.log('массив изображений: ', image)

    

    for(photo of image){

        const base_to_img = document.createElement('img')
    
        base_to_img.src = `data:image/png;base64,${photo}`
    
        base_to_img.style.width = '50px'
        base_to_img.style.height = '50px'
    
        universe.appendChild(base_to_img)
        console.log('asdasdasdasdasdasd')
    }
    

}


//показывает оценки маршрута
async function get_mark_route(p_id) {

    mark_good.innerHTML = ''
    mark_bad.innerHTML = ''

    let mark_route = await fetch(`http://127.0.0.1:8000/mark/polyline/?p_id=${p_id}`, {
        headers: {'Content-Type': 'application/json'}
    })

    mark_route = await mark_route.json()
    console.log('Оценки маршрута: ', mark_route)

    count_like = mark_route.count_like
    count_dislike = mark_route.count_dislike

    mark_good.innerHTML = count_like
    mark_bad.innerHTML = count_dislike

}



//добавляет оценку к маршруту
async function set_mark_route(p_id, is_like) {
    let set_mark = await fetch(`http://127.0.0.1:8000/mark/polyline/?p_id=${p_id}&is_like=${is_like}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'}
    })

    set_mark = await set_mark.json()
    console.log(set_mark)
    
    get_mark_route(p_id)

}



//удаляет оценку к маршруту
async function delete_mark_route(p_id) {

    let set_mark = await fetch(`http://127.0.0.1:8000/mark/polyline/?p_id=${p_id}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })

    delete_mark = await set_mark.json()
    console.log('УДАЛЯЕМ ОЦЕНКУ: ', delete_mark)
    
    get_mark_route(p_id)

}



//добавление отметки о посещении
async function add_visit_route(p_id) {
    
    let visit = await fetch (`http://127.0.0.1:8000/users/visited/public/polyline/?p_id=${p_id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'}
    })

    visit = await visit.json()
    console.log('visit: ', visit)

}



//удаление отметки о посещении
async function delete_visit_route(p_id) {
    
    let del_visit = await fetch (`http://127.0.0.1:8000/users/visited/public/polyline/?p_id=${p_id}`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })

    del_visit = await del_visit.json()
    console.log('visit: ', del_visit)

}



//показ модального окна для сохранения маршрута
let okno = document.querySelector('#okno')
let button_save_route = document.querySelector('#btn_save_route')
button_save_route.addEventListener('click', () => {
    okno.showModal()
});

let button_cancel = document.querySelector('#button_cancel')
button_cancel.addEventListener('click', () => {
    okno.close()
});

let button_close = document.getElementById('btn_close')
button_close.addEventListener('click', () => {
    okno.close()
});



//сохранения данных о маршруте на сервере
async function set_save_route() {

    console.log('Отправка формы:', {
        p_name: document.querySelector('#p_name').value,
        p_text: document.querySelector('#p_text').value,
        p_arr: arr,
        p_color: document.querySelector('#p_color').value,
        is_public: document.querySelector('#public').checked
    });

    let response = await fetch('http://127.0.0.1:8000/polyline/add/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            p_name: document.querySelector('#p_name').value,
            p_text: document.querySelector('#p_text').value,
            p_arr: arr,
            p_color: document.querySelector('#p_color').value,
            is_public: document.querySelector('#public').checked,
        })
    });

    let data = await response.json();
    console.log(data);

    let route_id  = data.p_id;
    let pub = document.querySelector('#public').checked; 

    for (file of dobav_foto.files){
        let formData = new FormData()
        formData.append('photo', file)
        let response = await fetch(`http://127.0.0.1:8000/polyline/add/photo/?p_id=${route_id}&is_public=${pub}`, {
            method: 'POST',
            body: formData
        })
        response = await response.json()
        console.log(response.detail)
    }

    okno.close()

    myMap.geoObjects.removeAll(polyline);

}

document.getElementById('button_send').onclick = set_save_route;









//получение всей информации о текущем пользователе
async function get_user_info() {
    let data = await fetch('http://127.0.0.1:8000/user/info/', {
        headers: {'Content-Type': 'application/json'}
    })

    let user_info = await data.json()
    console.log('Информация о текущем пользователе: ', user_info)
    return user_info
}

get_user_info()



async function get_user_comment(p_id) {
    //ДОБАВИТЬ ПЕРЕДАЧУ p_id В ЭТУ ФУНКЦИЮ
    let response = await fetch(`http://127.0.0.1:8000/polylines/public/comment/?p_id=${p_id}`, {
        headers: {'Content-Type': 'application/json'}
    })

    if (!response.ok) {
        throw new Error('Ошибка: ' + response.statusText);
    }

    data = await response.json()
    console.log('Комментарии: ', data)


    el = document.getElementById('div_comment')

    el.innerHTML = ''

    
    //ДОБАВИТЬ СЮДА АВАТАРКУ ПОЛЬЗОВАТЕЛЯ ПОСЛЕ +=
    for(let i = 0; i < data.length; i++) {
        el.innerHTML += '<p>' + data[i].login_user + '</p>' + '<p>' + data[i].c_text + '</p>' + '</br>'
        console.log('КОММЕНТАРИИ ПОЛУЧЕНЫ УСПЕШНО ', p_id)
    }
    
}



async function add_user_comment(p_id) {
    let otvet = await fetch('http://127.0.0.1:8000/polylines/public/comment/', { 
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            p_id: p_id, 
            comment: document.querySelector('#input_comment').value
        })
    })

    if (otvet.ok) {
        console.log('КОММЕНТАРИЙ ДОБАВЛЕН УСПЕШНО/номер маршрута: ', p_id)
        await get_user_comment(p_id)
    }
    
}
