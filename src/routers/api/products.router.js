import RouterClass from '../router.js';
import { uploaderThumbnail, uploaderProductPhoto } from '../../middlewares/multer-uploader.js'
import { addNewProduct, deleteProductById, getProducts, getProductsById, updateProductById } from '../../controllers/product.controller.js'

// Products Router
export default class ProductsRouter extends RouterClass {
    init() {

        /************************************/   
        /*************** API ****************/   
        /************************************/ 

        /********* GET PRODUCTS *********/    
        this.get('/', ["PUBLIC"], 'next', {}, getProducts)

        /********* GET PRODUCTS BY ID *********/    
        this.get('/:pid', ["PUBLIC"], 'next', {}, getProductsById)

        /********* POST PRODUCTS *********/    
        this.post('/', ["ADMIN", "PREMIUM"], 'next', {}, uploaderProductPhoto, addNewProduct )

        /********* PUT PRODUCTS *********/    
        this.put('/:pid', ["ADMIN", "PREMIUM"], 'next', {}, updateProductById)
       
        /********* DELETE PRODUCTS *********/    
        this.delete('/:pid', ["ADMIN", "PREMIUM"], 'next', {}, deleteProductById)

    }
}
