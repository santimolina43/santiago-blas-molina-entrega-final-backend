import {expect} from 'chai'
import supertest from 'supertest'
import { env_parameters_obj } from '../../src/config/env.config.js'
import { faker } from '@faker-js/faker'

const requester = supertest('http://localhost:8080')

export default () => {
    describe('Test de Productos', () => {
        let cookie;
        let cookieNewUser;
        const mockProduct = {
            title: 'productoMock',
            description: 'descripcion de producto',
            price: 100,
            thumbnail: './src/public/imgs/products/mosca.jpeg',
            code: '#341',
            stock: 10,
            category: 'moscas',
            status: true,
            owner: 'admin',
        }
        const mockUser = {
            first_name: "UsuarioMock",
            last_name: "Prueba",
            email: faker.internet.email(),
            age: 30,
            password: "12345678"
        }
        let idRegisteredProduct;
        let idRegisteredUser;

        it('No debe poder crearse un producto si el usuario no esta logueado', async function() {
            this.timeout(5000);
            const result = await requester.post('/api/products/')
                .field('title', mockProduct.title)
                .field('description', mockProduct.description)
                .field('price', mockProduct.price)
                .field('code', mockProduct.code)
                .field('stock', mockProduct.stock)
                .field('category', mockProduct.category)
                .field('status', mockProduct.status)
                .field('owner', mockProduct.owner)
                .attach('thumbnail', mockProduct.thumbnail)
            // corroboramos que la peticion haya resultado en Unauthorized
            expect(result.status).to.be.eql(500)
        })

        it('Debe poder crearse un producto con la ruta de la imagen si el usuario esta logueado', async function() {
            const result = await requester.post('/api/user/login').send({email: env_parameters_obj.admin.adminEmail, password: env_parameters_obj.admin.adminPassword})
            const cookieResult = result.headers['set-cookie'][0]
            expect(cookieResult).to.be.ok
            cookie = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }
            const postedProduct = await requester.post('/api/products')
                .field('title', mockProduct.title)
                .field('description', mockProduct.description)
                .field('price', mockProduct.price)
                .field('code', mockProduct.code)
                .field('stock', mockProduct.stock)
                .field('category', mockProduct.category)
                .field('status', mockProduct.status)
                .field('owner', mockProduct.owner)
                .attach('thumbnail', mockProduct.thumbnail)
                .set('Cookie', [`${cookie.name}=${cookie.value}`])
            idRegisteredProduct = postedProduct._body.payload._id
            // corroboramos que la peticion haya resultado en OK
            expect(postedProduct.status).to.be.eql(200)
            // corroboramos que el payload tenga un _id, indicando que se guardo en la BD
            expect(postedProduct._body.payload).to.have.property('_id')
            // Finalmente, corroboramos que la mascota guardada tambien tenga el campo image definido
            expect(postedProduct._body.payload.thumbnail).to.be.ok
        })

        it('No se debe poder eliminar un producto si el usuario no esta logueado', async function () {
            const result = await requester.delete(`/api/products/${idRegisteredProduct}`)
            // corroboramos que la peticion haya resultado en Unauthorized
            expect(result.status).to.be.eql(500)
        })

        it('No se debe poder eliminar un producto si el usuario esta logueado pero tiene rol user', async function () {
            // registro un nuevo usuario
            const response = await requester.post('/api/user/register').send(mockUser)
            idRegisteredUser = response._body.payload._id
            // logueo el usuario
            const loggedUser = await requester.post('/api/user/login').send({email: mockUser.email, password: mockUser.password})
            const cookieResult = loggedUser.headers['set-cookie'][0]
            cookieNewUser = {
                name: cookieResult.split('=')[0],
                value: cookieResult.split('=')[1]
            }
            // intento borrar el producto siendo usuario de rol user
            const result = await requester.delete(`/api/products/${idRegisteredProduct}`).set('Cookie', [`${cookieNewUser.name}=${cookieNewUser.value}`])
            // corroboramos que la peticion haya resultado en Unauthorized
            expect(result.status).to.be.eql(403)
            expect(result._body.error).to.be.eql('Unauthorized')
        })

        it('Debe poder eliminarse el producto si el usuario esta logueado y es el owner', async function () {
            const result = await requester.delete(`/api/products/${idRegisteredProduct}`).set('Cookie', [`${cookie.name}=${cookie.value}`])
            const result2 = await requester.get(`/api/products/${idRegisteredProduct}`)
            // corroboramos que la peticion haya resultado en success
            expect(result.status).to.be.eql(200)
            // corroboramos que la peticion de busqueda del producto resulte en not found
            expect(result2.status).to.be.eql(400)
        })

        after( async function () {
            // Elimino el nuevo usuario creado
            await requester.delete(`/api/user/${idRegisteredUser}`).set('Cookie', [`${cookieNewUser.name}=${cookieNewUser.value}`])
        })
    })
}