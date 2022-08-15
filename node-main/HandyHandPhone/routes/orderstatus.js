const express = require('express');
const Transaction = require('../models/Transaction')
const User = require('../models/User')
const router = express.Router();
const Orderstatus = require('../models/Orderstatus')


router.get('/orderstatus', async(req, res) => {
	const orderId = req.session.user.orderId ;
	const userId = await Transaction.findByPk(orderId);
	const user = await User.findByPk(userId.userId);
	const OrderStatus = await OrderStatus.create({
		date :userId.createdAt, orderstatus : false, ordernumber : orderId,

	})
	res.render('orderstatus/orderstatus' , {orderId : orderId});
});

router.get('/orderstatus/:id', async(req, res) => {
	const orderId = req.params.id;
	const findOrder = await Orderstatus.findOne({where : {ordernumber : orderId}});
	console.log(findOrder)
	res.render('orderstatus/orderstatus' , {orderId : orderId , orderstatus : findOrder});
});

router.post('/orderstatus', (req, res) => {
	let date = req.body.date;
	let orderstatus = req.body.orderstatus;
	let ordernumber = req.body.ordernumber;

	Orderstatus.create(
		{
			date, orderstatus, ordernumber
		}).then((orderstatus) => {
			console.log(orderstatus.toJSON());
			res.redirect('/orderstatus/orderstatus');
		}).catch(err => console.log(err))
});


router.get('/orderstatus/:id', (req, res) => {
	Orderstatus.findByPk(req.params.id)
		.then((orderstatus) => {
			res.render('orderstatus/orderstatus', { orderstatus });
		})
		.catch(err => console.log(err));
});


router.get('/create', (req, res) => {
	res.render('orderstatus/create');
});

router.post('/create', (req, res) => {
	let date = req.body.date;
	let orderstatus = req.body.orderstatus;
	let ordernumber = req.body.ordernumber;

	Orderstatus.create(
		{
			date, orderstatus, ordernumber
		}).then((orderstatus) => {
			console.log(orderstatus.toJSON());
			res.redirect('/orderstatus/create');
		}).catch(err => console.log(err))
});

router.get('/updateorderstatus', (req, res) => {
	Orderstatus.findAll({
		raw: true
	})
		.then((orderstatus) => {
			// pass object to listVideos.handlebar
			res.render('orderstatus/updateorderstatus', { orderstatus });
		})
		.catch(err => console.log(err));
});

router.post('/editorderstatus/:id', (req, res) => {
	let date = req.body.date;
	let ordernumber = req.body.ordernumber;
	let orderstatus = req.body.orderstatus;

	Orderstatus.update(
		{
			date, ordernumber, orderstatus
		},
		{ where: { id: req.params.id } }
	)
		.then((result) => {
			console.log(result[0] + ' updated');
			res.redirect('/orderstatus/updateorderstatus');
		})
		.catch(err => console.log(err));
});

router.get('/editorderstatus/:id', (req, res) => {
	Orderstatus.findByPk(req.params.id)
		.then((orderstatus) => {
			res.render('orderstatus/editorderstatus', { orderstatus });
		})
		.catch(err => console.log(err));
});


router.get('/deleteOrderstatus/:id', async function
	(req, res) {
	let orderstatus = await Orderstatus.findByPk(req.params.id);
	let result = await Orderstatus.destroy({ where: { id: orderstatus.id } })
	res.redirect('back')
})

module.exports = router;

