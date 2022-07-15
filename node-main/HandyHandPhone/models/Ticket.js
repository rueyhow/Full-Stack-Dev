const Sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User')


class Ticket extends Sequelize.Model { }

Ticket.init(
    {
        ticketId: {
            type: Sequelize.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true
        },
        message: {
            type: Sequelize.STRING
        },
        type: {
            type: Sequelize.STRING
        },
        category: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.BOOLEAN
        },
        assigned:
        {
            type: Sequelize.BOOLEAN
        },
        completedReason: {
            type: Sequelize.STRING, allowNull: true
        }
    },
    {
        sequelize: db,
        modelName: "Ticket"
    });
Ticket.belongsTo(User, { foreignKey: "userId" })
User.hasMany(Ticket, { foreignKey: "userId" })

class Response extends Sequelize.Model { }

Response.init(
    {
        ResponseId: {
            type: Sequelize.INTEGER, primaryKey: true, allowNull: false, autoIncrement: true
        },
        senderId: {
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

Response.belongsTo(Ticket, { foreignKey: "ticketId" })
Ticket.hasMany(Response, { foreignKey: "ticketId" })


class Permissions extends Sequelize.Model { }

Permissions.init(
    {
        TicketID:
        {
            type: Sequelize.INTEGER,
        },
        AdminID:
        {
            type: Sequelize.INTEGER, allowNull: false
        },
        AdminName:
        {
            type: Sequelize.STRING, allowNull: false
        },
        level:
        {
            type: Sequelize.INTEGER, allowNull: false
        }

    },
    {
        sequelize: db,
        modelName: "Permissions"
    }
)

Permissions.belongsTo(Ticket, { foreignKey: "ticketId" })
Ticket.hasMany(Permissions, { foreignKey: "ticketId" })



// uploaded images in ticket 
class TicketImages extends Sequelize.Model { }

TicketImages.init({
    ResponseId : {
        type: Sequelize.INTEGER, allowNull : false
    },
    base64: {
        type: Sequelize.STRING, allowNull: false
    }
},
    {
        sequelize: db,
        modelName: "TicketImages"
    }
)

TicketImages.belongsTo(Response, { foreignKey: "ResponseId" })
Response.hasMany(TicketImages, { foreignKey: "ResponseId" })


module.exports = { Ticket, Response, Permissions  , TicketImages};