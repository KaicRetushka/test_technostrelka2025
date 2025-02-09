const btn_add_polyline = document.getElementById('btn_add_route')
const dobav_foto = document.getElementById('dobav_foto')
console.log(btn_add_polyline)
let is_polyline = false
let arr = []


//создание карты и возможность добавлять маршрут
ymaps.ready(init);

function init(){
    
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
    myMap.geoObjects.add(myPolyline);
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

}

document.getElementById('button_send').onclick = set_save_route;





//получение всех логинов => ПОПЫТКА получения всех публичных маршрутов + ПОПЫТКА получения аватарок всех пользователей 
async function get_user_login() {
    const el = document.getElementById('login_all')
    let data = await fetch('http://127.0.0.1:8000/login/all/', {
        headers: {'Content-Type': 'application/json'}
    });
    
    let logs = await data.json()
    console.log(logs)

    if (data.ok) {
        for (let element of logs){
            el.innerHTML += `<button class='but_login'>${element}</button><br>`
            
        }
    }

    let arr_but_login = document.querySelectorAll('.but_login')
    console.log('Массив логинов: ', arr_but_login)

    //получение всех публичных маршрутов каждого пользователя
    for (let arl of arr_but_login) {
        
        console.log(arl)


        // let karta = document.getElementById('map')
        // karta.remove()
        // let newDiv = document.createElement('div');
        // newDiv.setAttribute('id', 'new_map');
        // let myMap = new ymaps.Map("new_map", {
        //     center: [55.76, 37.64],
        //     zoom: 16
        // });
        
        // let myPolyline = new ymaps.Polyline([routeData.p_arr], {}, {
        //     strokeColor: "#00000088",
        //     strokeWidth: 4,
        // });
        // myMap.geoObjects.add(myPolyline);
          
        
    }

    //получение аватарки каждого пользователя из base64
    for (log of logs) {
        
        let response = await fetch(`http://127.0.0.1:8000/user/avatar?login=${log}`, {
            headers: {'Content-Type': 'application/json'}
        })
        
        let base64 = await response.json() 
        
        const reBase = window.atob(decodeURIComponent(base64))
        console.log(reBase)


        const container = document.getElementById('avatarka')

        const img = document.createElement('img')
    
        img.src = reBase
    
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
    console.log(user_info)
}

get_user_info()



//изменение аватарки пользователя
async function set_user_avatar() {
    try {
        
        const fileInput = document.getElementById('smena_avatarki')
        const file = fileInput.files[0]

        if (!file) {
            alert('Пожалуйста, выберите изображение для смены аватарки')
            return
        }

        const formData = new FormData()
        formData.append('avatar', file)

        let response = await fetch('http://127.0.0.1:8000/user/avatar/', {
            method: 'PUT',
            body: formData
        })
            

        if (!response.ok) {
            throw new Error('Что-то пошло не так')
        }

        alert('Аватарка успешно изменена')

        document.getElementById('avatarka').innerHTML = ''

        get_user_login()

    } catch (error) {
        console.error('Ошибка при получении изображения:', error)
    }
}

document.querySelector('#button_avatarka').onclick = set_user_avatar


