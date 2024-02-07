import RouterClass from '../router.js';
import { getMockingProducts } from '../../controllers/mockingProducts.controller.js'

// Products Router
export default class ProductsRouter extends RouterClass {
    init() {

        /************************************/   
        /*************** API ****************/   
        /************************************/ 

        /********* GET PRODUCTS *********/    
        this.get('/', ["PUBLIC"], 'next', {}, getMockingProducts)

    }
}
