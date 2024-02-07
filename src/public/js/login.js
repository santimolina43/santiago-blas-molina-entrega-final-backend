const loginForm = document.getElementById('loginForm');
loginForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita la acción predeterminada de enviar el formulario
    // Obtengo los datos del formulario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginUser = {
        email: email,
        password: password
    }
    const loginUserJSON = JSON.stringify(loginUser)
    // Realizo una solicitud AJAX (fetch) para enviar los datos al servidor
    try {
        const response = await fetch('/api/user/login', {
            method: 'POST',
            body: loginUserJSON,
            headers: {
                'Content-Type': 'application/json' // Indica que estás enviando JSON
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'error') {
                    throw new Error(data.error);
                } else {
                    window.location.href = "/";
                }
            })
    }
    catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Email o contraseña incorrectas'
          })
    };
});


const register = (req, res) => {
    res.redirect('/login')
}
