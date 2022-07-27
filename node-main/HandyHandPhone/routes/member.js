const express = require('express');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const router = express.Router();
const User = require('../models/User');
const Vouchers = require('../models/Voucher').Vouchers;
const UserVouchers = require('../models/Voucher').UserVouchers;


router.get('/memberPage', ensureAuthenticated , async (req, res) => {
    // update users rank or membership tiers
    // tier 1 : 1000 points sliver
    // tier 2 : 2000 points gold
    // tier 3 : 3000 points plat
    // tier 4 : 4000 points immortal


    // get user info as object
    var user = req.user.dataValues;

    var userPoints = user.websitePoints;

    const findUser = await User.findByPk(user.id);

    const YourVoucher = await UserVouchers.findAll({ where: { userId: user.id } });
    if (findUser) {
        if (findUser.membershipRank != "platinum" && findUser.membershipRank != "immortal" && findUser.websitePoints >= 1000 && findUser.websitePoints < 2000) {
            findUser.membershipRank = "gold";
            await findUser.save();
        }
        else if (findUser.membershipRank != "immortal" && findUser.websitePoints >= 2000 && findUser.websitePoints < 3000) {
            findUser.membershipRank = "platinum";
            await findUser.save();
        }
        else if (findUser.membershipRank != "immortal" && findUser.websitePoints >= 3000) {
            findUser.membershipRank = "immortal";
            await findUser.save();
        }
    }
    // passing in available vouchers
    const VoucherData = await Vouchers.findAll();


    // run thru user voucher list
    for (var i = 0; i < YourVoucher.length; i++) {
        // checking for expiry date 
        let diff = new Date().getTime() - YourVoucher[i].expiryDate;

        // if diff is positive means voucher has expired and have to update
        if (diff > 0) {
            YourVoucher[i].expired = true;
            await YourVoucher[i].save();
        }
        else if (diff < 0 && YourVoucher[i].expired == true) {
            YourVoucher[i].expired = false;
            await YourVoucher[i].save();
        }
    }
    res.render('member/memberPage', { VoucherData: VoucherData, YourVoucher: YourVoucher })
});

router.get('/addVouchers', ensureAuthenticated, async (req, res) => {
    res.render("member/addVouchers")
}
);

router.post('/addVouchers', ensureAuthenticated, async (req, res) => {

    let { category, name, discount, description, price } = req.body;


    if (category === 'delivery' || category === 'free-gift') {
        if (discount != 100) {
            flashMessage(res, "error", "Delivery should have 100% discount")
            res.redirect("back");
        }
    }
    else {
        let voucher = await Vouchers.create({ VoucherCategory: category, VoucherName: name, discount: discount, description: description, price: price });
        flashMessage(res, "success", "Voucher created successfully");
        res.redirect('back');
    }
});

router.get('/purchaseVoucher/:VoucherId', async (req, res) => {
    var user = req.user.dataValues;
    // function to generate code 
    function makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }
    // get date one year from now
    var oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    // get user
    const findUser = await User.findByPk(user.id);

    const voucherId = req.params.VoucherId;

    const Voucher = await Vouchers.findByPk(voucherId);

    if (Voucher) {
        if (Voucher.price > req.user.dataValues.websitePoints) {
            flashMessage(res, "error", "You don't have enough credits to purchase")
        }
        else {
            findUser.websitePoints = findUser.websitePoints - Voucher.price
            let UserVoucher = await UserVouchers.create({
                VoucherCode: makeid(12),
                VoucherCategory: Voucher.VoucherCategory,
                discount: Voucher.discount,
                expiryDate: oneYearFromNow,
                description: Voucher.description,
                promotion: Voucher.VoucherName,
                userId: req.user.dataValues.id,
                expired: false
            })
            await findUser.save();
            flashMessage(res, "success", "Voucher has successfully been purchased");
        }

    }
    res.redirect("back");
});
router.get('/updateBirthday/:userId' , async (req, res) => {
    const userId = req.params.userId;
    res.redirect("back");
});
module.exports = router;