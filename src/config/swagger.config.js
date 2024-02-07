import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUiExpress from 'swagger-ui-express';

export const swaggerInit = (app) => {
    const swaggerOptions = {
        definition: {
            openapi: "3.0.1", // aca se refiere a la specification de la herramienta que vamos a utilizar
            info: {
                title: "Documentacion de Ecommerce",
                description: "API de un Ecommerce con registro de usuarios, realización de ordenes de compra y chat grupal"
            }
        },
        apis: [`./docs/**/*.yaml`]    
    }
    const specs = swaggerJsdoc(swaggerOptions);
    app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))
}