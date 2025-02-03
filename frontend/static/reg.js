async function getResponse() {
   
    if (!document.querySelector('#login_reg').value || 
        !document.querySelector('#password_reg').value || 
        !document.querySelector('#name_reg').value ||
        !document.querySelector('#surname_reg').value ) {
        alert('Пожалуйста, введите все данные.');
        return;
    }

    let response = await fetch('http://212.22.82.237:8000/registration', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            login: document.querySelector('#login_reg').value,
            password: document.querySelector('#password_reg').value,
            name: document.querySelector('#name_reg').value,
            surname: document.querySelector('#surname_reg').value
        })
    })

    if (response.ok) {
        const data = await response.json()
        alert('Успешный вход: ', data)
        localStorage.setItem('token', data.token);
        console.log(data)
        window.location.href='glav_str.html'

    } else {
        alert('Неправильный логин или пароль')
        console.log('yyy')
    }

}

document.querySelector('#submit').onclick = getResponse