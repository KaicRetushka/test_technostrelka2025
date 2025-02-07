const btn_add_polyline = document.getElementById('btn_add_route')
const dobav_foto = document.getElementById('dobav_foto')
console.log(btn_add_polyline)
let is_polyline = false
let arr = []

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
                    // myMap.geoObjects.remove(myPolyline);
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

btn_add_polyline.addEventListener('click', () => {
  console.log('Было нажатие')
  is_polyline = true
})

async function exit() {
    let response = await fetch('http://127.0.0.1:8000/exit', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })

    window.location.href='glav_str.html'  
}

document.querySelector('#button_glav_exit').onclick = exit

function go_lich_kab(){
    window.location.href = 'http://127.0.0.1:8000/lich_kab.html'
}

document.querySelector('#fullname').onclick = go_lich_kab

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


async function set_save_route() {
    console.log('Data being sent:', {
        p_name: document.querySelector('#p_name').value,
        p_text: document.querySelector('#p_text').value,
        p_arr: arr,
        p_color: document.querySelector('#p_color').value,
        is_public: document.querySelector('#public').value,
    });

    const response = await fetch('http://127.0.0.1:8000/polyline/add/', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            p_name: document.querySelector('#p_name').value,
            p_text: document.querySelector('#p_text').value,
            p_arr: arr,
            p_color: document.querySelector('#p_color').value,
            is_public: true,
        })
    });

    const data = await response.json();
    console.log(data);

    let route_id = data.p_id;
    let pub = true;

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


async function get_user_info() {
    const el = document.getElementById('login_all')
    let data = await fetch('http://127.0.0.1:8000/login/all/', {
        headers: {'Content-Type': 'application/json'}
    });
    
    detail = await data.json()
    console.log(detail)

    if (data.ok) {
        for (element of detail){
            el.innerHTML += `<p class='but_login'>${element}</p>`
        }
    }
    arr_but_login = document.querySelectorAll('.but_login')
    console.log('Массив ', arr_but_login)

    for (arl of arr_but_login) {
        // arl.onclick = () => get_public_route(arl.innerHTML)
        arl.addEventListener('click', async () => {
            console.log(this.arl.innerHTML)
            let data = await fetch(`http://127.0.0.1:8000/polylines/public/?login=${this.arl.innerHTML}`, {
                headers: {'Content-Type': 'application/json'}
            })
            data = await data.json()
            console.log(data)
        })
    }
}

get_user_info()

async function get_public_route(login) {
    console.log
    let data = await fetch(`http://127.0.0.1:8000/polylines/public/?login=${login}`, {
        headers: {'Content-Type': 'application/json'}
    })

    data = await data.json()
    console.log(data)
}