const express = require('express');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const router = express.Router();
const Voucher = require('../models/Voucher');


router.get('/availableVouchers' , ensureAuthenticated , (req,res)=>{
    Voucher.findAll()
    .then((voucher=>{
        res.render("voucher/availableVouchers" , {voucherData:voucher});
    }))
});


router.get('/buyVouchers' ,ensureAuthenticated, (req,res)=>{
    res.render("voucher/buyVouchers");
});

router.get('/addVouchers' ,ensureAuthenticated, (req,res)=>{
    res.render("voucher/addVouchers");
});

router.post('/addVouchers' , async function(req,res){
    var buffer = require('buffer/').Buffer;

    let {category,type ,percentage , description , price} = req.body;


    let voucher = await Voucher.create({category , type , percentage , description , price});
    flashMessage(res,"success" , "voucher" + type + " has been added successfully!")

    res.redirect("availableVouchers")
});

                                                                                                                                                                                            

module.exports = router;