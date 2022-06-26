const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Feedback = db.define('feedback',
    {
        id :{type: Sequelize.INTEGER , primaryKey : true , autoIncrement:true },
        name: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        subject: { type: Sequelize.STRING },
        message: { type: Sequelize.STRING },
        status : {type: Sequelize.BOOLEAN}
    }); 

module.exports = Feedback;