
import { env_parameters_obj } from '../config/env.config.js';
import CustomError from '../services/errors/customError.js';

export default class PersistenceFactory {
    getPersistence = async (collection) => {
        switch (env_parameters_obj.app.persistence) {
            case 'ARRAY': // inactiva
                let { default: DAOarray } = await import(`./${collection}.array.js`)
                return new DAOarray
            case 'FILE': // inactiva
                let { default: DAOfile } = await import(`./${collection}.file.js`)
                return new DAOfile
            case 'MONGO':
                try {
                    let { default: DAOdb } = await import(`./mongoDAO/${collection}.dao.js`)
                    return DAOdb;
                } catch (error) {
                    throw new CustomError(`Error al crear la instancia de DAODB: ${error}`);
                }
            default:
                throw new CustomError(`Tipo de persistencia no reconocido: ${env_parameters_obj.app.persistence}`);
        }
    }
}