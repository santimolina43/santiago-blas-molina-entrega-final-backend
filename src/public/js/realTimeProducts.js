
const socketClient = io();

const productForm = document.getElementById('productForm');
productForm.addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita la acción predeterminada de enviar el formulario
    // Obtengo los datos del formulario
    const formData = new FormData(productForm);
    // Realizo una solicitud AJAX (fetch) para enviar los datos al servidor
    try {
        await fetch('/api/products', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'error') {
                    // Mostramos el mensaje de error al usuario
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: data.error.errorMsg
                    })
                } else {
                    socketClient.emit('deletedOrAddedProduct');
                    // Mostramos el mensaje de exito al usuario
                    Swal.fire({
                        icon: 'success',
                        title: 'OK!',
                        text: 'The product has been added correctly'
                    })
                    const title = document.getElementById('title');
                    const description = document.getElementById('description');
                    const price = document.getElementById('price');
                    const thumbnail = document.getElementById('thumbnail');
                    const code = document.getElementById('code');
                    const stock = document.getElementById('stock');
                    const category = document.getElementById('category');
                    title.value = "" 
                    description.value = "" 
                    price.value = "" 
                    thumbnail.value = "" 
                    code.value = "" 
                    stock.value = "" 
                    category.value = "" 
                }
            })
            .catch(error => console.error('Error en la solicitud:'+ error))
    }
    catch (error) {
        console.error(error);
        // Mostramos el mensaje de error al usuario
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: data.error.errorMsg
        })
    };
});

function deleteProduct(pid) {
    fetch('/api/products/'+pid, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'error') {
                // Mostramos el mensaje de error al usuario
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: data.error
                })
            } else {
                socketClient.emit('deletedOrAddedProduct');
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
};

socketClient.on('productsHistory', async data => {
    const arrayProducts = data
    const history = document.getElementById('history')
    history.innerHTML = '';
    arrayProducts.forEach(product => {
        const card = `
            <div class="col">
                <div class="card">
                    <img src="${product.thumbnail}" class="card-img-top" alt="...">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text">${product.description}</p>
                        <h6 class="card-text">Precio: $${product.price}</h6>
                        // <p class="card-text"><small class="text-body-secondary">Last updated 3 mins ago</small></p>
                        <button class="btn btn-danger small" onclick="deleteProduct('${product._id.toString()}')">Eliminar</button>
                    </div>
                </div>
            </div>
        `
        history.insertAdjacentHTML('beforeend', card);
    });
})
