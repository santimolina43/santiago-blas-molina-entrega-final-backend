import usersTest from './Users/users.test.js'
import productsTest from './Products/products.test.js'
import cartsTest from './Carts/carts.test.js'

describe('Supertest API Ecommerce', () => {
    usersTest()
    productsTest()
    cartsTest()
})