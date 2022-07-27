const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User')


class Vouchers extends Sequelize.Model { }

Vouchers.init({
    VoucherCategory: {
        type: Sequelize.STRING, allowNull: false
    },
    VoucherName: {  type: Sequelize.STRING  , allowNull: false 
    },
    description : {
        type: Sequelize.STRING
    },
    discount : {
        type : Sequelize.FLOAT , allowNull: false
    },
    price : {
        type : Sequelize.INTEGER
    }
}, 
{
    sequelize: db,
    modelName: "Vouchers"
})


class UserVouchers extends Sequelize.Model { }

UserVouchers.init({
    VoucherCode: {
        type: Sequelize.STRING, required: false, unique: true
    },
    VoucherCategory: {
        type: Sequelize.STRING, allowNull: false
    },
    discount: {
        type: Sequelize.FLOAT, allowNull: false
    },
    expiryDate: {
        type: Sequelize.DATE, allowNull: false
    },
    description : {
        type: Sequelize.STRING, allowNull: false
    },
    promotion:{
        type: Sequelize.STRING, allowNull: true
    }, 
    expired :  {
        type : Sequelize.BOOLEAN , defaultValue : false
    }

},
    {
        sequelize: db,
        modelName: "UserVouchers"
    }
)

UserVouchers.belongsTo(User, { foreignKey: "userId" })
User.hasMany(UserVouchers, { foreignKey: "userId" })

module.exports = {UserVouchers , Vouchers};