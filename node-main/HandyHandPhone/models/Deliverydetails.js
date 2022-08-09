const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Deliverydetails = db.define('deliverydetails',
    {
        firstname: { type: Sequelize.STRING},
        lastname: { type: Sequelize.STRING},
        unitnumber: { type: Sequelize.STRING},
        address: { type: Sequelize.STRING},
        phone: { type: Sequelize.STRING}

    }); 

module.exports = Deliverydetails;