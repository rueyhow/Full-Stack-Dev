const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User');


class Transaction extends Sequelize.Model { }

Transaction.init({
    transactionId : {
        type: Sequelize.INTEGER , primaryKey: true , allowNull : false , autoIncrement : true ,
    }, 
    transactionCategory : {
        type : Sequelize.STRING , allowNull : false
    }, 
    price : {
        type : Sequelize.INTEGER , allowNull : false
    }, 
    information : {
        type : Sequelize.STRING , allowNull : false
    }, 
    completed : {
        type : Sequelize.BOOLEAN , allowNull : true
    },
    items : {
        type : Sequelize.JSON , allowNull : true  , unique : false , defaultValue : null
    },
    address : {
        type : Sequelize.JSON , allowNull : true  , unique : false , defaultValue : null
    },
    voucher : {
        type : Sequelize.JSON , allowNull : true  , unique : false , defaultValue : null
    }
},
{
    sequelize: db,
    modelName: "Transaction"
});

Transaction.belongsTo(User, { foreignKey: "userId" })
User.hasMany(Transaction, { foreignKey: "userId" })

module.exports = Transaction;