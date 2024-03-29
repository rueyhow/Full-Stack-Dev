const mySQLDB = require('./DBConfig');
const User = require('../models/User');

const Voucher = require('../models/Voucher')


const Product = require('../models/Product');

const Orderstatus = require('../models/Orderstatus');
const Deliverydetails = require('../models/Deliverydetails');
const Schedule = require('../models/Schedule');

// If drop is true, all existing tables are dropped and recreated 
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            // ensure user can create /  buy multiple vouchers
            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};

module.exports = { setUpDB };