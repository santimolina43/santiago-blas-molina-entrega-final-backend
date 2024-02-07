
Swal.fire({ 
    title:"Authentication",
    text:"Alerta basica con SweetAlert",
    input:"text",
    inputValidator: value => {
        return !value.trim() && 'Please, write a valid username' // evita que se pueda cerrar el 
    },                                                           // alert sin ingresar un nombre
    allowOutsideClick: false // evita que se pueda cerrar el alert clickeando por fuera
}).then(result => {
    let user = result.value 
    document.getElementById('username').innerHTML = user 
    const socketClient = io(); 

    let chatbox = document.getElementById('chatbox')
    
    chatbox.addEventListener('keyup', async (evt) => {
        if (evt.key === "Enter") {
            if (chatbox.value.trim().length > 0) { 
                let message = JSON.stringify({user: user, message: chatbox.value})
                // Realizo una solicitud AJAX (fetch) para enviar los datos al servidor
                try {
                    const response = await fetch('/api/chat/messages', {
                        method: 'POST',
                        body: message,
                        headers: {'Content-Type': 'application/json'}
                    })
                    if (response.ok) {
                        socketClient.emit('message')
                    } else {
                        throw new Error('No se pudo completar la solicitud.');
                    }
                } 
                catch (error) {
                    console.error('Error en la solicitud:', error);
                };   
            }
        }
    })                             
    
    socketClient.on('messagesHistory', data => {
        let history = document.getElementById('history')
        let messages = ""
        data.reverse().forEach(message => { 
            messages += `${message.user}: ${message.message}<br>`
        });
        history.innerHTML = messages;
        chatbox.value = ""
    })
})
