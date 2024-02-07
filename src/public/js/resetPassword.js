
const resetPasswordForm = document.getElementById('resetPasswordForm');
resetPasswordForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita la acción predeterminada de enviar el formulario
    // Obtengo los datos del formulario
    const email = document.getElementById('email').value;
    const resetPasswordUser = {
        email: email
    }
    const resetPasswordUserSON = JSON.stringify(resetPasswordUser)
    // Realizo una solicitud AJAX (fetch) para enviar los datos al servidor
    try {
        const response = await fetch('/api/user/resetPassword', {
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
                        title: 'Email enviado!',
                        text: 'Se ha enviado un email a '+data.payload+' con las instrucciones'
                    })
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

