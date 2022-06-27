const Sequelize = require('sequelize');
const db = require('../config/DBConfig');


const Voucher = db.define('vouchers',
{
    id :{type: Sequelize.INTEGER , primaryKey : true , autoIncrement:true },
    category : {type: Sequelize.STRING},
    type : {type: Sequelize.STRING},
    percentage : {type: Sequelize.INTEGER},
    description : {type: Sequelize.STRING},
    price:{type:Sequelize.INTEGER}
});



module.exports = Voucher;