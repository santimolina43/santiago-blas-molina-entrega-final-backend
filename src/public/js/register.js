
const registerForm = document.getElementById('registerForm');
registerForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita la acción predeterminada de enviar el formulario
    // Obtengo los datos del formulario
    const formData = new FormData(registerForm);
    const first_name = document.getElementById('first_name').value; 
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    // Verifico que las contraseñas sean iguales
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Contraseñas distintas',
            showConfirmButton: true,
                // footer: '<a href="">Why do I have this issue?</a>'
            }).then((result) => {
                if (result.isConfirmed) {
                  // Redirige a /login cuando se hace clic en "OK"
                  window.location.href = "/login";
                }
              });
        throw new Error('Contraseñas diferentes');
    }
    // Realizo una solicitud AJAX (fetch) para enviar los datos al servidor
    try {
        const response = await fetch('/api/user/register', {
            method: 'POST',
            body: formData
        })
        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: `¡Bienvenido ${first_name}!`,
                text: 'Te has registrado exitosamente',
                showConfirmButton: true,
                // footer: '<a href="">Why do I have this issue?</a>'
            }).then((result) => {
                if (result.isConfirmed) {
                  // Redirige a /login cuando se hace clic en "OK"
                  window.location.href = "/user/login";
                }
              });
        } else {
            throw new Error('No se pudo completar la solicitud: '+response.statusText);
        }
    }
    catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error
        })
    };
});
