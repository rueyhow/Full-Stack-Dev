const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

const Schedule = db.define('schedule',
    {
        date: { type: Sequelize.DATEONLY },
        time: { type: Sequelize.INTEGER },
        isAvailable: { type: Sequelize.BOOLEAN }

    });
console.log("The table for the Schedule model was just (re)created!");

module.exports = Schedule;