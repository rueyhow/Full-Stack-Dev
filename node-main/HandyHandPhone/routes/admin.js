const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const User = require('../models/User');
const mySQLDB = require('../config/DBConfig');
const { urlencoded } = require('express');
const Feedback = require('../models/Feedback');
const Ticket = require("../models/Ticket").Ticket;
const Response = require("../models/Ticket").Response;
const Permissions = require("../models/Ticket").Permissions;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const ensureAuthenticated = require('../helpers/auth');
const Transaction = require('../models/Transaction');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
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

// history page
router.get('/history' , ensureAuthenticated,async function (req, res){
    const OrderHistory = await Transaction.findAll({where : {transactionCategory : "order"}});
    const VoucherHistory = await Transaction.findAll({where : {transactionCategory : "Voucher Purchase"}});
    res.render("admin/history" , {OrderHistory : OrderHistory, VoucherHistory : VoucherHistory})
});
router.get('/AdminPage', async (req, res, next) => {

    const sampleData = await User.findAll();
    const data = await Feedback.findAll();
    const TicketData = await Ticket.findAll();
    res.render('admin/AdminPage', { sampleData: sampleData, feedbackdata: data, TicketData: TicketData });
});


router.post('/AdminPage', async (req, res) => {
    let { name, email, password } = req.body;

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
            let user = await User.create({ name, email, password: hash, verified: 0, mobile: 0, member: false, admin: true, description: null, profilePicture: "none", websitePoints: 0 });

            // Send email
            let token = jwt.sign(email, process.env.APP_SECRET);
            let url = `${process.env.BASE_URL}:${process.env.PORT}/user/verify/${user.id}/${token}`;
            sendEmail(user.email, url)
                .then(response => {
                    console.log(response);
                    flashMessage(res, 'success', "Please verify " + user.email + " before accessing your handy hand admin account");
                    res.redirect('back');
                })
                .catch(err => {
                    console.log(err);
                    flashMessage(res, 'error', 'Error when sending email to ' + user.email);
                    res.redirect('back');
                });
        }
    }
    catch (err) {
        console.log(err);
    }
});

router.get('/updateAdmin/:id', (req, res) => {
    var id = req.params.id;
    User.findByPk(id)
        .then((user) => {
            if (user.admin == false) {
                User.update({ admin: true }, { where: { id: id } });
                flashMessage(res, "success", "User member updated");
                res.redirect("back");
            }
            else if (user.admin == true) {
                User.update({ admin: false }, { where: { id: id } });
                flashMessage(res, "success", "User member updated");
                res.redirect("back");
            }
        })
        .catch(err => console.log(err));
});

router.get('/updateMember/:id', (req, res) => {
    var id = req.params.id;
    User.findByPk(id)
        .then((user) => {
            if (user.member == false) {
                User.update({ member: true }, { where: { id: id } });
                res.redirect("back");
                flashMessage(res, "success", "User member updated");
            }
            else if (user.member == true) {
                User.update({ member: false }, { where: { id: id } });
                res.redirect("back");
                flashMessage(res, "success", "User member updated");
            }
        })
        .catch(err => console.log(err));
});

router.get('/updateUserFromAdmin/:id', (req, res) => {
    var id = req.params.id;
    User.findByPk(id)
        .then((user) => {
            res.render("admin/updateUserFromAdmin", { user: user });
        });
});

router.post('/updateUserFromAdmin/:id', (req, res) => {
    let { name, email, mobile, description } = req.body;
    var id = req.params.id;
    User.update({ name, email, mobile, description }, { where: { id: id } })
        .then((result) => {
            User.findByPk(id)
                .then((user) => {
                    flashMessage(res, "success", user.name + " has been updated");
                    res.redirect('back');
                })
        })
});

router.post('/feedback', async function (req, res) {
    let { name, email, subject, message } = req.body;
    // renders views/index.handlebars, passing title as an object
    let feedback = await Feedback.create({ name, email, subject, message, status: false });
    flashMessage(res, "success", "Feedback sent successfully");
    res.redirect("back");
});


// router.get('/deletefeedback/:id' , (req,res)=>{

// })
router.get('/deletefeedback/:id', (req, res) => {
    var id = req.params.id;
    Feedback.findByPk(id)
        .then((feedback) => {
            if (feedback.status == true) {
                Feedback.destroy({ where: { id: id } });
                flashMessage(res, "success", "feedback deleted");
                res.redirect("back");
            }
            else if (feedback.status == false) {
                flashMessage(res, "error", "feedback has not been replied to");
                res.redirect("back");
            }
        })

});

router.get('/charts', ensureAuthenticated, async (req, res) => {
    const VoucherTransaction = await Transaction.findAll({ where: { transactionCategory: "Voucher Purchase" } });
    res.render('admin/charts')

});
module.exports = router;