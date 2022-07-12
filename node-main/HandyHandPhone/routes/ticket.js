const express = require('express');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const router = express.Router();
const Ticket = require("../models/Ticket").Ticket;
const Response = require("../models/Ticket").Response;
const Permissions = require("../models/Ticket").Permissions;
const os = require("os");
const User = require('../models/User');
// send request email

const sgMail = require('@sendgrid/mail');

function sendRequest(toEmail, url1, userId, id, name) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
        to: toEmail,
        templateId: "d-333db1aa5eb5480d8f9d9895a9dcad12",
        from: `Handy Hand Phone <${process.env.SENDGRID_SENDER_EMAIL}>`,
        personalizations: [
            {
                to: toEmail,
                dynamic_template_data: {
                    sender: name,
                    id: id,
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




router.get('/ticketPage', ensureAuthenticated, (req, res) => {
    res.render("ticket/ticket");
});

// submit ticket page
router.post('/ticketPage/:id/:type', async (req, res) => {
    var uid = req.params.id
    var type = req.params.type


    let { message, category } = req.body;
    let ticket = await Ticket.create({ message: message, type: type, category: category, status: false, userId: uid, assigned: false })


    flashMessage(res, "success", "Ticket submitted successfully")
    res.redirect("back");
});

// reply ticket page
router.get('/replyTicket/:id', ensureAuthenticated, async (req, res) => {

    var PermittedUsers = new Object();

    const userId = req.user.dataValues.id;
    var id = req.params.id;

    const AdminUsers = await User.findAll({ where: { admin: true } })
    const ResponseData = await Response.findAll({ where: { ticketId: id } })


    for (let permitted of AdminUsers) {

        const userPermitted = await Permissions.findOne({ where: { AdminName: permitted.dataValues.name, TicketID: id } })
        if (permitted.dataValues.name != req.user.dataValues.name) {
            if (!PermittedUsers[permitted.dataValues.name]) PermittedUsers[permitted.dataValues.name] = {};

            if (userPermitted) {
                PermittedUsers[permitted.dataValues.name] = "true";
            }
            else {
                PermittedUsers[permitted.dataValues.name] = "false";
            }
        }


    }
    Ticket.findOne({ where: { ticketId: id } })
        .then(async (data) => {
            var user1 = await User.findByPk(data.userId)
            var TicketData = await Ticket.findOne({ where: { ticketId: id } });
            var PermissionData = await Permissions.findOne({ where: { AdminID: userId, ticketId: id } });
            if (PermissionData) {
                res.render("ticket/replyTicket", { TicketData: TicketData, ResponseData: ResponseData, user1: user1, TicketId: id, AdminUsers: PermittedUsers, PermissionData: PermissionData.id });
            }
            else {
                res.render("ticket/replyTicket", { TicketData: TicketData, ResponseData: ResponseData, user1: user1, TicketId: id, AdminUsers: PermittedUsers, PermissionData: null });
            }

        });
})
// reply ticket with response
router.post('/replyTicket/:id', async (req, res) => {
    const userId = req.user.dataValues.id;
    const TicketPermission = await Permissions.findOne({ where: { adminID: userId, TicketID: req.params.id } })
    const TicketStatus = await Ticket.findOne({ where: { ticketId: req.params.id } })
    if (TicketPermission) {
        if (TicketStatus.status == false) {
            let { reply } = req.body;
            var senderId = os.userInfo.uid;
            Ticket.findOne({ where: { ticketId: req.params.id } })
                .then((data) => {
                    let reponse = Response.create({ senderId: userId, reply: reply, ticketId: req.params.id })
                    if (reponse) {
                        flashMessage(res, "success", "response successfully sent and ticket has been updated")
                        res.redirect("back");
                    }
                    else {
                        flashMessage(res, "error", "something gone wrong")
                        res.redirect("back");
                    }
                });
        }
        else
        {
            flashMessage(res, "error", "Ticket has been closed , this ticket is only for viewing")
            res.redirect("back");
        }

    }
    else {
        flashMessage(res, "error", "You are not authorised to reply to this ticket , please request access from ticket master")
        res.redirect("back");
    }

});

// take up ticket route

router.get('/takeUpTicket/:TicketId', async (req, res) => {
    const TicketId = req.params.TicketId;

    const userId = req.user.dataValues.id;
    // create permission table
    let permission = Permissions.create({ TicketID: TicketId, AdminID: userId, level: 1, AdminName: req.user.dataValues.name });

    // updating ticket assigned status 
    const ticket = await Ticket.findByPk(TicketId);
    ticket.assigned = true;
    await ticket.save();


    flashMessage(res, "success", "Admin ID", userId, " has been assigned ticket number : ", TicketId)
    res.redirect("back");
});


// give permission

router.get('/giveTicketPermission/:name', async (req, res) => {
    var name = req.params.name;
    var id = req.headers.referer.split('/');
    console.log(id[5])
    const admin = await User.findOne({ where: { name: name } })

    const checkPermission = await Permissions.findOne({ where: { AdminID: id[5] } })

    if (checkPermission) {
        flashMessage(res, "error", "Admin already has permission");
        res.redirect("back");
    }
    else {
        let permission = Permissions.create({ TicketID: id[5], AdminID: admin.id, level: 2, AdminName: name });
        flashMessage(res, "success", "Admin is given permission");
        res.redirect("back");
    }

});



router.get('/removeTicketPermission/:name', async (req, res) => {
    var name = req.params.name;
    var id = req.headers.referer.split('/');
    var userId = req.user.dataValues.id;
    console.log(id[5])
    const admin = await User.findOne({ where: { name: name } })

    const checkPermission = await Permissions.findOne({ where: { AdminID: admin.id } })

    if (checkPermission) {
        await checkPermission.destroy();
        flashMessage(res, "success", "Permission has been removed");
        res.redirect("back");
    }
    else {
        flashMessage(res, "error", "Admin not found");
        res.redirect("back");
    }

});


router.get('/requestAccess', async (req, res) => {
    // ticket id information
    var id = req.headers.referer.split('/')[5];
    var userId = req.user.dataValues.id;

    // finding ticket master information
    const TicketMaster = await Permissions.findOne({ where: { level: 1 } });

    const TicketMasterUser = await User.findOne({ where: { id: TicketMaster.AdminID } });


    // sending link to ticket master email
    var name = req.user.dataValues.name;

    let url = `${process.env.BASE_URL}:${process.env.PORT}/ticket/giveAccess/${userId}/${id}`;

    sendRequest(TicketMasterUser.email, url, userId, id, name)
        .then(response => {
            console.log(response);
            flashMessage(res, 'success', "Please wait for the ticket master of ticket : " + id + " to grant you access");
            res.redirect('/user/login');
        })
        .catch(err => {
            console.log(err);
            flashMessage(res, 'error', 'Error when sending email to ' + TicketMasterUser.email);
            res.redirect('/');
        });
});

router.get("/giveAccess/:id/:TicketId", async (req, res) => {
    const userId = req.params.id;
    const TicketId = req.params.TicketId;


    const user = await User.findByPk(userId);

    if (user) {
        let permission = Permissions.create({ TicketID: TicketId, AdminID: userId, level: 2, AdminName: user.name });
        flashMessage(res, "success", `User ${user.name} has been granted access to ticket of ID ${TicketId}`);
        res.redirect("/")
    }
    else {
        flashMessage(res, "error", "User not found");
        res.redirect("/")
    }
});

router.post("/completeTicket", async (req, res) => {
    try {
        let { category } = req.body;
        console.log(category);
        var TicketId = req.headers.referer.split('/')[5];
        if (category) {
            Ticket.findOne({ where: { ticketId: TicketId } })
                .then(async (ticket) => {
                    ticket.status = true;
                    ticket.completedReason = category;
                    await ticket.save();
                    flashMessage(res, "success", "Ticket has been closed due to reason : " + category);
                    res.redirect("../admin/AdminPage");
                })

        }
        else {
            flashMessage(res, "error", "something went wrong");
            res.redirect("back");
        }
    }
    catch (err) {
        console.log(err);
    }

});
module.exports = router;