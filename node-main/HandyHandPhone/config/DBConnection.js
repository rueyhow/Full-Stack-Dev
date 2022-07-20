const mySQLDB = require('./DBConfig');
const User = require('../models/User');
const Orderstatus = require('../models/Orderstatus');
const Deliverydetails = require('../models/Deliverydetails');
const Voucher = require('../models/Voucher');

// const Video = require('../models/Video');
const Product = require('../models/Product');

// If drop is true, all existing tables are dropped and recreated 
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            // ensure user can create /  buy multiple vouchers
            User.hasMany(Voucher);
            Voucher.belongsTo(User);



            mySQLDB.sync({
                force: drop
            });
        })
        .catch(err => console.log(err));
};

module.exports = { setUpDB };