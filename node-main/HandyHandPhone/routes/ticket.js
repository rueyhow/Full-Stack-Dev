const express = require('express');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const router = express.Router();
const Ticket = require("../models/Ticket").Ticket;
const Response = require("../models/Ticket").Response;
const os = require("os");



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
    
    const TicketData = await Ticket.findOne({where:{ticketId : id}});

    const ResponseData = await Response.findOne({where:{ticketId : id}})

    
    res.render("ticket/replyTicket" , {TicketData : TicketData , ResponseData : ResponseData});
})
module.exports = router;