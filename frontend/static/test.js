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

                let p_id_route = route[j].p_id
                is_public_route = false  

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
               
                let p_id_route = route_public[g].p_id
                let is_public_route = true

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