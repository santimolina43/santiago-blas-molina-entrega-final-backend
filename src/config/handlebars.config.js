
import handlebars from 'express-handlebars'

export const setHandlebars = (app) => {
    // Configuración de Handlebars
    const hbs = handlebars.create({
        // Configuración adicional de Handlebars
    });

    // Registro el helper de handlebars para evaluar si el usuario es admin o premium 
    hbs.handlebars.registerHelper('isAdminOrUserPremium', function (value) {
        if (value === "admin" || value === "premium") return true
        return false;
    });

    // Registro el helper de handlebars para evaluar si el usuario es user o premium
    hbs.handlebars.registerHelper('isUserOrUserPremium', function (value) {
        if (value === "user" || value === "premium") return true
        return false;
    });

    // Registro el helper de handlebars para evaluar si el usuario tiene cargada la documentacion de identificacion
    hbs.handlebars.registerHelper('hasIdentificationDoc', function (documents) {
        if (documents.find(doc => doc.name === "identification")) return true
        return false;
    });

    // Registro el helper de handlebars para evaluar si el usuario tiene cargada la documentacion de identificacion
    hbs.handlebars.registerHelper('hasProofOfAddressDoc', function (documents) {
        if (documents.find(doc => doc.name === "proofOfAddress")) return true
        return false;
    });

    // Registro el helper de handlebars para evaluar si el usuario tiene cargada la documentacion de identificacion
    hbs.handlebars.registerHelper('hasBankStatementDoc', function (documents) {
        if (documents.find(doc => doc.name === "bankStatement")) return true
        return false;
    });

    // Registro el helper de handlebars para calcular el subtotal por producto
    hbs.handlebars.registerHelper('subTotal', function (quantity, price) {
        return (quantity * price)
    });

    // Registro el helper de handlebars para calcular el subtotal por producto
    hbs.handlebars.registerHelper('returnProfilePhotoUrl', function (documents) {
        const profilePhotoDocument = documents.find(doc => doc.name === 'profilePhoto');
        return profilePhotoDocument ? profilePhotoDocument.reference : '';
    });

    // Registro el helper de handlebars para calcular el total del carrito
    hbs.handlebars.registerHelper('calculateTotal', function (products) {
        let totalAmount = 0
        products.forEach(item => {
            const precioProducto = item.product.price;
            const cantidadProducto = item.quantity;
            // Suma el producto de la cantidad por el precio de cada producto al total
            totalAmount += precioProducto * cantidadProducto;
        })
        return totalAmount
    });

    // Registro el helper de handlebars para añadir productos al carrito
    hbs.handlebars.registerHelper('addProduct', function (stock, quantity) {
        if (stock > quantity) return true
        return false
    });

    // Registro el helper de handlebars para restar productos carrito
    hbs.handlebars.registerHelper('restProduct', function (stock, quantity) {
        if ((quantity - 1)  > 0) return true
        return false
    });

    app.engine('handlebars', handlebars.engine())
    app.set('views', './src/views')
    app.set('view engine', 'handlebars')
}
