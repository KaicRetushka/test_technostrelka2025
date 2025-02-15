const btn_add_polyline = document.getElementById('btn_add_route')
const dobav_foto = document.getElementById('dobav_foto')
console.log(btn_add_polyline)
let is_polyline = false
let arr = []
let mass = []
let polyline
let info_route = document.querySelector('#info_route')


//создание карты и возможность добавлять маршрут
ymaps.ready(init);

async function init(){
    
    let myMap = new ymaps.Map("map", {
        center: [55.76, 37.64],
        zoom: 16
    });
    
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

    const el = document.getElementById('login_all')
    let data = await fetch('http://127.0.0.1:8000/login/all/', {
        headers: {'Content-Type': 'application/json'}
    });

    let logs = await data.json()


    

    for (let i = 0; i < logs.length; i++) {
        let login_for_route = logs[i]
        but_route = document.getElementById(`but_login${i}`) 
        but_route.addEventListener('click', async () => {


            if (polyline) {
                myMap.geoObjects.removeAll(polyline);
            }


            let response = await fetch(`http://127.0.0.1:8000/polylines/public/?login=${login_for_route}`, {
                headers: {'Content-Type': 'application/json'}
            })

            let route = await response.json()
            console.log('Маршруты: ', route)
            
            
            for (let j = 0; j < route.length; ++j){
                polyline = new ymaps.Polyline(route[j].p_arr, {}, {
                    strokeColor: route[j].p_color,
                    strokeWidth: 4
                })     
                myMap.geoObjects.add(polyline)

                polyline.events.add(['click'], () => {
                    
                    info_route.showModal()

                    let open_comment = document.querySelector('#comments')
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
                    
                })

            }
        
        })
    }

    myMap.geoObjects.add(myPolyline)
    myMap.events.add('click', (event) => {
    if (is_polyline){
        let eCoords = event.get('coords');
        arr.push(eCoords)
        myPolyline.geometry.setCoordinates(arr)
    }
    });
    myPolyline.editor.startEditing();

}







//позволяет создавать ломанную линию (маршрут) при нажатии на кнопку
btn_add_polyline.addEventListener('click', () => {
    console.log('Было нажатие')
    is_polyline = true
})


//выход из аккаунта
async function exit() {
    let response = await fetch('http://127.0.0.1:8000/exit', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })

    window.location.href='glav_str.html'  
}

document.querySelector('#button_glav_exit').onclick = exit

//при нажатии на свое имя с фамилией перекидывает в личный кабинет
function go_lich_kab(){
    window.location.href = 'http://127.0.0.1:8000/lich_kab.html'
}

document.querySelector('#fullname').onclick = go_lich_kab


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

let button_close = document.querySelector('#btnclose')
button_cancel.addEventListener('click', () => {
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

}

document.getElementById('button_send').onclick = set_save_route;





//получение всех логинов => ПОПЫТКА получения всех публичных маршрутов + получение аватарок всех пользователей
async function get_user_login() {
    const el = document.getElementById('login_all')
    let data = await fetch('http://127.0.0.1:8000/login/all/', {
        headers: {'Content-Type': 'application/json'}
    });
    
    let logs = await data.json()
    console.log('МАССИВ ЛОГИНОВ: ',logs)


    //если запрос возвращает ok, то проходимся по каждому пользователю и создаем ему кнопку с его логином и уникальным id
    if (data.ok) { 
        
        //очищаем элемент перед добавлением новых кнопок
        el.innerHTML = '';

        for (let i = 0; i < logs.length; i++) {
            const button = document.createElement('button');
            button.id = `but_login${i}`;
            button.innerText = logs[i];

            el.appendChild(button);
            el.appendChild(document.createElement('br')); //добавляем перенос строки
        }

    } else {
        console.error('Ошибка при загрузке данных:', data.statusText);
    }



    //добавляем в массив каждый логин
    // let arr_but_login = document.querySelector('#but_login')
    // console.log('Массив логинов: ', arr_but_login)




    //получение всех публичных маршрутов каждого пользователя
    // for (let arl of arr_but_login) {
        
    //     console.log(arl)


    //     let karta = document.getElementById('map')
    //     karta.remove()
    //     let newDiv = document.createElement('div');
    //     newDiv.setAttribute('id', 'new_map');
    //     let myMap = new ymaps.Map("new_map", {
    //         center: [55.76, 37.64],
    //         zoom: 16
    //     });
        
    //     let myPolyline = new ymaps.Polyline([routeData.p_arr], {}, {
    //         strokeColor: "#00000088",
    //         strokeWidth: 4,
    //     });
    //     myMap.geoObjects.add(myPolyline);
          
        
    // }

    //получение аватарки каждого пользователя из base64
    for (log of logs) {
        
        let response = await fetch(`http://127.0.0.1:8000/user/avatar?login=${log}`, {
            headers: {'Content-Type': 'application/json'}
        })
        
        let base64 = await response.json()
        const container = document.getElementById('avatarka')

        const img = document.createElement('img')
    
        img.src = `data:image/png;base64,${base64}`
    
        img.style.width = '100px'
        img.style.height = '100px'
    
        container.appendChild(img)

    }

}

get_user_login()


//получение всей информации о текущем пользователе
async function get_user_info() {
    let data = await fetch('http://127.0.0.1:8000/user/info/', {
        headers: {'Content-Type': 'application/json'}
    })

    let user_info = await data.json()
    console.log('Информация о текущем пользователе: ', user_info)
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

    console.log('КОММЕНТАРИЙ ДОБАВЛЕН УСПЕШНО: ', p_id)
    get_user_comment(p_id)

}
