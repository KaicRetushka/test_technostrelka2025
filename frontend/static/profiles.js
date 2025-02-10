async function get_user_login() {
    const el = document.getElementById('login1_all')
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

            button.id = `but1_login${i}`;
            button.innerText = logs[i];

            button.onclick = () => go_profiles(logs[i]); //передаем логин в функцию

            el.appendChild(button);
            el.appendChild(document.createElement('br')); //добавляем перенос строки
        }

    } else {
        console.error('Ошибка при загрузке данных:', response.statusText);
    }

    //добавляем в массив каждый логин
    let arr_but_login = document.querySelector('#but1_login')
    console.log('Массив логинов: ', arr_but_login)

    // получение всех публичных маршрутов каждого пользователя
    for (let arl of arr_but_login) {
        
        console.log(arl)


        let karta = document.getElementById('map1')
        karta.remove()
        let newDiv = document.createElement('div');
        newDiv.setAttribute('id', 'new_map');
        let myMap = new ymaps.Map("new_map", {
            center: [55.76, 37.64],
            zoom: 16
        });
        
        let myPolyline = new ymaps.Polyline([routeData.p_arr], {}, {
            strokeColor: "#00000088",
            strokeWidth: 4,
        });
        myMap.geoObjects.add(myPolyline);
          
        
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