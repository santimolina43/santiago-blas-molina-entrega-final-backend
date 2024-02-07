import RouterClass from '../router.js';
import { getHomeProducts } from '../../controllers/product.controller.js';

export default class HomeRouter extends RouterClass {
    init() {
        
        /************************************/   
        /************** VISTAS **************/   
        /************************************/ 

        /********* HOME *********/   
        this.get('/', ["USER", "ADMIN", "PREMIUM"], 'jwt', {}, getHomeProducts)
        
    }
}
