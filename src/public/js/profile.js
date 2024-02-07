
const documentForm = document.getElementById('documentForm');
documentForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita la acción predeterminada de enviar el formulario
    // Obtengo los datos del formulario
    const formData = new FormData(documentForm);
    const userId = documentForm.dataset.userId;
    try {
        const response = await fetch(`/api/user/${userId}/documents`, {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'error') {
                    throw new Error(data.error);
                } else {
                    Swal.fire({
                        icon: 'success',
                        title: 'Felicitaciones',
                        text: 'Has cargado los archivos exitosamente',
                        showConfirmButton: true,
                    }).then((result) => {
                        if (result.isConfirmed) {
                          window.location.href = "/user/profile";
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
