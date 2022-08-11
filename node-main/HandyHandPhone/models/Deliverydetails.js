const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User')


class Deliverydetails extends Sequelize.Model {}

Deliverydetails.init(
    {
        firstname: { type: Sequelize.STRING},
        lastname: { type: Sequelize.STRING},
        unitnumber: { type: Sequelize.STRING},
        address: { type: Sequelize.STRING},
        phone: { type: Sequelize.STRING}

    },
    { 
        sequelize: db, 
        modelName: "deliverydetails"
    });



Deliverydetails.belongsTo(User, { foreignKey: "userId"})
User.hasMany(Deliverydetails, { foreignKey: "userId" })
    
module.exports = Deliverydetails;