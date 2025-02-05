const btn_add_polyline = document.getElementById('btn_add_polyline')
console.log(btn_add_polyline)
let is_polyline = false

ymaps.ready(init);
function init(){
    let myMap = new ymaps.Map("map", {
    center: [55.76, 37.64],
    zoom: 16
    });
      

    let myPolyline = new ymaps.Polyline([]);
    myMap.geoObjects.add(myPolyline);
    let arr = []
    myMap.events.add('click', (event) => {
    if (is_polyline){
        let eCoords = event.get('coords');
        arr.push(eCoords)
        myPolyline.geometry.setCoordinates(arr)
    }
    });
    myMap.events.add('contextmenu', (event) => {
    myMap.balloon.open(event.get('coords'), 'меню')
    });
}

btn_add_polyline.addEventListener('click', () => {
  console.log('click')
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