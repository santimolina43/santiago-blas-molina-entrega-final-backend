
const resetPasswordFinalStepForm = document.getElementById('resetPasswordFinalStepForm');
resetPasswordFinalStepForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita la acción predeterminada de enviar el formulario
    // Obtengo los datos del formulario
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    // Verifico que las contraseñas sean iguales
    if (password !== confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Contraseñas distintas',
            showConfirmButton: true,
            })
        throw new Error('Contraseñas diferentes');
    }
    const resetPasswordUser = {
        email: email,
        password: password
    }
    const resetPasswordUserSON = JSON.stringify(resetPasswordUser)
    // Realizo una solicitud AJAX (fetch) para enviar los datos al servidor
    try {
        const response = await fetch('/api/user/resetPasswordFinalStep', {
            method: 'POST',
            body: resetPasswordUserSON,
            headers: {
                'Content-Type': 'application/json' // Indica que estás enviando JSON
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'error') {
                    throw new Error(data.payload);
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Contraseña modificada exitosamente!',
                        text: 'Ya podes iniciar sesion con tu nueva contraseña',
                        showConfirmButton: true
                    }).then((result) => {
                        if (result.isConfirmed) {
                          // Redirige a /login cuando se hace clic en "OK"
                          window.location.href = "/";
                        }
                      });
                }
            })
    }
    catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error
          })
    };
});
