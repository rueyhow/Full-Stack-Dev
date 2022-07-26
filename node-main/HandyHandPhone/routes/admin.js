const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const User = require('../models/User');
const mySQLDB = require('../config/DBConfig');
const { urlencoded } = require('express');
const Feedback = require('../models/Feedback');

router.get('/updateUsers', function (req, res, next) {
    User.findAll()
        .then((data) => {
            res.render('admin/updateUsers', { sampleData: data })
        })
        .catch(err => console.log(err));
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

router.get('/viewfeedback', (req, res) => {
    Feedback.findAll()
        .then((data) => {
            res.render("admin/viewfeedback", { feedbackdata: data });
        })
        .catch(err => console.log(err));

})
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

module.exports = router;