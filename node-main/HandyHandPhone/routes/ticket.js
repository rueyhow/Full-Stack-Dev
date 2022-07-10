const express = require('express');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const router = express.Router();
const Ticket = require("../models/Ticket").Ticket;
const Response = require("../models/Ticket").Response;
const Permissions = require("../models/Ticket").Permissions;
const os = require("os");
const User = require('../models/User');
const FlashMessenger = require('flash-messenger/FlashMessenger');


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

    const AdminUsers = await User.findAll({where: {admin : true}})
    const ResponseData = await Response.findAll({ where: { ticketId: id } })

    
    for (let permitted of AdminUsers)
    {

        const userPermitted = await Permissions.findOne({where:{AdminName : permitted.dataValues.name , TicketID : id}})
        if(!PermittedUsers[permitted.dataValues.name]) PermittedUsers[permitted.dataValues.name] = {};

        if(userPermitted){
            PermittedUsers[permitted.dataValues.name] = "true";
        }
        else
        {
            PermittedUsers[permitted.dataValues.name] = "false";
        }

    }
    Ticket.findOne({ where: { ticketId: id } })
        .then(async (data) => {
            var user1 = await User.findByPk(data.userId)
            var TicketData = await Ticket.findAll({ where: { ticketId: id } });
            res.render("ticket/replyTicket", { TicketData: TicketData, ResponseData: ResponseData, user1: user1, TicketId: id  , AdminUsers : PermittedUsers});
        });


})
// reply ticket with response
router.post('/replyTicket/:id', async(req, res) => {
    const userId = req.user.dataValues.id;
    const TicketPermission = await Permissions.findOne({where:{adminID : userId , TicketID :req.params.id }})
    if(TicketPermission){
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
        flashMessage(res, "error" , "You are not authorised to reply to this ticket , please request access from ticket master")
        res.redirect("back");
    }
    
});

// take up ticket route

router.get('/takeUpTicket/:TicketId', async (req, res) => {
    const TicketId = req.params.TicketId;

    const userId = req.user.dataValues.id;
    // create permission table
    let permission = Permissions.create({ TicketID: TicketId, AdminID: userId, level: 1  , AdminName : req.user.dataValues.name});

    // updating ticket assigned status 
    const ticket = await Ticket.findByPk(TicketId);
    ticket.assigned = true;
    await ticket.save();


    flashMessage(res, "success", "Admin ID", userId, " has been assigned ticket number : ", TicketId)
    res.redirect("back");
});


// give permission

router.get('/giveTicketPermission/:name' , async(req,res)=>{
    var name = req.params.name;
    var id = req.headers.referer.split('/');
    console.log(id[5])
    const admin = await User.findOne({where:{name : name}})

    const checkPermission = await Permissions.findOne({where:{AdminID : id[5]}})

    if (checkPermission){
        flashMessage(res,"error" , "Admin already has permission");
        res.redirect("back");
    }
    else
    {
        let permission = Permissions.create({ TicketID: id[5], AdminID: admin.id, level: 2 , AdminName : name});
        flashMessage(res,"success" , "Admin is given permission");
        res.redirect("back");
    }

});

module.exports = router;