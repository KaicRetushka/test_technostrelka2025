async function exit() {
    
    let response = await fetch('http://127.0.0.1:8000/exit', {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'}
    })

    window.location.href='glav_str.html'
    
}

document.querySelector('#button_glav_exit').onclick = exit
