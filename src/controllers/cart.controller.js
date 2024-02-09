import { env_parameters_obj } from '../config/env.config.js'
import CartService from '../services/cart.service.js'
import ProductService from '../services/product.service.js'
import Stripe from 'stripe'

const cartService = new CartService()
const productService = new ProductService()

// configuro stripe con la key de desarrollo
const stripe = new Stripe(env_parameters_obj.stripe.key)

export const getProductFromCartById = async (req, res) => {
    const id = req.params.cid
    try {
        const cartFound = await cartService.getCartByID(id)
        res.status(200).json({ status: "success", payload: cartFound })
    } catch (error) {
        req.logger.error('cart.controller.js - Error en getProductFromCartById: '+error)
        res.status(400).json({ status:"error", error: error})
    }
}

export const createNewCart = async (req, res) => {
    try {
        const newCart = await cartService.addCart([])
        res.status(200).json({ status: "success", payload: newCart })
    } catch (error) {
        req.logger.error('cart.controller.js - Error en createNewCart: '+error)
        res.status(400).json({ status:"error", error: error})
    }
}

export const addProductsToCartById = async (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    const quantity = req.body.quantity ? req.body.quantity : 1
    // chequeo que el producto no sea del mismo owner que lo quiere agregar
    req.logger.info("cart.controller.js - addProductsToCartById: chequeo que el producto no sea del mismo owner que lo quiere agregar")
    const productToAdd = await productService.getProductByID(productId)
    if (productToAdd.owner === req.user.email) {
        req.logger.error('cart.controller.js - addProductsToCartById - No es posible agregar un producto a tu carrito del cual eres owner')
        return res.status(500).send({ status:"error", error: 'No es posible agregar un producto a tu carrito del cual eres owner'})
    }
    // procedo a añadir el producto al carrito
    req.logger.info("cart.controller.js - addProductsToCartById: procedo a añadir el producto al carrito")
    try {
        const updatedCart = await cartService.addProductToCart(cartId, productId, quantity, "inc")
        res.status(200).json({ status: "success", payload: updatedCart })
    } catch (error) {
        req.logger.error('cart.controller.js - Error en addProductsToCartById: '+error)
        res.status(400).json({ status:"error", error: error})
    }
}

export const deleteProductsFromCartById = async (req, res) => {
    const cartId = req.params.cid
    const productId = req.params.pid
    try {
        const updatedCart = await cartService.deleteProductFromCart(cartId, productId)
        return res.status(200).json({ status: "success", payload: updatedCart })
    } catch (error) {
        req.logger.error('cart.controller.js - Error en deleteProductsFromCartById: '+error)
        res.status(400).json({ status:"error", error: error})
    }
}

export const updateCartById = async (req, res) => {
    // Obtengo el parametro del id del carrito y el array con los productos que quiero agregar desde el body de la request
    const id = req.params.cid
    const products = req.body.products
    try { 
        // Verifico que el carrito con ese id exista, y sino devuelvo error
        await cartService.getCartByID(id) 
        // Recorro el array de productos y los añado al carrito 
        for (const product of products) {
            await cartService.addProductToCart(id, product.product, product.quantity, "inc");
        }      
        // Devuelvo el producto actualizado
        const updatedCart = await cartService.getCartByID(id)
        res.status(200).json({ status: "success", payload: updatedCart })
    } 
    catch (error) {
        req.logger.error('cart.controller.js - Error en updateCartById: '+error)
        return res.status(404).json({ status:"error", payload: error})
    }
}

export const updateCartByIdAndProductId = async (req, res) => {
    // Obtengo el parametro del id del carrito y el array con los productos que quiero agregar desde el body de la request
    const cartID = req.params.cid
    const productID = req.params.pid
    const quantity = req.body.quantity
    try { 
        // Verifico que el carrito con ese id exista, y sino devuelvo error
        await cartService.getCartByID(cartID) 
        // Añado el producto al carrito y seteo la cantidad especificada
        const updatedCart = await cartService.addProductToCart(cartID, productID, quantity, "set");
        // Devuelvo el producto actualizado
        res.status(200).json({ status: "success", payload: updatedCart })
    } catch (error) {
        req.logger.error('cart.controller.js - Error en updateCartByIdAndProductId: '+error)
        return res.status(404).json({ status:"error", payload: error})
    }
}

export const deleteAllProductsFromCartById = async (req, res) => {
    const cartId = req.params.cid
    try { 
        await cartService.deleteAllProductsFromCartById(cartId)
        res.status(200).json({ status: "success", payload: await cartService.getCartByID(cartId) })
    } 
    catch (error) {
        req.logger.error('cart.controller.js - Error en deleteAllProductsFromCartById: '+error)
        return res.status(404).json({ status:"error", payload: error})
    }
}

export const createSessionCheckout = async (req, res) => {
    const cart_id = req.params.cid
    const ticket_id = req.body.ticketId
    const cartProductsArray = req.body.products
    try {
        req.logger.info("cart.controller.js - createSessionCheckout - start")
        // damos formato al array de productos del carrito
        req.logger.info("cart.controller.js - createSessionCheckout - damos formato al array de productos del carrito")
        const products = cartProductsArray.map(item => (
            {
                price_data: {
                    product_data: {
                        name: item.product.title,
                        description: item.product.description
                    },
                    currency: 'usd',
                    unit_amount: item.product.price*100
                },
                quantity: item.quantity
            }
        ))
        // creamos la sesion de pago de stripe
        req.logger.info("cart.controller.js - createSessionCheckout - creamos la sesion de pago de stripe")
        const session = await stripe.checkout.sessions.create({
            line_items: products,
            // el modo se refiere en este caso a un unico pago: "payment"
            mode: 'payment',
            success_url: `http://localhost:8080/cart/${cart_id}/purchase/${ticket_id}`,
            cancel_url: `http://localhost:8080/cart/${cart_id}/cancelpurchase/${ticket_id}`
        })
        // retornamos la session
        req.logger.info("cart.controller.js - createSessionCheckout - retornamos la session")
        return res.json(session)
    } catch (error) {
        req.logger.error('cart.controller.js - Error en createSessionCheckout: '+error)
        return res.status(404).json({ status:"error", payload: error})
    }
}
