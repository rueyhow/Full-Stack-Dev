const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Product = db.define('product',
    {
        name: { type: Sequelize.STRING },
        price: { type: Sequelize.DECIMAL },
        stock: { type: Sequelize.INTEGER },
        description: { type: Sequelize.STRING }
    }); 

module.exports = Product;