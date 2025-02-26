let btn_add_polyline = document.getElementById('btn_add_route')
let is_polyline = false
let arr = []
let star = document.querySelector('#info_name')
let space = document.querySelector('#info_opisanie')
const universe = document.getElementById('info_photo_route')
const dobav_foto = document.getElementById('dobav_foto')
const change_dobav_foto = document.getElementById('change_dobav_foto')
let polyline
let info_route = document.querySelector('#info_route')
let myMap
let change_login = document.querySelector('#button_change_login')
let modal_change_login = document.querySelector('#modal_change_login')
let modal_change_login_exit = document.querySelector('#button_change_login_exit')
let accept_change_login = document.querySelector('#accept_change_login')
let button_info_exit = document.getElementById('button_info_exit')
let del_route_dialog = document.querySelector('#del_route_dialog')
let but_del_cancel = document.getElementById('but_del_cancel')
let but_del_route = document.getElementById('but_del_route')
let but_delete_route = document.getElementById('but_delete_route')
let is_public_route
let info_type_route = document.querySelector('#info_type_route')
let but_change_route = document.querySelector('#but_change_route')
let change = document.querySelector('#change')
let change_route_cancel = document.querySelector('#change_route_cancel')
let change_button_cancel = document.querySelector('#change_button_cancel')
let change_route = document.querySelector('#change_route')
let change_button_send = document.querySelector('#change_button_send')
let history_change_route_modal = document.querySelector('#history_change_route_modal')
let but_change_route_history = document.querySelector("#but_change_route_history")
let but_change_route_history_exit = document.querySelector('#but_change_route_history_exit')

let history_star = document.querySelector('#history_info_name')
let history_space = document.querySelector('#history_info_opisanie')
const history_universe = document.getElementById('history_info_photo_route')
let bask = document.querySelector('#back')
let forward = document.querySelector('#forward')
let number_change = document.querySelector('#number_change')
let history = []
let route_view_now = document.querySelector('#route_view_now')
let x = 0


change_route_cancel.style.display = 'none'
change_route.style.display = 'none'



document.addEventListener("DOMContentLoaded", () => {
    ymaps.ready(initNew);
});

async function initNew(){
    
    myNewMap = new ymaps.Map("map2", {
        center: [55.76, 37.64],
        zoom: 16
    });

}

but_change_route_history_exit.addEventListener('click', () => {
    history_change_route_modal.close()
})

change_route.addEventListener('click', () => {
    change.showModal()
})

change_button_cancel.addEventListener('click', () => {
    change.close()
})


change_login.addEventListener('click', () => {
    modal_change_login.showModal()
    console.log('Вы открыли модальное окно с изменением логина')
})

modal_change_login_exit.addEventListener('click', () => {
    modal_change_login.close()
    console.log('Вы закрыли модальное окно с изменением логина')
})

button_info_exit.addEventListener('click', () => {
    info_route.close()
    console.log('Вы закрыли модальное окно с информацией о маршруте')
})


but_del_cancel.addEventListener('click', () => {
    del_route_dialog.close()
})


change_route_cancel.addEventListener('click', () => {

    myMap.geoObjects.removeAll(polyline)

    but_check_route.style.display = 'block'
    btn_add_polyline.style.display = 'block'
    button_save_route.style.display = 'block'
    change_route.style.display = 'none'
    change_route_cancel.style.display = 'none'

})    

accept_change_login.addEventListener('click', async () => {

    let new_login = document.querySelector('#input_change_login').value

    console.log('Новый логин: ', new_login)

    let response = await fetch(`http://127.0.0.1:8000/user/login/?new_login=${new_login}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'}
    })

})



//получение всей информации о текущем пользователе
async function get_user_info() {
    let data = await fetch('http://127.0.0.1:8000/user/info/', {
        headers: {'Content-Type': 'application/json'}
    })

    let user_info = await data.json()
    console.log('Информация о текущем пользователе: ', user_info)

    let el = document.getElementById('name_user')

    el.innerHTML = user_info.login

}

get_user_info()

async function get_user_avatar() {
    let response = await fetch(`http://127.0.0.1:8000/user/avatar`, {
        headers: {'Content-Type': 'application/json'}
    })
    
    let base64 = await response.json()
    
    const container = document.getElementById('avatarka')
    
    const img = document.createElement('img')
    
    img.classList.add("class-avatar-user");
    img.src = `data:image/png;base64,${base64}`
    
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





//работа с основной картой
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
    but_check_route = document.querySelector('#check_route')
    but_check_route.addEventListener('click', async () => {

        if (polyline) {
            myMap.geoObjects.removeAll(polyline)
        }

        let response = await fetch('http://127.0.0.1:8000/polylines/private/', {
            headers: {'Content-Type': 'application/json'}
        })
        
        let route = await response.json()
        console.log('Приватные маршруты: ', route)

        //вывод приватных маршрутов пользователя на карту
        for (let j = 0; j < route.length; ++j){

            polyline = new ymaps.Polyline(route[j].p_arr, {}, {
                strokeColor: route[j].p_color,
                strokeWidth: 4
            })
            myMap.geoObjects.add(polyline)
            polyline.events.add(['click'], () => {
               
                console.log(route[j])

                info_route.showModal()
                
                console.log('Вы открыли модальное окно с информацией о маршруте')

                star.innerHTML = ''
                space.innerHTML = ''
                universe.innerHTML = ''
                info_type_route.innerHTML = ''

                star.innerHTML += route[j].p_name
                space.innerHTML += route[j].p_text
                info_type_route.innerHTML += 'Приватный'

                let p_id_route = route[j].p_id
                is_public_route = false  

                info_image_private(p_id_route)                

                but_del_route.addEventListener('click', () => {
                    del_route_dialog.showModal()
                });

                delete_polyline = new ymaps.Polyline(route[j].p_arr, {}, {
                    strokeColor: route[j].p_color,
                    strokeWidth: 4
                })

                but_delete_route.onclick = () => {
                    delete_route(p_id_route, is_public_route)
                    myMap.geoObjects.remove(delete_polyline)
                }

                //изменение приватного маршрута (удаление всех линий и возможность редактировать конкретный маршрут)
                but_change_route.addEventListener('click', () => {
                    
                    myMap.geoObjects.removeAll(polyline)
                    myMap.geoObjects.add(new_polyline = new ymaps.Polyline(route[j].p_arr, {}, {
                        strokeColor: route[j].p_color,
                        strokeWidth: 4
                    }))

                    info_route.close()

                    new_polyline.editor.startEditing();

                    but_check_route.style.display = 'none'
                    btn_add_polyline.style.display = 'none'
                    button_save_route.style.display = 'none'
                    change_route.style.display = 'block'
                    change_route_cancel.style.display = 'block'

                    console.log('Вы изменяете данный маршрут: ', route[j])

                    route_change = route[j]

                    document.querySelector('#change_p_name').value = ''
                    document.querySelector('#change_p_name').value = route_change.p_name
                    p_name_value = document.querySelector('#change_p_name').value
                    
                    document.querySelector('#change_p_text').value = ''
                    document.querySelector('#change_p_text').value = route_change.p_text
                    p_text_value = document.querySelector('#change_p_text').value
                
                    document.querySelector('#change_p_color').value = ''
                    document.querySelector('#change_p_color').value = route_change.p_color
                    p_color_value = document.querySelector('#change_p_color').value

                    change_button_send.onclick = () => {

                        let p_arr_new_route = []

                        p_arr_new_route = new_polyline.geometry.getCoordinates();
                        myMap.geoObjects.add(new_polyline = new ymaps.Polyline(p_arr_new_route, {}, {
                            strokeColor: "#00000088",
                            strokeWidth: 4
                        }))

                        console.log('Новые корды ', p_arr_new_route)

                        func_change_route(p_id_route, is_public_route, p_arr_new_route, route_change, p_name_value, p_text_value, p_color_value)

                        change.close()

                        myMap.geoObjects.removeAll(polyline)

                        but_check_route.style.display = 'block'
                        btn_add_polyline.style.display = 'block'
                        button_save_route.style.display = 'block'
                        change_route.style.display = 'none'
                        change_route_cancel.style.display = 'none'

                    }

                })

                

                //история изменения приватного маршрута
                but_change_route_history.onclick = async () =>  {

                    history_change_route_modal.showModal()
                    
                    let history_route = route[j]

                    await get_history_change_route(p_id_route, is_public_route, history_route)
                    
                }
           
            })

        }

        //вывод публичных маршрутов пользователя на карту
        let response_public = await fetch('http://127.0.0.1:8000/polylines/public/', {
            headers: {'Content-Type': 'application/json'}
        })
        
        let route_public = await response_public.json()
        console.log('Публичные маршруты: ', route_public)

        //проходимся по каждому маршруту
        for (let g = 0; g < route_public.length; ++g){

            polyline = new ymaps.Polyline(route_public[g].p_arr, {}, {
                strokeColor: route_public[g].p_color,
                strokeWidth: 4
            })

            myMap.geoObjects.add(polyline)
            polyline.events.add(['click'], () => {
               
                console.log(route_public[g])

                console.log(polyline)

                info_route.showModal()
                
                console.log('Вы открыли модальное окно с информацией о маршруте')

                star.innerHTML = ''
                space.innerHTML = ''
                universe.innerHTML = ''
                info_type_route.innerHTML = ''
                
                star.innerHTML += route_public[g].p_name
                space.innerHTML += route_public[g].p_text
                info_type_route.innerHTML += 'Публичный'

                let p_id_route = route_public[g].p_id
                let is_public_route = true

                info_image_public(p_id_route)

                but_del_route.addEventListener('click', () => {
                    del_route_dialog.showModal()
                });

                delete_polyline = new ymaps.Polyline(route_public[g].p_arr, {}, {
                    strokeColor: route_public[g].p_color,
                    strokeWidth: 4
                })

                but_delete_route.onclick = () => {
                    delete_route(p_id_route, is_public_route)
                    myMap.geoObjects.remove(delete_polyline)
                }


                //изменение публичного маршрута (удаление всех линий и возможность редактировать конкретный маршрут)
                but_change_route.addEventListener('click', () => {
                    
                    myMap.geoObjects.removeAll(polyline)
                    myMap.geoObjects.add(new_polyline = new ymaps.Polyline(route_public[g].p_arr, {}, {
                        strokeColor: route_public[g].p_color,
                        strokeWidth: 4
                    }))

                    info_route.close()

                    new_polyline.editor.startEditing();

                    but_check_route.style.display = 'none'
                    btn_add_polyline.style.display = 'none'
                    button_save_route.style.display = 'none'
                    change_route.style.display = 'block'
                    change_route_cancel.style.display = 'block'

                    console.log('Вы изменяете данный маршрут: ', route_public[g])
                    
                    route_change = route_public[g]

                    document.querySelector('#change_p_name').value = ''
                    document.querySelector('#change_p_name').value = route_change.p_name
                    p_name_value = document.querySelector('#change_p_name').value
                    
                    document.querySelector('#change_p_text').value = ''
                    document.querySelector('#change_p_text').value = route_change.p_text
                    p_text_value = document.querySelector('#change_p_text').value
                
                    document.querySelector('#change_p_color').value = ''
                    document.querySelector('#change_p_color').value = route_change.p_color
                    p_color_value = document.querySelector('#change_p_color').value

                    change_button_send.onclick = () => {

                        let p_arr_new_route = []

                        p_arr_new_route = new_polyline.geometry.getCoordinates();
                        myMap.geoObjects.add(new_polyline = new ymaps.Polyline(p_arr_new_route, {}, {
                            strokeColor: "#00000088",
                            strokeWidth: 4
                        }))

                        console.log('Новые корды ', p_arr_new_route)
                        
                        func_change_route(p_id_route, is_public_route, p_arr_new_route, route_change, p_name_value, p_text_value, p_color_value)

                        change.close()

                        myMap.geoObjects.removeAll(polyline)

                        but_check_route.style.display = 'block'
                        btn_add_polyline.style.display = 'block'
                        button_save_route.style.display = 'block'
                        change_route.style.display = 'none'
                        change_route_cancel.style.display = 'none'

                    }

                })

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
async function info_image_private(p_id_route) { 
    
    try {

        

    } catch (error) {
        console.error('Ошибка при получении изображений:', error);
    }

}


//получение фоток публичного маршрута
async function info_image_public(p_id_route) { 
    
    try {

        let info_image = await fetch(`http://127.0.0.1:8000/polylines/public/photos/?p_id=${p_id_route}`, {
            headers: {'Content-Type': 'application/json'}
        })
    
        image = await info_image.json()
        console.log('массив изображений: ', image)
    
        for(photo of image){
    
            const base_to_img = document.createElement('img')
        
            base_to_img.src = `data:image/png;base64,${photo}`
        
            universe.appendChild(base_to_img) 
            
        }

    } catch (error) {
        console.error('Ошибка при получении изображений:', error);
    }

}


//удаление маршрута пользователя
async function delete_route(p_id_route, is_public_route) {
    
    let del_route = await fetch(`http://127.0.0.1:8000/polyline/?p_id=${p_id_route}&is_public=${is_public_route}`, {
        method: 'DELETE',
        headers:{'Content-Type': 'application/json'}
    })

    del_route = await del_route.json()
    console.log(del_route)

    info_route.close()

    del_route_dialog.close()

}



//позволяет создавать ломанную линию (маршрут) при нажатии на кнопку
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


    try {
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
    
        document.querySelector('#p_name').value = ''
        document.querySelector('#p_text').value = ''
        document.querySelector('#p_color').value = ''
        document.querySelector('#public').checked = ''

        myMap.geoObjects.removeAll(polyline);
    } catch (error) {
        console.error('Ошибка при получении изображений:', error);
    }
    
}

document.getElementById('button_send').onclick = set_save_route;




//превращение фоток в массив base64
function toBase64(files, onSuccess) {
    let promises = [];

    for (let file of files) {
        let reader = new FileReader();
        
        let promise = new Promise((resolve, reject) => {
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Ошибка чтения файла"));
            reader.readAsDataURL(file);
        });

        promises.push(promise);
    }

    Promise.all(promises).then(onSuccess).catch(error => console.error(error));
}


//изменения маршрута
async function func_change_route(p_id_route, is_public_route, p_arr_new_route, route_change, p_name_value, p_text_value, p_color_value) {

    if (document.querySelector('#change_p_name').value === p_name_value) {

        document.querySelector('#change_p_name').value = null

    }

    if (document.querySelector('#change_p_text').value === p_text_value) {

        document.querySelector('#change_p_text').value = null
        
    }

    if (document.querySelector('#change_p_color').value === p_color_value) {

        document.querySelector('#change_p_color').value = null
        
    }

    const fileInput = document.querySelector('#change-dobav_foto');
    const files = fileInput.files;
    
    let formData = new FormData()
    console.log('files_change_polyline', files)
    for (file of files) {
        console.log(file)
        formData.append('photos_arr', file)
    } 

    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }    

    let answer = await fetch (`http://127.0.0.1:8000/polyline/change/?is_public=${is_public_route}&p_id=${p_id_route}&p_name=${document.querySelector('#change_p_name').value}&p_text=${document.querySelector('#change_p_text').value}&p_arr=${JSON.stringify(p_arr_new_route)}&p_color=${document.querySelector('#change_p_color').value}`, {
        method: 'PUT',
        body: formData
    })

    answer = await answer.json()
    console.log('answer: ', answer)

}


async function get_history_change_route(p_id_route, is_public_route, history_route) {
    
    let x = 0;

    let response = await fetch(`http://127.0.0.1:8000/polyline/history/?p_id=${p_id_route}&is_public=${is_public_route}`, {
        headers: {'Content-Type': 'application/json'}
    });

    let history = await response.json();
    console.log('История изменения маршрута: ', history);

    let reverse_history = history.slice().reverse();
    console.log('Реверс массив: ', reverse_history);

    const fullHistory = [history_route, ...reverse_history];


    history_universe.innerHTML = ''; // Очистка предыдущих изображений

        try {

            let history_info_image = await fetch(`http://127.0.0.1:8000/polylines/private/photos/?p_id=${p_id_route}`, {
                headers: {'Content-Type': 'application/json'}
            })
        
            image = await history_info_image.json()
            console.log('массив изображений: ', image)
        
            for(photo of image){
        
                const history_first_route_image = document.createElement('img')
            
                history_first_route_image.src = `data:image/png;base64,${photo}`
            

                history_universe.appendChild(history_first_route_image) 
                
            }
    
        } catch {
            
            let history_info_image = await fetch(`http://127.0.0.1:8000/polylines/private/photos/?p_id=${p_id_route}`, {
                headers: {'Content-Type': 'application/json'}
            })
        
            image = await history_info_image.json()
            console.log('массив SDF изображений: ', image)
        
            for(photo of image) {
        
                const history_first_route_image = document.createElement('img')
            
                history_first_route_image.src = `data:image/png;base64,${photo}`
            
            
                history_universe.appendChild(history_first_route_image) 
                
            }

        }

    //////////////////////////////////////////////////////////////////////////////
    async function updateDisplay() {

        const history_image_route = document.createElement('img');

        route_view_now.innerHTML = 'Так маршрут выглядит сейчас';
        history_star.innerHTML = fullHistory[x].p_name;
        history_space.innerHTML = fullHistory[x].p_text;
        number_change.innerHTML = x + 1;
        
        myNewMap.geoObjects.removeAll();
        let history_polyline = new ymaps.Polyline(fullHistory[x].p_arr, {}, {
            strokeColor: fullHistory[x].p_color,
            strokeWidth: 4
        });

        myNewMap.geoObjects.add(history_polyline);
        myNewMap.setCenter(fullHistory[x].p_arr[0]);

        










        // Обновление изображений
        
        let history_image = fullHistory[x].photos_arr; // Обновляем массив фотографий
        history_universe.innerHTML = ''
        // Проверяем, есть ли фотографии для текущего маршрута
        if (history_image && Array.isArray(history_image) && history_image.length > 0) {
            for (let photo of history_image) {
                const clonedImage = history_image_route.cloneNode(); // Клонируем элемент для каждой фотографии
                clonedImage.src = `data:image/png;base64,${photo}`;
                clonedImage.classList.add("history-image-route");
                history_universe.appendChild(clonedImage);
            }
        } else {
            // Если фотографий нет, можно добавить сообщение или скрыть контейнер
            history_universe.innerHTML = 'Фотографии отсутствуют'; // Сообщение об отсутствии фотографий
        }
    }

    //////////////////////////////////////////////////////////////////////////////

    // Инициализация отображения
    updateDisplay();

    // Переход на страницу назад изменения маршрута
    back.onclick = () => {
        if (x > 0) {
            x--; // Уменьшаем индекс
            updateDisplay();
        } else {
            console.log('Вы находитесь на первом элементе истории.');
        }
    };

    // Переход на страницу вперед изменения маршрута
    forward.onclick = () => {
        if (x < fullHistory.length - 1) {
            x++; // Увеличиваем индекс
            updateDisplay();
        } else {
            console.log('Вы находитесь на последнем элементе истории.');
        }
    };
}


//ПЫТАЮСЬ СДЕЛАТЬ ФОТКИ В ИСТОРИИ ИЗМЕНЕНИЯ МАРШРУТА

//ПЫТАЮСЬ СДЕЛАТЬ ФОТКИ В ИСТОРИИ ИЗМЕНЕНИЯ МАРШРУТА

//ПЫТАЮСЬ СДЕЛАТЬ ФОТКИ В ИСТОРИИ ИЗМЕНЕНИЯ МАРШРУТА

//ПЫТАЮСЬ СДЕЛАТЬ ФОТКИ В ИСТОРИИ ИЗМЕНЕНИЯ МАРШРУТА

//ПЫТАЮСЬ СДЕЛАТЬ ФОТКИ В ИСТОРИИ ИЗМЕНЕНИЯ МАРШРУТА

//ПЫТАЮСЬ СДЕЛАТЬ ФОТКИ В ИСТОРИИ ИЗМЕНЕНИЯ МАРШРУТА

//ПЫТАЮСЬ СДЕЛАТЬ ФОТКИ В ИСТОРИИ ИЗМЕНЕНИЯ МАРШРУТА










//НАЧАЛ ДЕЛАТЬ ИСТОРИЮ ИЗМЕНЕНИЯ МАРШРУТА (ДОБАВИЛ КНОПКИ И МОДАЛЬНОЕ ОКНО)

//НАЧАЛ ДЕЛАТЬ ИСТОРИЮ ИЗМЕНЕНИЯ МАРШРУТА (ДОБАВИЛ КНОПКИ И МОДАЛЬНОЕ ОКНО)

//НАЧАЛ ДЕЛАТЬ ИСТОРИЮ ИЗМЕНЕНИЯ МАРШРУТА (ДОБАВИЛ КНОПКИ И МОДАЛЬНОЕ ОКНО)

//НАЧАЛ ДЕЛАТЬ ИСТОРИЮ ИЗМЕНЕНИЯ МАРШРУТА (ДОБАВИЛ КНОПКИ И МОДАЛЬНОЕ ОКНО)

//НАЧАЛ ДЕЛАТЬ ИСТОРИЮ ИЗМЕНЕНИЯ МАРШРУТА (ДОБАВИЛ КНОПКИ И МОДАЛЬНОЕ ОКНО)

//НАЧАЛ ДЕЛАТЬ ИСТОРИЮ ИЗМЕНЕНИЯ МАРШРУТА (ДОБАВИЛ КНОПКИ И МОДАЛЬНОЕ ОКНО)

//НАЧАЛ ДЕЛАТЬ ИСТОРИЮ ИЗМЕНЕНИЯ МАРШРУТА (ДОБАВИЛ КНОПКИ И МОДАЛЬНОЕ ОКНО)
