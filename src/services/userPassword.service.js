import { userPasswordCollection } from '../dao/models/usersPasswords.model.js'
import UserDTO from '../dao/DTOs/user.dto.js'
import CustomError from './errors/customError.js'
import EErros from './errors/enums.js'
import PersistenceFactory from '../dao/persistenceFactory.js'
import { logger } from '../app.js'

const persistanceFactory = new PersistenceFactory()

class UserPasswordService {
    #_users
    constructor() {
        this.#_users = []
        this.usersPasswordDAO = null
        this.init();
    }

    init = async() => {
        try {
            const PersistenceFactory = await persistanceFactory.getPersistence(userPasswordCollection) 
            const persistance = new PersistenceFactory()
            this.usersPasswordDAO = persistance;
        } catch (error) {
            throw new CustomError('userPassword.service.js - Error al leer la persistencia: ' + error, EErros.DATABASES_ERROR);
        }
    }

    /********* GET USERS TO RESET *********/    
    async getUsersToReset() {
        // Leo la base de datos y retorno los useros
        try {
            let users = await this.usersPasswordDAO.find() 
            if (users.length === 0) return [];
            this.#_users = users
        } catch (error) {
            logger.error('userPassword.service.js - Error en getUsersToReset: '+error)
            throw new CustomError('Error al buscar los users a resetear en la base de datos:'+error, EErros.DATA_NOT_FOUND_ERROR)
        }
        return this.#_users
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
        logger.error('userPassword.service.j - Error en getUserByEmailToBack: '+error)
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
            logger.error('userPassword.service.j - Error en getUserByEmail: '+error)
            throw new CustomError('Error al buscar el usuario a con email: '+emailValue, EErros.DATA_NOT_FOUND_ERROR)
        }
    }

    /********* ADD USER *********/
    async addUserToReset(userToReset, token) {
        // Compruebo que esten todos los campos necesarios
        if (!userToReset||!token) {
            throw new CustomError('No estan informados todos los campos necesarios para resetear la contraseña del usuario', EErros.MISSING_FIELDS_ERROR)
        }
        // Chequeo que el email no exista. Si existe, actualizo el ya existente, sino, agrego el userToReset a la bd
        try {
            const userFound = await this.usersPasswordDAO.findOne(userToReset)     
            if(userFound) {
                // Actualizo el userToReset ya existente en la base de datos
                const fechaHoraActual = new Date();
                let newuser = await this.usersPasswordDAO.updateUserAndSetCampos(userToReset, {token: token, createdAt: fechaHoraActual})
                return newuser
            } else {
                // Creamos el userToReset en la base de datos
                const newUserToReset = {email: userToReset, token: token}
                let newuser = await this.usersPasswordDAO.createNew(newUserToReset);
                return newuser
            }
        } catch (error) {
            logger.error('userPassword.service.j - Error en addUserToReset: '+error)
            throw new CustomError('Error al crear el usuario: '+error, EErros.DATABASES_ERROR)
        }
    }  
    
    /********* UPDATE USER *********/
    async updateUser(id, campos) {
        try {
            // Creo el objeto del usero modificado (let updateduser = )
            await this.usersPasswordDAO.updateOne(id, campos)
            return (await this.getusers()).find(item => item._id.toString() === id)
        } catch (error) {
            logger.error('userPassword.service.j - Error en updateUser: '+error)
            throw new CustomError('Error al updatear el usuario: '+error, EErros.DATABASES_ERROR)
        }
    }
    
    /********* DELETE USER *********/
    async deleteUser(email) {
        try {
            // Obtengo el usuario y si no lo encuentro, devuelvo error
            const userFound = await this.getUserByEmail(email)
            if (!userFound) throw new CustomError('No existe ningun user con ese id', EErros.DATA_NOT_FOUND_ERROR) 
            // Elimino el user
            await this.usersPasswordDAO.deleteOne(email)
            // Obtengo el nuevo array de users desde la base de datos
            return this.getUsersToReset()
        } catch (error) {
            logger.error('userPassword.service.j - Error en deleteUser: '+error)
            throw new CustomError(error)
        }
    }                         

    async getUserByField(propiedad, valor) {
        // Obtengo el array de useros desde el archivo
        try {
            const users = await this.getUsersToReset()
            const userFound = users.find(item => item[propiedad] == valor)
            // Busco el user a traves de la propiedad en el array
            if (userFound) {
                return userFound
            } else {
                logger.error('No se encontró ningun user con '+propiedad+' = '+valor, EErros.DATA_NOT_FOUND_ERROR)
                return null
            }
        } catch (error) {
            logger.error('userPassword.service.j - Error en getUserByField: '+error)
            throw new CustomError('Error al realizar la solicitud de busqueda de usuarios.', EErros.DATA_NOT_FOUND_ERROR)
        }
    }

}

export default UserPasswordService;
