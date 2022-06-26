const Sequelize = require('sequelize');
const db = require('../config/DBConfig');

// Create users table in MySQL Database
const User = db.define('user',
    {
        name: { type: Sequelize.STRING },
        email: { type: Sequelize.STRING },
        verified: { type: Sequelize.BOOLEAN },
<<<<<<< Updated upstream
        password: { type: Sequelize.STRING },
        mobile : {type:Sequelize.INTEGER},
        member : {type:Sequelize.BOOLEAN},
        admin : {type:Sequelize.BOOLEAN},
        description : {type:Sequelize.STRING , allowNull : true},
        profilePicture : {type:Sequelize.STRING , allowNull : true}
    }); 
=======
        password: { type: Sequelize.STRING }
    });  
>>>>>>> Stashed changes

module.exports = User;