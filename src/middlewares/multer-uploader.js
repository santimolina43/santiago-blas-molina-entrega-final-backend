import multer from 'multer'
import { logger } from '../app.js';

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        // Define la lógica para seleccionar la carpeta de destino según el tipo de archivo
        let destinationFolder = 'src/public/imgs/'; // Carpeta predeterminada

        if (req.fileType === 'profile') {
            destinationFolder = 'src/public/imgs/profiles/';
        } else if (req.fileType === 'product') {
            destinationFolder = 'src/public/imgs/products/';
        } else if (req.fileType === 'document') {
            destinationFolder = 'src/public/documents/';
        }

        cb(null, destinationFolder);
    },
    filename: function(req, file, cb) {
        cb(null, file.originalname)
    }                              
})

// Middleware de multer
export const uploader = multer({ storage });

// Middleware para fotos de perfil
export const uploaderProfilePhoto = (req, res, next) => {
    logger.info('multer-uploader.js - uploaderProfilePhoto - start')
    req.fileType = 'profile';
    uploader.single('thumbnail')(req, res, next);
};

// Middleware para fotos de producto
export const uploaderProductPhoto = (req, res, next) => {
    logger.info('multer-uploader.js - uploaderProductPhoto - start')
    req.fileType = 'product';
    uploader.single('thumbnail')(req, res, next);
};

export const uploaderDocument = (req, res, next) => {
    logger.info('multer-uploader.js - uploaderDocument - start')
    req.fileType = 'document';
    uploader.fields([
        { name: 'identification', maxCount: 1 },
        { name: 'proofOfAddress', maxCount: 1 },
        { name: 'bankStatement', maxCount: 1 }
    ])(req, res, next);
};

export const uploaderThumbnail = uploader.single('thumbnail')