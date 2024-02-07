const socketClient = io();

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
                    text: data.error.errorMsg
                })
            } else {
                window.location.href = `https://web-production-59fe.up.railway.app/cart/`;
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
};

function restProductFromCart(cart_id, product_id) {
    const quantity = JSON.stringify({quantity: -1})
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
                    text: data.error.errorMsg
                })
            } else {
                window.location.href = `https://web-production-59fe.up.railway.app/cart/`;
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
};


function deleteProductFromCart(cid, pid) {
    fetch(`/api/cart/${cid}/product/${pid}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.status == "error") {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: data.error.errorMsg
                })
            } else {
                socketClient.emit('deletedOrAddedProductToCart', cid);
            }
        })
        .catch(error => {
            console.error('Error en la solicitud:', error);
        });
};

finishPurchase = async (cid) => {
    // pendiente hacer un chequeo del stock para dar un aviso al usuario que
    // los productos sin stock no se sumaran en el ticket
    const products = await checkProductsStock(cid)
    // Chequeo si tengo productos sin stock suficiente para hacer la compra del carrito     
    const productosSinStock = []
    await products.products.forEach(item => {
        if (item.quantity > item.product.stock) {
            productosSinStock.push(item.product.title)
        }
    })
    if (productosSinStock.length === 0) {
        // Si no tengo productos sin stock, continuo con la compra
        continueToPurchase(cid)
    } else {
        // Si tengo productos sin stock, aviso al usuario y el decidira si continuar o no
        const productosSinStockMessage = productosSinStock.join(', ');
        Swal.fire({
            icon: 'error',
            title: `No hay stock suficiente para los productos: ${productosSinStockMessage}`,
            text: '¿Desea continuar de todas formas?',
            showConfirmButton: true,
            confirmButtonText: 'Continuar',
            showDenyButton: true,
            denyButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Si confirma continuar, continuamos con la compra
                continueToPurchase(cid)
            }
          });
    }
    

};

continueToPurchase = async (cid) => {
    await fetch(`/api/cart/${cid}/purchase/`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            if (data.status == "error") {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: data.error.errorMsg
                })
            } else {
                window.location.href = `/cart/${cid}/purchase/${data.payload._id.toString()}`;
            }
        })
        .catch(error => {
            console.error('Error en la solicitud: '+data.error, error);
        });
}


checkProductsStock = async (cid) => {
    const products = await fetch(`/api/cart/${cid}`, {
                                method: 'GET'
                            })
                                .then(response => response.json())
                                .then(data => {
                                    if (data.status == "error") {
                                        Swal.fire({
                                            icon: 'error',
                                            title: 'Oops...',
                                            text: data.error.errorMsg
                                        })
                                    } else {
                                        return data.payload
                                    }
                                })
                                .catch(error => {
                                    console.error('Error en la solicitud: '+data.payload, error);
                                });
    return products
};


socketClient.on('cartProductsHistory', async data => {
    const arrayProducts = data.products
    const cartId = data._id
    const cartProducts = document.getElementById('table_body')
    cartProducts.innerHTML = '';
    arrayProducts.forEach(p => {
        const subTotal = p.product.price * p.quantity
        const productsInCart = `
                <tr>
                    <td>
                        <img src="${p.product.thumbnail}" alt="${p.product.title}" class="img-thumbnail" width="100">
                    </td>
                    <td>
                        <h5>${p.product.title}</h5>
                        <p>${p.product.description}</p>
                    </td>
                    <td>$${p.product.price}</td>
                    <td>
                        <div class="input-group">
                            <button class="btn btn-outline-secondary" type="button" onclick="restProductFromCart('${cartId}','${p.product._id}')">-</button>
                            <input type="text" class="form-control" value="${p.quantity}" readonly>
                            <button class="btn btn-outline-secondary" type="button" onclick="addProductToCart('${cartId}','${p.product._id}')">+</button>
                        </div>
                    </td>
                    <td>$${subTotal}</td>
                    <td>
                        <button class="btn btn-danger" onclick="deleteProductFromCart('${cartId}','${p.product._id}')">Eliminar</button>
                    </td>
                </tr>
        `
        cartProducts.insertAdjacentHTML('beforeend', productsInCart);
    });
})