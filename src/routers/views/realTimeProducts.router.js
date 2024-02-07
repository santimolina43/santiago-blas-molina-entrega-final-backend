import RouterClass from '../router.js';
import { getRealTimeProducts } from '../../controllers/product.controller.js';

export default class RealTimeProductsRouter extends RouterClass {
    init() {

        /************************************/   
        /************** VISTAS **************/   
        /************************************/ 

        /********* REAL TIME PRODUCTS *********/   
        this.get('/', ["PREMIUM", "ADMIN"], 'next', {}, getRealTimeProducts)
    }
}
