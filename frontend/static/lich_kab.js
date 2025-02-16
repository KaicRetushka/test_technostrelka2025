const btn_add_polyline = document.getElementById('btn_add_route')
let is_polyline = false
let arr = []
let star = document.querySelector('#info_name')
let space = document.querySelector('#info_opisanie')
const universe = document.getElementById('info_photo_route')
let polyline
let info_route = document.querySelector('#info_route')
let myMap



//получение всей информации о текущем пользователе
async function get_user_info() {
    let data = await fetch('http://127.0.0.1:8000/user/info/', {
        headers: {'Content-Type': 'application/json'}
    })

    let user_info = await data.json()
    console.log(user_info)

    let el = document.getElementById('name_user')

    el.innerHTML = user_info.name + ' ' + user_info.surname

}

get_user_info()

async function get_user_avatar() {
    let response = await fetch(`http://127.0.0.1:8000/user/avatar`, {
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

get_user_avatar()

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

        const izobraj = document.getElementById('avatarka');
        const avatarochka = izobraj.querySelector('img');
        if (avatarochka) {
            izobraj.removeChild(avatarochka);
        }


        get_user_avatar()

    } catch (error) {
        console.error('Ошибка при получении изображения:', error)
    }
}

document.querySelector('#button_avatarka').onclick = set_user_avatar

let but_back_glav_str = document.querySelector('#back_glav_str')
but_back_glav_str.addEventListener('click', () => {
    window.location.href='glav_str.html'
});


ymaps.ready(init);

async function init(){
    
    //создаем карту
    myMap = new ymaps.Map("map", {
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
    

    //действия при нажатии на линию маршрута
    but_check_route = document.getElementById('check_route')
    but_check_route.addEventListener('click', async () => {

        if (polyline) {
            myMap.geoObjects.removeAll(polyline);
        }

        let response = await fetch('http://127.0.0.1:8000/polylines/private/', {
            headers: {'Content-Type': 'application/json'}
        })
        
        let route = await response.json()
        console.log('Маршруты: ', route)
        
        //проходимся по каждому маршруту
        for (let j = 0; j < route.length; ++j){
            polyline = new ymaps.Polyline(route[j].p_arr, {}, {
                strokeColor: route[j].p_color,
                strokeWidth: 4
            })     
            myMap.geoObjects.add(polyline)
            polyline.events.add(['click'], () => {
               
                console.log(route[j].p_id)

                info_route.showModal()
                
                star.innerHTML = ''
                space.innerHTML = ''
                universe.innerHTML = ''
                
                star.innerHTML += route[j].p_name
                space.innerHTML += route[j].p_text
                let p_id_route = route[j].p_id
                
                console.log('aaaaa')
                
                info_image(p_id_route)
                
                console.log('fdsgd')
                
            })
        }
        
    })
    

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


//получение фоток приватного маршрута
async function info_image(p_id_route) { 
    
    try {

        let info_image = await fetch(`http://127.0.0.1:8000/polylines/private/photos/?p_id=${p_id_route}`, {
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
            
        }

    } catch (error) {
        console.error('Ошибка при получении изображений:', error);
    }

}


//позволяет создавать ломанную линию (маршрут) при нажатии на кнопку
btn_add_polyline.addEventListener('click', () => {
    if (polyline) {
        myMap.geoObjects.removeAll(polyline);
    }
    console.log('Было нажатие')
    is_polyline = true
})


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

}

document.getElementById('button_send').onclick = set_save_route;