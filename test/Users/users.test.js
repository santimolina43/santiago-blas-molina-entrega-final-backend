import {expect} from 'chai'
import supertest from 'supertest'
import { faker } from '@faker-js/faker'

const requester = supertest('http://localhost:8080')

export default () => {
    describe('Test de Users', () => {    
        // declaramos una variable “cookie” de manera global en el contexto describe, la utilizaremos para el siguiente test.
        let cookie;
        let idRegistered;
        const mockUser = {
            first_name: "UsuarioMock",
            last_name: "Prueba",
            email: faker.internet.email(),
            age: 30,
            password: "12345678"
        }

        // Test 1: registro del usuario
        it('Debe registrar correctamente a un usuario', async function () {
            const response = await requester.post('/api/user/register').send(mockUser)
            idRegistered = response._body.payload._id
            // Solo nos basta que esté definido el payload, indicando que tiene un _id registrado
            expect(response.status).to.be.equal(200);
            expect(response._body.payload).to.be.ok;
            expect(response._body.payload._id).to.be.ok;
        })

        // Test 2: login del usuario
        it('Debe loguear correctamente al usuario y DEVOLVER UNA COOKIE', async function() {
                // Nos interesa esperar (expect) 3 cosas: Que el resultado de la cookie realmente funcione, que
                // la cookie final tenga el nombre de “coderCookie” (que es el nombre que se setea desde el endpoint),
                // y que el valor esté definido.
                // Enviamos al login los mismos datos del usuairo que recien registramos
                // Ahora, obtendremos de supertest los headers de la respuesta y extraeremos el header "set-cookie"
                // En caso de que este venga correctamente, significa que el endpoint efectivamente devuelve una cookie
                // Guardaremos el valor de la cookie en la variable "cookie" declarada mas arriba.
            const result = await requester.post('/api/user/login').send({email: mockUser.email, password: mockUser.password})
            const cookieResult = result.headers['set-cookie'][0]
            expect(cookieResult).to.be.ok
            cookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }
            expect(cookie.name).to.be.ok.and.eql('userCookie')
            expect(cookie.value).to.be.ok
        })

        // Test 3: Enviando la cookie recibida por el login
        it('Debe enviar la cookie que contiene el usuario y destructurar éste correctamente', async function () {
            // Es el último endpoint a probar para esta sesión, indicando que, cuando envíe la cookie al servidor,
            // este debería traerme el usuario guardado en el token. Con esto cumplimos el flujo de register, login y current.
            // Enviamos la cookie que guardamos arriba a partir de un set.
            const {_body} = await requester.get('/api/user/current').set('Cookie', [`${cookie.name}=${cookie.value}`])
            // Luego, el metodo current deberia devolver el correo del usuario que se guardo desde el login
            // Indicando que efectivamente se guardo una cookie con el valor del usuario (correo)
            expect(_body.payload.email).to.be.eql(mockUser.email)
        })
        
        
        // Test 3: Enviando la cookie recibida por el login
        it('Debe eliminar al usuario registrado en la base de datos', async function () {
            // await requester.post('/api/user/login').send({email: mockUser.email, password: mockUser.password})
            const deletedMsg = await requester.delete(`/api/user/${idRegistered}`).set('Cookie', [`${cookie.name}=${cookie.value}`])
            const userDeleted = await requester.get(`/api/user/${idRegistered}`).set('Cookie', [`${cookie.name}=${cookie.value}`])
            expect(deletedMsg._body.message).to.be.eql('Usuario eliminado correctamente')
            expect(userDeleted.status).to.be.eql(401)
        })
    })
}