import { fakerES as faker } from '@faker-js/faker';

export const generateProduct = () => {
    return {
        _id: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price(),
        thumbnail: faker.image.url(),
        code: faker.string.numeric({length:4, prefix: '#'}),
        stock: faker.number.int({min: 0, max: 100}),
        category: faker.commerce.department(),
        status: faker.datatype.boolean(0.9),
    }
}