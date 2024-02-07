

function addProductToCart(cart_id, product_id) {
    const quantity = JSON.stringify({quantity: 1})
    fetch(`/api/cart/${cart_id}/product/${product_id}`, {
        method: 'POST',
        body: quantity,
        headers: {
            'Content-Type': 'application/json' // Indica que estás enviando JSON
        }
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
                window.location.href = `http://localhost:8080/cart/`;
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
};


function changeUserRole(uid) {
    fetch(`/api/user/premium/${uid}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json' // Indica que estás enviando JSON
        }
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
                      window.location.href = `http://localhost:8080/`
                    }
                  });
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
}