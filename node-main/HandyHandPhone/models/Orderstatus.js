const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const orderstatus = db.define('orderstatus',
    {
        date: { type: Sequelize.DATEONLY},
        orderstatus: { type: Sequelize.STRING},
        ordernumber: { type: Sequelize.INTEGER}

    }); 

module.exports = orderstatus;