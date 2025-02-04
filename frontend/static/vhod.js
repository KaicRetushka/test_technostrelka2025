async function setResponse() {

    const log = document.querySelector('#login_vhod').value
    const pass = document.querySelector('#password_vhod').value

    if (!log || !pass) {
        alert('Пожалуйста, введите логин и пароль.');
        return;
    }

    let response = await fetch('http://127.0.0.1:8000/enter', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            login: log,
            password: pass
        })
    })

    if (response.ok) {
        const data = await response.json()
        console.log('ttt')
        console.log(data)
        window.location.href='glav_str.html'
    } else {
        alert('Неправильный логин или пароль')
        console.log('yyy')
    }

}

document.querySelector('#button_vhod').onclick = setResponse
