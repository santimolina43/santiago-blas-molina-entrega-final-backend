// Migrated routers
// api
import ProductsRouter from './routers/api/products.router.js'
import CartsRouter from './routers/api/carts.router.js'
import UsersRouter from './routers/api/users.router.js'
import ChatRouter from './routers/api/chat.router.js'
import MockingProductsRouter from './routers/api/mockingProducts.router.js'
// views
import HomeRouter from './routers/views/home.router.js'
import CartsViewRouter from './routers/views/carts.router.js'
import UsersViewRouter from './routers/views/users.router.js'
import RealTimeProductsRouter from './routers/views/realTimeProducts.router.js'
import ChatViewRouter from './routers/views/chat.router.js'
// DB Services
import ProductService from './services/product.service.js'
import ChatService from './services/chat.service.js'
import CartService from './services/cart.service.js'
// Error handler middleware
import errorHandler from './middlewares/error.js'
import { logger } from './app.js'

// Inicializo Clases
// Services
const productService = new ProductService()                               
const chatService = new ChatService()  
const cartService = new CartService()
// Routers
// api
const productsRouter = new ProductsRouter();                             
const cartsRouter = new CartsRouter();                             
const usersRouter = new UsersRouter();                             
const chatRouter = new ChatRouter();                             
const mockingProductsRouter = new MockingProductsRouter();   
// views
const homeRouter = new HomeRouter();                             
const cartsViewRouter = new CartsViewRouter();                             
const usersViewRouter = new UsersViewRouter();                             
const realTimeProductsRouter = new RealTimeProductsRouter();                             
const chatViewRouter = new ChatViewRouter();                             

const run = (socketServer, app) => {
    app.use((req, res, next) => {
        req.io = socketServer
        next()
    })

    // Me conecto a los endpoints
    // api
    app.use('/api/products', productsRouter.getRouter())
    app.use('/api/cart', cartsRouter.getRouter())
    app.use('/api/user', usersRouter.getRouter())
    app.use('/api/chat', chatRouter.getRouter())
    app.use('/api/mockingProducts', mockingProductsRouter.getRouter())
    // vistas
    app.use('/', homeRouter.getRouter())
    app.use('/cart', cartsViewRouter.getRouter())
    app.use('/user', usersViewRouter.getRouter())
    app.use('/chat', chatViewRouter.getRouter())
    app.use('/realtimeproducts', realTimeProductsRouter.getRouter())
    app.use(errorHandler)


    socketServer.on('connection', async (socketClient) => {
        logger.info('Socket Server UP!')
        socketServer.emit('productsHistory', await productService.getProducts())
        socketServer.emit('messagesHistory', await chatService.getMessages())
        socketClient.on('deletedOrAddedProduct', async () => {
            socketServer.emit('productsHistory', await productService.getProducts())
        })
        socketClient.on('message', async () => {
            socketServer.emit('messagesHistory', await chatService.getMessages())
        })
        socketClient.on('deletedOrAddedProductToCart', async (cid) => {
            const productsInCart = await cartService.getCartByID(cid)
            socketServer.emit('cartProductsHistory', productsInCart)
        })
    })
}

export default run