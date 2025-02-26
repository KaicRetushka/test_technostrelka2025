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

    let polylines = {}

    //действия при нажатии на линию маршрута
    but_check_route = document.querySelector('#check_route')
    but_check_route.addEventListener('click', async () => {

       myMap.geoObjects.removeAll()

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

            polylines[route[j].p_id] = polyline;

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
                })

                but_delete_route.onclick = () => {
                    delete_route(p_id_route, is_public_route)
                    myMap.geoObjects.remove(polyline)
                    delete polylines[route[j].p_id]
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

            polylines[route_public[g].p_id] = polyline

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

                but_delete_route.onclick = () => {
                    delete_route(p_id_route, is_public_route)
                    myMap.geoObjects.remove(polyline)
                    delete polylines[route_public[g].p_id]
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