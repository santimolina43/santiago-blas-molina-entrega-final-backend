import {expect} from 'chai'
import supertest from 'supertest'
import { env_parameters_obj } from '../../src/config/env.config.js'
import { faker } from '@faker-js/faker'

const requester = supertest('http://localhost:8080')

export default () => {
    describe('Test de Carritos', () => {
        let idRegisteredCart;
        let idRegisteredUser;
        let idRegisteredProduct;
        let idRegisteredAdminProduct;
        let cookieNewUser;
        let cookieAdmin;
        let idNewUserCart;
        const mockUser = {
            first_name: "UsuarioMock",
            last_name: "Prueba",
            email: faker.internet.email(),
            age: 30,
            password: "12345678"
        }
        const mockUserProduct = {
            title: 'productoMock',
            description: 'descripcion de producto',
            price: 100,
            thumbnail: './src/public/imgs/products/mosca.jpeg',
            code: '#00000',
            stock: 10,
            category: 'moscas',
            status: true
        }
        const mockAdminProduct = {...mockUserProduct, code: '#00001'}
        before( async function() {
            // registro un nuevo usuario
            const response = await requester.post('/api/user/register').send(mockUser)
            idRegisteredUser = response._body.payload._id
            idNewUserCart = response._body.payload.cart
            // logueo el usuario
            let loggedUser = await requester.post('/api/user/login').send({email: mockUser.email, password: mockUser.password})
            let cookieResult = loggedUser.headers['set-cookie'][0]
            cookieNewUser = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }
            // cambiamos el role del usuario a premium para que pueda crear nuevos productos
            await requester.put(`/api/user/users/premium/${idRegisteredUser}`)
                .set('Cookie', [`${cookieNewUser.name}=${cookieNewUser.value}`])
            // volvemos a loguear al usuario para que la cookie tenga el nuevo rol premium
            loggedUser = await requester.post('/api/user/login').send({email: mockUser.email, password: mockUser.password})
            cookieResult = loggedUser.headers['set-cookie'][0]
            cookieNewUser = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }
            // creamos un producto nuevo con el nuevo producto
            const postedUserProduct = await requester.post('/api/products')
                .field('title', mockUserProduct.title)
                .field('description', mockUserProduct.description)
                .field('price', mockUserProduct.price)
                .field('code', mockUserProduct.code)
                .field('stock', mockUserProduct.stock)
                .field('category', mockUserProduct.category)
                .field('status', mockUserProduct.status)
                .attach('thumbnail', mockUserProduct.thumbnail)
                .set('Cookie', [`${cookieNewUser.name}=${cookieNewUser.value}`])
            idRegisteredProduct = postedUserProduct._body.payload._id
            // logueamos al admin y creamos un producto con el user del admin
            let adminLoggedUser = await requester.post('/api/user/login').send({email: env_parameters_obj.admin.adminEmail, password: env_parameters_obj.admin.adminPassword})
            let adminCookieResult = adminLoggedUser.headers['set-cookie'][0]
            cookieAdmin = {
                name: adminCookieResult.split('=')[0],
                value: adminCookieResult.split('=')[1]
            }
            const postedAdminProduct = await requester.post('/api/products')
                .field('title', mockAdminProduct.title)
                .field('description', mockAdminProduct.description)
                .field('price', mockAdminProduct.price)
                .field('code', mockAdminProduct.code)
                .field('stock', mockAdminProduct.stock)
                .field('category', mockAdminProduct.category)
                .field('status', mockAdminProduct.status)
                .attach('thumbnail', mockAdminProduct.thumbnail)
                .set('Cookie', [`${cookieAdmin.name}=${cookieAdmin.value}`])
            idRegisteredAdminProduct = postedAdminProduct._body.payload._id
        })

        it('Debe poder crearse un carrito con un array de productos vacios', async function() {
            const result = await requester.post('/api/cart')
            // corroboramos que la peticion haya resultado en OK
            expect(result.status).to.be.eql(200)
            // corroboramos que el payload tenga un _id, indicando que se guardo en la BD
            expect(result._body.payload).to.have.property('_id')
            idRegisteredCart = result._body.payload._id
            // corroboramos que el carrito se creo con un array de productos vacío
            expect(result._body.payload.products).to.be.eql([])
        })

        it('No debe poder añadirse un producto del cual eres owner a tu carrito', async function() {
            const result = await requester.post(`/api/cart/${idNewUserCart}/product/${idRegisteredProduct}`)
                .set('Cookie', [`${cookieNewUser.name}=${cookieNewUser.value}`])
            // corroboramos que la peticion haya resultado en Unauthorized
            expect(result.status).to.be.eql(500)
            // corroboramos que el mensaje de error sea por querer agregar un producto propio al carrito
            expect(result._body.error).to.be.eql('No es posible agregar un producto a tu carrito del cual eres owner')
        })


        it('Debe poder añadirse un producto del cual no eres owner a tu carrito', async function() {
            const result = await requester.post(`/api/cart/${idNewUserCart}/product/${idRegisteredAdminProduct}`)
                .set('Cookie', [`${cookieNewUser.name}=${cookieNewUser.value}`])
            // corroboramos que la peticion haya resultado en OK
            expect(result.status).to.be.eql(200)
            // corroboramos que el payload tenga un _id, indicando que la peticion devolvio el carrito
            expect(result._body.payload).to.have.property('_id')
            // corroboramos que el carrito ahora tiene un producto en el array de productos
            expect(result._body.payload.products.length).to.be.eql(1)
            // corroboramos que el producto del carrito es el que creamos previamente
            expect(result._body.payload.products[0].product).to.be.eql(idRegisteredAdminProduct)
        })

        after( async function() {
            // Elimino el nuevo producto mock creado con el nuevo user
            await requester.delete(`/api/products/${idRegisteredProduct}`).set('Cookie', [`${cookieNewUser.name}=${cookieNewUser.value}`])
            // Elimino el nuevo producto mock creado con el admin
            await requester.delete(`/api/products/${idRegisteredAdminProduct}`).set('Cookie', [`${cookieAdmin.name}=${cookieAdmin.value}`])
            // Elimino el nuevo usuario mock creado para las pruebas
            await requester.delete(`/api/user/${idRegisteredUser}`)
                .set('Cookie', [`${cookieNewUser.name}=${cookieNewUser.value}`])
        })
    })
}