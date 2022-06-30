const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create users table in MySQL Database
class User extends Sequelize.Model {}

User.init(
    {
        name: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        verified: { type: Sequelize.BOOLEAN },
        password: { type: Sequelize.STRING },
        mobile : {type:Sequelize.INTEGER},
        member : {type:Sequelize.BOOLEAN},
        admin : {type:Sequelize.BOOLEAN},
        description : {type:Sequelize.STRING , allowNull : true},
        profilePicture : {type:Sequelize.STRING , allowNull : true}
    },
    {
        sequelize: db,
        modelName: "user"
    }); 

module.exports = User;