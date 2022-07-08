const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User')


class Ticket extends Sequelize.Model {}

Ticket.init(
    {
        ticketId : {
            type: Sequelize.INTEGER , primaryKey : true , allowNull : false , autoIncrement : true
        },
        message: {
            type: Sequelize.STRING
        },
        type : {
            type: Sequelize.STRING
        },
        category : {
            type: Sequelize.STRING
        },
        status : {
            type: Sequelize.BOOLEAN
        }
    },
    { 
        sequelize: db, 
        modelName: "Ticket"
    });
Ticket.belongsTo(User, { foreignKey: "userId"})
User.hasMany(Ticket, { foreignKey: "userId" })

class Response extends Sequelize.Model {}

Response.init(
    {
        ResponseId : {
            type: Sequelize.INTEGER , primaryKey : true , allowNull : false , autoIncrement : true
        },
        senderId : {
            type: Sequelize.INTEGER
        },
        reply: {
            type: Sequelize.STRING
        }
    },
    { 
        sequelize: db, 
        modelName: "Response"
    });

Response.belongsTo(Ticket , {foreignKey: "ticketId"})
Ticket.hasMany(Response , {foreignKey : "ticketId"})

module.exports = {Ticket , Response};