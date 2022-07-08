const express = require('express');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const router = express.Router();
const Ticket = require("../models/Ticket").Ticket;
const Response = require("../models/Ticket").Response;
const os = require("os");
const User = require('../models/User');


router.get('/ticketPage', ensureAuthenticated, (req, res) => {
    res.render("ticket/ticket");
});


router.post('/ticketPage/:id/:type', async (req, res) => {
    var uid = req.params.id
    var type = req.params.type
    let { message,category } = req.body;
    let ticket = await Ticket.create({ message: message, type: type, category: category, status: false, userId: uid})
    flashMessage(res, "success", "Ticket submitted successfully")
    res.redirect("back");
});


router.get('/replyTicket/:id' , ensureAuthenticated , async(req,res)=>{
    var id = req.params.id;
    const ResponseData = await Response.findAll({where:{ticketId : id}})
    Ticket.findOne({where:{ticketId : id}})
    .then(async(data)=>{
        var user1 = await User.findByPk(data.userId)
        var TicketData = await Ticket.findAll({where:{ticketId : id}});
        res.render("ticket/replyTicket" , {TicketData : TicketData , ResponseData : ResponseData , user1 : user1 , TicketId : id});
    });

})

router.post('/replyTicket/:id' , (req,res)=>{
    let {reply} = req.body;
    var senderId = os.userInfo.uid;
    Ticket.findOne({where:{ticketId : req.params.id}})
    .then((data)=>{
        let reponse = Response.create({senderId : senderId , reply : reply , ticketId : req.params.id})
        if(reponse){
            flashMessage(res,"success" , "response successfully sent and ticket has been updated")
            res.redirect("back");
        }
        else{
            flashMessage(res,"error" , "something gone wrong")
            res.redirect("back"); 
        }
    });

});
module.exports = router;