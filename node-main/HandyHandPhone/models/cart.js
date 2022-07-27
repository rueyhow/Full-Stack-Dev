const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User')
const Product = require('./Product')

class CartItem extends Sequelize.Model {}

CartItem.init(
    {
        quantity: {
            type: Sequelize.INTEGER,
            defaultValue: 1
        }
    },
    { 
        sequelize: db, 
        modelName: "cart_item"
    });

CartItem.belongsTo(User, { foreignKey: "userId"})
User.hasMany(CartItem, { foreignKey: "userId" })

CartItem.belongsTo(Product, { foreignKey: "productId" })
Product.hasMany(CartItem, { foreignKey: "productId" })

module.exports = CartItem;
