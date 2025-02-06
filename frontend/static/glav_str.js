const btn_add_polyline = document.getElementById('btn_add_route')
console.log(btn_add_polyline)
let is_polyline = false



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
    let arr = []
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
