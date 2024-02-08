
function deleteUser(user_id) {
    fetch(`/api/user/${user_id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            if (data.status == "error") {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: data.error
                })
            } else {
                Swal.fire({
                    icon: 'success',
                    title: `¡Eliminado!`,
                    text: 'Usuario eliminado exitosamente',
                    showConfirmButton: true
                }).then((result) => {
                    if (result.isConfirmed) {
                      // Redirige a /administrateUsers cuando se hace clic en "OK"
                      window.location.href = "/user/administrateUsers";
                    }
                });;
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
};


function changeUserRole(uid) {
    fetch(`/api/user/premium/${uid}`, {
        method: 'PUT'
    })
        .then(response => response.json())
        .then(data => {
            if (data.status == "error") {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: data.error
                })
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Role modificado correctamente',
                    text: 'Debera cerrar sesion y volver a iniciar para ver los cambios',
                    showConfirmButton: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = "/user/administrateUsers";
                    }
                  });
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
}