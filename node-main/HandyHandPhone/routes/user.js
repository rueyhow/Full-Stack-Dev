const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const mySQLDB = require('../config/DBConfig');

// Required for email verification
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { NONE, DatabaseError } = require('sequelize');
const fs = require("fs");
const ensureAuthenticated = require('../helpers/auth');
require('../helpers/auth2');
const Ticket = require("../models/Ticket").Ticket;

const sgMail = require('@sendgrid/mail');

function sendEmail(toEmail, url1) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        templateId: "d-b16b1c206dd14343ae5f5429430c92e3",
        from: `Handy Hand Phone <${process.env.SENDGRID_SENDER_EMAIL}>`,
        personalizations: [
            {
              to: toEmail,
              dynamic_template_data: {
                url: url1
              },
            },
          ],
    };

    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
        sgMail.send(message)
            .then(response => resolve(response))
            .catch(err => reject(err));
    });
}

router.get('/login', (req, res) => {
    res.render('user/login');
});

router.get('/register', (req, res) => {
    res.render('user/register');
});

router.post('/register', async function (req, res) {
    let { name, email, password} = req.body;

    let isValid = true;
    if (password.length < 6) {
        flashMessage(res, 'error', 'Password must be at least 6 char-acters');
        isValid = false;
    }
    if (!isValid) {
        res.render('user/register', {
            name, email
        });
        return;
    }

    try {
        // If all is well, checks if user is already registered
        let user = await User.findOne({ where: { email: email } });
        if (user) {
            // If user is found, that means email has already been registered
            flashMessage(res, 'error', email + ' already registered');
            res.render('user/register', {
                name, email
            });
        }
        else {
            // Create new user record 
            var salt = bcrypt.genSaltSync(10);
            var hash = bcrypt.hashSync(password, salt);
            // Use hashed password
            let user = await User.create({ name, email, password: hash, verified: 0 , mobile : 0 , member : false , admin : false, description : null , profilePicture : "none" , websitePoints : 0});

            // Send email
            let token = jwt.sign(email, process.env.APP_SECRET);
            let url = `${process.env.BASE_URL}:${process.env.PORT}/user/verify/${user.id}/${token}`;
            sendEmail(user.email, url)
                .then(response => {
                    console.log(response);
                    flashMessage(res, 'success', "Please verify " + user.email + " before accessing your handy hand phone account");
                    res.redirect('/user/login');
                })
                .catch(err => {
                    console.log(err);
                    flashMessage(res, 'error', 'Error when sending email to ' + user.email);
                    res.redirect('/');
                });
        }
    }
    catch (err) {
        console.log(err);
    }
});

// verify user with jwt token
router.get('/verify/:userId/:token', async function (req, res) {
    let id = req.params.userId;
    let token = req.params.token;

    try {
        // Check if user is found
        let user = await User.findByPk(id);
        if (!user) {
            flashMessage(res, 'error', 'User not found');
            res.redirect('/user/login');
            return;
        }
        // Check if user has been verified
        if (user.verified) {
            flashMessage(res, 'info', 'User already verified');
            res.redirect('/user/login');
            return;
        }
        // Verify JWT token sent via URL 
        let authData = jwt.verify(token, process.env.APP_SECRET);
        if (authData != user.email) {
            flashMessage(res, 'error', 'Unauthorised Access');
            res.redirect('/user/login');
            return;
        }

        let result = await User.update(
            { verified: 1 },
            { where: { id: user.id } });
        console.log(result[0] + ' user updated');
        flashMessage(res, 'success', user.email + ' verified. Please login');
        res.redirect('/user/login');
    }
    catch (err) {
        console.log(err);
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        // Success redirect URL
        successRedirect: '/',
        // Failure redirect URL 
        failureRedirect: '/user/login',
        /* Setting the failureFlash option to true instructs Passport to flash 
        an error message using the message given by the strategy's verify callback.
        When a failure occur passport passes the message object as error */
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});


// profile page routes
router.get('/profilePage/:id' ,ensureAuthenticated, async(req,res) => {
    const TicketData = await Ticket.findAll({where:{userId : req.user.dataValues.id}});
    res.render('user/profilePage' , {TicketData : TicketData});
});


router.post('/profilePage/:id' ,ensureAuthenticated, (req,res) =>{
    var buffer = require('buffer/').Buffer;
    let { name, email, mobile,description } = req.body;

    var img = req.files.img.data;

    var userID = req.params.id;
    console.log(img);

    let base64 = buffer.from(img).toString('base64')

    
    var query = 
    `UPDATE users
    SET name = "${name}",
    mobile = "${mobile}",
    email = "${email}",
    description = "${description}",
    profilePicture = "${base64}"
    WHERE id = "${userID}"
    `;
    mySQLDB.query(query , function(error,data){
        console.log('hello');
        if(error)
        {
            res.redirect('/');
            flashMessage(res, "error" , "Error has occured");
            throw error;
        }
        else
        {
            res.redirect('user//profilePage/:id');
        }
    });
    flashMessage(res, "success" , "account details has been updated successfully");
    res.redirect('/');
});

// google authentication


router.get('/auth/google', passport.authenticate('google' , {scope : ['email' , 'profile']}));

router.get('/google/callback' , passport.authenticate('google' , {successRedirect : '/', failureRedirect : '/user/auth/failure' , failureMessage : true}) , (req,res) =>{

});


router.get('/auth/failure' , (req,res)=>{
    flashMessage(res, "error" , "Email has not been verified or you have not created your account");
    res.redirect("/");
})
module.exports = router;
