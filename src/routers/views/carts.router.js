import RouterClass from '../router.js';
import { getUsersCartView } from '../../controllers/user.controller.js';
import { getTicketView } from '../../controllers/ticket.controller.js';

// Carts Router
export default class CartsRouter extends RouterClass {
    init() {

        /************************************/   
        /************** VISTAS **************/   
        /************************************/ 

        /********* CARRITO *********/   
        this.get('/', ["USER", "PREMIUM"], 'next', {}, getUsersCartView)
        
        /********* PURCHASE *********/
        this.get('/:cid/purchase/:tid', ["USER", "PREMIUM"], 'next', {}, getTicketView)

    }
}
