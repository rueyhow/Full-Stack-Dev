const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

function localStrategy(passport) {
    passport.use(
        new LocalStrategy({usernameField: 'email' }, (email, password , done) => {
            console.log("passport login")
            User.findOne({ where: { email: email }})
                .then(user => {
                    console.log("login" + user)
                    if (!user) {
                        return done(null, false, { message: 'No User Found' });
                    }
                    if (!user.verified) {
                        return done(null, false, { message: 'Email not verified' });
                    }
                    // Match password
                    isMatch = bcrypt.compareSync(password, user.password);
                    if (!isMatch) {
                        return done(null, false, { message: 'Password incorrect' });
                    }
                    return done(null, user);
                })
        }));

    // Serializes (stores) user id into session upon successful 
    // authentication 
    passport.serializeUser((user, done) => {
        // user.id is used to identify authenticated user 
        done(null, user.id);
    });

    // User object is retrieved by userId from session and 
    // put into req.user 
    passport.deserializeUser((userId, done) => {
        User.findByPk(userId)
            .then((user) => {
                done(null, user);
                // user object saved in req.session 
            })
            .catch((done) => {
                // No user found, not stored in req.session 
                console.log(done);
            });
    });
}
module.exports = { localStrategy };