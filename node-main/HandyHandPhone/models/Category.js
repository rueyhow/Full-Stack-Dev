const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const category = db.define('category',
    {
        name :{type: Sequelize.STRING , primaryKey : true},
    }); 

module.exports = category;