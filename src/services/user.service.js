import { userCollection } from '../dao/models/users.model.js'
import UserDTO from '../dao/DTOs/user.dto.js'
import CustomError from './errors/customError.js'
import EErros from './errors/enums.js'
import PersistenceFactory from '../dao/persistenceFactory.js'
import { logger } from '../app.js'
import { createHash } from '../middlewares/auth-helpers.js'

const persistanceFactory = new PersistenceFactory()

class UserService {
    #_users
    constructor() {
        this.#_users = []
        this.usersDAO = null
        this.init();
    }

    init = async() => {
        try {
            const PersistenceFactory = await persistanceFactory.getPersistence(userCollection) 
            const persistance = new PersistenceFactory()
            this.usersDAO = persistance;
        } catch (error) {
            throw new CustomError('user.service.js - Error al leer la persistencia: ' + error, EErros.DATABASES_ERROR);
        }
    }

    /********* GET USERS *********/    
    async getUsers() {
        // Leo la base de datos y retorno los useros
        try {
            let users = await this.usersDAO.find() 
            if (users.length === 0) return [];
            this.#_users = users
        } catch (error) {
            logger.error('user.service.js - Error en getUsers: '+error)
            throw new CustomError('Error al buscar los users en la base de datos:'+error, EErros.DATA_NOT_FOUND_ERROR)
        }
        return this.#_users
    }   
    
    
    /********* GET USER BY CART ID *********/
    async getUserByCartId(cartIdValue) {
        try {
            const user = await this.getUserByField('cart', cartIdValue)
            const userToFront = new UserDTO(user)
            return userToFront
        } catch (error) {
            logger.error('user.service.js - Error en getUserByCartId: '+error)
            throw new CustomError('Error al buscar el usuario a con CartId: '+cartIdValue, EErros.DATA_NOT_FOUND_ERROR)
        }
    }
    
    /********* GET USER BY ID *********/
    async getUserByIDToBack(IDvalue) {
        try {
            const user = await this.getUserByField('_id', IDvalue)
            return user
        } catch (error) {
            logger.error('user.service.js - Error en getUserByID: '+error)
            throw new CustomError('Error al buscar el usuario a con id: '+IDvalue, EErros.DATA_NOT_FOUND_ERROR)
        }
    }

    /********* GET USER BY EMAIL *********/
    async getUserByEmailToBack(emailValue) {
    try {
        const users = await this.getUsers()
        const userFound = users.find(item => item.email == emailValue)
        // Busco el user a traves de la propiedad en el array
        if (userFound) {
            return userFound
        } else {
            return null
        }
    } catch (error) {
        logger.error('user.service.js - Error en getUserByEmailToBack: '+error)
        throw new CustomError('Error al buscar el usuario a con email: '+emailValue+'. Error: '+error, EErros.DATA_NOT_FOUND_ERROR)
    }
    }
    
    /********* GET USER BY EMAIL *********/
    async getUserByEmail(emailValue) {
        try {
            const user = await this.getUserByField('email', emailValue)
            const userToFront = new UserDTO(user)
            return userToFront
        } catch (error) {
            logger.error('user.service.js - Error en getUserByEmail: '+error)
            throw new CustomError('Error al buscar el usuario a con email: '+emailValue, EErros.DATA_NOT_FOUND_ERROR)
        }
    }

    /********* ADD USER *********/
    async addUser(user) {
        logger.info('user.service.js - addUser - Start')
        // Compruebo que esten todos los campos necesarios
        if (!user.first_name||!user.last_name||!user.email||!user.age||!user.password) {
            throw new CustomError('No estan informados todos los campos necesarios para añadir el usuario', EErros.MISSING_FIELDS_ERROR)
        }
        // Chequeo que el email no exista. Si existe, devuelvo error, sino, agrego el user a la bd
        try {
            const found = await this.usersDAO.findOne(user.email)     
            if(found) {
                throw new CustomError('Usuario ya existente.', EErros.UNIQUE_KEY_VIOLATED)
            } else {
                // Creamos el user en la base de datos
                let newuser = await this.usersDAO.createNew(user);
                return newuser
            } 
        } catch (error) {
            logger.error('user.service.js - Error en addUser: '+error)
            throw new CustomError('Error al crear el usuario: '+error, EErros.DATABASES_ERROR)
        }
    }  
    
    /********* UPDATE USER PASSWORD *********/
    async updateUserPassword(email, password) {
        try {
            // Hasheo la contraseña
            const hashedPassword = createHash(password)
            // Creo el objeto del usero modificado (let updateduser = )
            await this.usersDAO.updateUserAndSetCamposByEmail(email, {password: hashedPassword})
            return await this.getUserByEmail(email)
        } catch (error) {
            logger.error('user.service.js - Error en updateUserPassword: '+error)
            throw new CustomError('Error al updatear el usuario: '+error, EErros.DATABASES_ERROR)
        }
    }

    /********* UPDATE USER ROLE *********/
    async updateUserRole(email, role) {
        try {
            logger.info('user.service.js - updateUserRole - modifico el rol del usuario')
            await this.usersDAO.updateUserAndSetCamposByEmail(email, {role: role})
            return await this.getUserByEmailToBack(email)
        } catch (error) {
            logger.error('user.service.js - Error en updateUserRole: '+error)
            throw new CustomError('Error al updatear el usuario: '+error, EErros.DATABASES_ERROR)
        }
    }

    /********* UPDATE USER STATUS *********/
    async updateUserStatus(email, status) {
        try {
            logger.info('user.service.js - updateUserStatus - modifico el status del usuario')
            await this.usersDAO.updateUserAndSetCamposByEmail(email, {status: status})
            return await this.getUserByEmailToBack(email)
        } catch (error) {
            logger.error('user.service.js - Error en updateUserStatus: '+error)
            throw new CustomError('Error al updatear el usuario: '+error, EErros.DATABASES_ERROR)
        }
    }

    /********* UPDATE USER LAST CONNECTION *********/
    async updateUserLastConnection(email, last_connection) {
        try {
            logger.info('user.service.js - updateUserLastConnection - modifico el last_connection del usuario')
            await this.usersDAO.updateUserAndSetCamposByEmail(email, {last_connection: last_connection})
            return await this.getUserByEmailToBack(email)
        } catch (error) {
            logger.error('user.service.js - Error en updateUserLastConnection: '+error)
            throw new CustomError('Error al updatear el usuario: '+error, EErros.DATABASES_ERROR)
        }
    }
    
    /********* DELETE USER *********/
    async deleteUser(id) {
        try {
            // Obtengo el array de users desde el archivo
            await this.getUsers()
            // Recorro el array de users y modifico los solicitados
            let isFound = false
            this.#_users.forEach(item => {
                if (item._id == id) {
                    isFound = true
                }
            })
            if (!isFound) throw new CustomError('No existe ningun user con ese id', EErros.DATA_NOT_FOUND_ERROR) 
            // Elimino el user
            await this.usersDAO.deleteOne(id)
            // Obtengo el nuevo array de users desde la base de datos
            const users = await this.getUsers()
            const userFound = users.find(item => item._id == id)
            // Busco el user a traves de la propiedad en el array
            if (userFound) {
                throw new CustomError('Error al eliminar el usuario')
            } else {
                return 'Usuario eliminado correctamente'
            }
        } catch (error) {
            logger.error('user.service.js - Error en deleteUser: '+error)
            throw new CustomError(error)
        }
    }                         

    /********* GET USER BY FIELD *********/
    async getUserByField(propiedad, valor) {
        // Obtengo el array de useros desde el archivo
        try {
            const users = await this.getUsers()
            const userFound = users.find(item => item[propiedad] == valor)
            // Busco el user a traves de la propiedad en el array
            if (userFound) {
                return userFound
            } else {
                throw new CustomError('No se encontró ningun user con '+propiedad+' = '+valor, EErros.DATA_NOT_FOUND_ERROR)
            }
        } catch (error) {
            logger.error('user.service.js - Error en getUserByField: '+error)
            throw new CustomError('Error al realizar la solicitud de busqueda de usuarios.', EErros.DATA_NOT_FOUND_ERROR)
        }
    }

    /********* UPLOAD USER DOCUMENTS *********/
    async uploadUserDocuments(userId, documentPath, nameOfFile) {
        try {
            logger.info('user.service.js - uploadUserDocuments - start')
            logger.info('user.service.js - uploadUserDocuments - actualizo el usuario')
            const updatedUser = await this.usersDAO.findByIdAndUploadDocuments(userId, documentPath, nameOfFile);
            if (!updatedUser) {
                logger.error('user.service.js - uploadUserDocuments - Error al actualizar el usuario')
                throw new Error('Usuario no encontrado.');
            }
            return updatedUser;
        } catch (error) {
            logger.error('user.service.js - Error en uploadUserDocuments: '+error)
            throw new CustomError('Error al querer actualizar el usuario.', EErros.DATA_NOT_FOUND_ERROR)
        }
    }

}

export default UserService;
