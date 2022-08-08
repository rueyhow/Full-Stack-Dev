const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Orderstatus = db.define('orderstatus',
    {
        date: { type: Sequelize.DATEONLY},
        orderstatus: { type: Sequelize.STRING},
        ordernumber: { type: Sequelize.INTEGER},
        a: { type: Sequelize.BOOLEAN}

    }); 

module.exports = Orderstatus;