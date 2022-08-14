const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

class Product extends Sequelize.Model { }

Product.init(
    {
        name: { type: Sequelize.STRING },
        category: { type: Sequelize.STRING },
        price: { type: Sequelize.DECIMAL },
        stock: { type: Sequelize.INTEGER },
        description: { type: Sequelize.STRING },
        productPic: { type: Sequelize.TEXT('medium') }
    },
    {
        sequelize: db,
        modelName: "product"
    });

Product.sync({ alter: true })
module.exports = Product;