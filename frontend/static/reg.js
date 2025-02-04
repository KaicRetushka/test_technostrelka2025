async function getResponse() {
   
    if (!document.querySelector('#login_reg').value || 
        !document.querySelector('#password_reg').value || 
        !document.querySelector('#name_reg').value ||
        !document.querySelector('#surname_reg').value ) {
        alert('Пожалуйста, введите все данные.');
        return;
    }

    let response = await fetch('http://127.0.0.1:8000/registration', {
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
        console.log(data)
        window.location.href='glav_str.html'

    } else {
        alert('Такой логин уже занят')
        console.log('yyy')
    }

}

document.querySelector('#submit').onclick = getResponse