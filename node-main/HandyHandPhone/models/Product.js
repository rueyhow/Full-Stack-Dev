const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

class Product extends Sequelize.Model {}

Product.init(
    {
        name: { type: Sequelize.STRING },
        price: { type: Sequelize.DECIMAL },
        stock: { type: Sequelize.INTEGER },
        description: { type: Sequelize.STRING }
    },
    {
        sequelize: db,
        modelName: "product"
    }); 

module.exports = Product;