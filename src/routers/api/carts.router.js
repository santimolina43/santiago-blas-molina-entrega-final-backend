import RouterClass from '../router.js';
import { getProductFromCartById, createNewCart, addProductsToCartById, deleteProductsFromCartById, updateCartById, updateCartByIdAndProductId, deleteAllProductsFromCartById, createSessionCheckout } from '../../controllers/cart.controller.js'
import { finishPurchaseInCartById } from '../../controllers/ticket.controller.js';

// Carts Router
export default class CartsRouter extends RouterClass {
    init() {

        /************************************/   
        /*************** API ****************/   
        /************************************/ 
        
        /********* CREATE NEW CARTS *********/    
        this.post('/', ["PUBLIC"], 'next', {}, createNewCart)
        
        /********* GET PRODUCTS FROM CART BY ID *********/    
        this.get('/:cid', ["PUBLIC"], 'next', {}, getProductFromCartById)
        
        /********* UPDATE CART BY ID AND ADD PRODUCTS TO CART *********/    
        this.put('/:cid', ["USER", "PREMIUM"], 'next', {}, updateCartById)
         
        /********* DELETE ALL PRODUCTS IN CART BY ID *********/    
        this.delete('/:cid', ["USER", "PREMIUM"], 'next', {}, deleteAllProductsFromCartById)

        /********* POST PRODUCTS IN CART BY CART ID AND PRODUCT ID *********/    
        this.post('/:cid/product/:pid', ["USER", "PREMIUM"], 'next', {}, addProductsToCartById)
        
        /********* UPDATE CART AND ADD PRODUCT IN SPECIFIC QUANTITY BY CART ID AND PRODUCT ID *********/    
        this.put('/:cid/product/:pid', ["USER", "PREMIUM"], 'next', {}, updateCartByIdAndProductId)

        /********* DELETE PRODUCTS IN CARTS BY ID *********/    
        this.delete('/:cid/product/:pid', ["USER", "PREMIUM"], 'next', {}, deleteProductsFromCartById)
        
        /********* FINISH PURCHASE IN CART BY ID *********/    
        this.post('/:cid/purchase/', ["USER", "PREMIUM"], 'next', {}, finishPurchaseInCartById)
        
        /********* FINISH PURCHASE IN CART BY ID *********/    
        this.post('/pay/create-checkout-session/:cid', ["USER", "PREMIUM"], 'next', {}, createSessionCheckout)

    }
}
