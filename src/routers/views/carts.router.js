import RouterClass from '../router.js';
import { getUsersCartView } from '../../controllers/user.controller.js';
import { getCancelPurchaseView, getTicketView } from '../../controllers/ticket.controller.js';

// Carts Router
export default class CartsRouter extends RouterClass {
    init() {

        /************************************/   
        /************** VISTAS **************/   
        /************************************/ 

        /********* CARRITO *********/   
        this.get('/', ["USER", "PREMIUM"], 'next', {}, getUsersCartView)
        
        /********* PAYMENT SUCCESS *********/
        this.get('/:cid/purchase/:tid', ["USER", "PREMIUM"], 'next', {}, getTicketView)
        
        /********* PAYMENT CANCEL *********/
        this.get('/:cid/cancelpurchase/:tid', ["USER", "PREMIUM"], 'next', {}, getCancelPurchaseView)

    }
}
