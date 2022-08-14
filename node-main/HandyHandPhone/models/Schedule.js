const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Schedule = db.define('schedule',
    {
        date: { type: Sequelize.DATEONLY },
        time: { type: Sequelize.STRING },
        availability: { type: Sequelize.STRING }

    });
    
module.exports = Schedule;