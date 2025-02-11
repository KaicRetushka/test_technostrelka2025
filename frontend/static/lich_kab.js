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