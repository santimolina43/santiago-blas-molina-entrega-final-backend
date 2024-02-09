import { productCollection } from '../dao/models/products.model.js'
import CustomError from './errors/customError.js'
import EErros from './errors/enums.js'
import PersistenceFactory from '../dao/persistenceFactory.js'
import { logger } from '../app.js'

const persistanceFactory = new PersistenceFactory()

class ProductService {
    #_products
    constructor() {
        this.#_products = []
        this.productsDAO = null
        this.init();
    }

    init = async() => {
        try {
            const PersistenceFactory = await persistanceFactory.getPersistence(productCollection) 
            const persistance = new PersistenceFactory()
            this.productsDAO = persistance;
        } catch (error) {
            throw new CustomError('product.service.js - Error al leer la persistencia: ' + error, EErros.DATABASES_ERROR);
        }
    }

    /********* GET PRODUCTS *********/    
    async getProducts() {
        // Leo la base de datos y retorno los productos
        try {
            let products = await this.productsDAO.find() 
            if (products.length === 0) return [];
            this.#_products = products
        } catch (error) {
            logger.error('product.service.js - Error en getProducts: '+error)
            throw new CustomError("Error al buscar los productos en la base de datos", EErros.DATA_NOT_FOUND_ERROR)
        }
        return this.#_products
    }   

    /********* ADD PRODUCT *********/
    async addProduct(product) {
        try {
            // Compruebo que esten todos los campos necesarios
            if (!product.title||!product.description||!product.price||!product.category||!product.code||!product.stock) {
                // si falta algun campo, genero error
                throw new CustomError("Falta definir uno o mas campos del producto", EErros.MISSING_FIELDS_ERROR)
            }
            // Obtengo el array de productos desde la base de datos
            await this.getProducts()
            // Chequeo que el codigo de producto no exista. Si existe, devuelvo error, sino, lo agrego al array de productos
            const found = this.#_products.find(item => item.code === product.code)      
            if(found) {
                // si el codigo ya existe, genero el error
                throw new CustomError("Codigo de producto ya existente", EErros.UNIQUE_KEY_VIOLATED)
            } else {
                // Creamos el producto en la base de datos
                let newProduct = await this.productsDAO.createNew(product);
                return newProduct
            }
        } catch (error) {
            logger.error('product.service.js - Error en addProduct: '+error)
            throw new CustomError(error)
        }
    }  

    /********* UPDATE PRODUCT *********/
    async updateProduct(id, campos) {
        try {
            // Creo el objeto del producto modificado (let updatedProduct = )
            await this.productsDAO.updateProductAndSetCampos(id, campos)
            return (await this.getProducts()).find(item => item._id.toString() === id)
        } catch (error) {
            logger.error('product.service.js - Error en updateProduct: '+error)
            throw new CustomError(error, EErros.DATABASES_ERROR)
        }
    }

    /********* UPDATE PRODUCT *********/
    async updateProductAndIncQuantity(id, quantity) {
        try {
            // Obtengo el stock actual del producto
            const product = await this.productsDAO.findOne(id)
            const actualStock = product.stock
            // Creo el objeto del producto modificado (let updatedProduct = )
            await this.productsDAO.updateProductAndSetCampos(id, {stock: actualStock + quantity})
            return (await this.getProducts()).find(item => item._id.toString() === id)
        } catch (error) {
            logger.error('product.service.js - Error en updateProduct: '+error)
            throw new CustomError(error, EErros.DATABASES_ERROR)
        }
    }

    /********* DELETE PRODUCT *********/
    async deleteProduct(id) {
        try {
            // Obtengo el array de productos desde el archivo
            await this.getProducts()
            // Recorro el array de productos y modifico los solicitados
            let isFound = false
            this.#_products.forEach(item => {
                if (item._id == id) {
                    isFound = true
                }
            })
            if (!isFound) {
                throw new CustomError("ID de producto inexistente", EErros.DATA_NOT_FOUND_ERROR)
            }
            // Elimino el producto
            await this.productsDAO.deleteOne(id)
            // Obtengo el nuevo array de productos desde la base de datos
            return this.getProducts()
        } catch (error) {
            logger.error('product.service.js - Error en deleteProduct: '+error)
            throw new CustomError(error)
        }
    }                         

    /********* GET PRODUCT BY ID *********/
    async getProductByID(idValue) {
        try {
            const product = await this.getProductByField('_id', idValue)
            return product
        } catch (error) {
            logger.error('product.service.js - Error en getProductByID: '+error)
            throw new CustomError(error, EErros.DATABASES_ERROR)
        }
    }

    async getProductByField(propiedad, valor) {
        try {
            // Obtengo el array de productos desde el archivo
            await this.getProducts()
            // Busco el producto a traves de la propiedad en el array
            const productFound = this.#_products.find(item => item[propiedad].toString() === valor)
            if (productFound) {
                return productFound
            } else {
                throw new CustomError('No se encontró ningun producto con '+propiedad+' = '+valor, EErros.DATA_NOT_FOUND_ERROR)
            }
        } catch (error) {
            logger.error('product.service.js - Error en getProductByField: '+error)
            throw new CustomError(error)
        }
    }

    /********* PAGINATE PRODUCTS *********/
    async paginateProducts(query, filters) {
        try {
            const products = await this.productsDAO.paginateProducts(query, filters)
            return products
        } catch (error) {
            logger.error('product.service.js - Error en paginateProducts: '+error)
            throw new CustomError(error, EErros.DATABASES_ERROR)
        }
    }
}


export default ProductService;
