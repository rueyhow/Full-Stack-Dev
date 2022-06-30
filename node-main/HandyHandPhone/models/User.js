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
<<<<<<< HEAD
        profilePicture : {type:Sequelize.STRING , allowNull : true}
    },
    {
        sequelize: db,
        modelName: "user"
    }); 
=======
        profilePicture : {type:Sequelize.STRING , allowNull : true},
        websitePoints : {type:Sequelize.INTEGER},
    });  

>>>>>>> 577bbbebbba4acc7e28e270a30bac012f227e48d

module.exports = User;