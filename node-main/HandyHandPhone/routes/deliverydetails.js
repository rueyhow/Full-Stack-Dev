const express = require('express');
const router = express.Router();
const Deliverydetails = require('../models/Deliverydetails')

router.get('/deliverydetails', (req, res) => {
	res.render('deliverydetails/deliverydetails');
});

router.post('/deliverydetails', (req, res) => {
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let unitnumber = req.body.unitnumber;
	let address = req.body.address;
	let phone = req.body.phone;

	Deliverydetails.create(
		{
			firstname, lastname, unitnumber, address, phone
		}).then((deliverydetails) => {
			console.log(deliverydetails.toJSON());
			res.redirect('/deliverydetails/deliverydetails');
		}).catch(err => console.log(err))
});

router.get('/detailsummary', (req, res) => {
	Deliverydetails.findAll({
		raw: true
	})
		.then((deliverydetails) => {
			// pass object to listVideos.handlebar
			res.render('deliverydetails/detailsummary', { deliverydetails });
		})
		.catch(err => console.log(err));
});

router.post('/editdetails/:id', (req, res) => {
	let firstname = req.body.firstname;
	let lastname = req.body.lastname;
	let unitnumber = req.body.unitnumber;
	let address = req.body.address;
	let phone = req.body.phone;

	Deliverydetails.update(
		{
			firstname, lastname, unitnumber, address, phone
		},
		{ where: { id: req.params.id } }
	)
		.then((result) => {
			console.log(result[0] + ' video updated');
			res.redirect('/deliverydetails/detailsummary');
		})
		.catch(err => console.log(err));
});

router.get('/editdetails/:id', (req, res) => {
	Deliverydetails.findByPk(req.params.id)
		.then((deliverydetails) => {
			res.render('deliverydetails/editdetails', { deliverydetails });
		})
		.catch(err => console.log(err));
});

router.get('/deleteDetails/:id', async function
	(req, res) {
		let deliverydetails = await Deliverydetails.findByPk(req.params.id);
		let result = await Deliverydetails.destroy({ where: {id:deliverydetails.id}})
		res.redirect('back')
	})

	module.exports = router;

