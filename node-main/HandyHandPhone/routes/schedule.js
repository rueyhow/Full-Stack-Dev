const express = require('express');
const Schedule = require('../models/Schedule');
const router = express.Router();
const Test = require('../models/Schedule')
const { Op } = require("sequelize");
const flashMessage = require('../helpers/messenger');
const Transaction = require('../models/Transaction');

router.get('/schedule', async(req, res) => {
	const userTransaction = await Transaction.findAll({where : {userId : req.user.dataValues.id , transactionCategory : "order"}})
	Schedule.findAll({
		raw: true
	})
		.then((schedule) => {
			res.render('schedule/schedule', { schedule});
		})
		.catch(err => console.log(err));
	// res.render('schedule/schedule');
});

router.post('/schedule', (req, res) => {
	let date = req.body.date;
	let time = req.body.time;
	let availability = req.body.availability;

	Schedule.create(
		{
			date, time, availability
		}).then((schedule) => {
			console.log(schedule.toJSON());
			res.redirect('/schedule/schedule');
		}).catch(err => console.log(err))
});

router.get('/schedule/:date', (req, res) => {
	Schedule.findAll({
		where: {
			date: {
				[Op.eq]: req.params.date
			}
		}
	})
		.then((schedule) => {
			const morning = schedule[0].availability;
			const afternoon = schedule[1].availability;
			const evening = schedule[2].availability;
			res.render('schedule/schedule', { morning, afternoon, evening });
		})
		.catch(err => console.log(err));
	// res.render('schedule/schedule');
});

router.get('/schedule/:id', (req, res) => {
	Schedule.findByPk(req.params.id)
		.then((schedule) => {
			res.render('schedule/schedule', { schedule });
		})
		.catch(err => console.log(err));
});


router.get('/create', (req, res) => {
	res.render('schedule/create');
});

router.post('/create', async(req, res) => {
	let date = req.body.date;
	let time = req.body.time;
	let availability = req.body.availability;

	// Schedule.create(
	// 	{
	// 		date : date, time : time, availability : availability,
	// 	}).then((schedule) => {
	// 		console.log(schedule.toJSON());
	// 		res.redirect('/schedule/create');
	// 	}).catch(err => console.log(err))
	let find = await Schedule.findOne({where : {date :date  , time : time}});
	if(!find){
		let schedule = await Schedule.create({date : date, time : time, availability : availability});
		flashMessage(res , "success" , "Schedule has beenc created");
		res.redirect("back");
	}
	else{
		flashMessage(res , "error" , "Schedule Already Exits");
		res.redirect("back");
	}
});

router.get('/update', (req, res) => {
	Schedule.findAll({
		raw: true
	})
		.then((schedule) => {
			// pass object to listVideos.handlebar
			res.render('schedule/update', { schedule });
		})
		.catch(err => console.log(err));
});

router.post('/edit/:id', (req, res) => {
	let date = req.body.date;
	let time = req.body.time;
	let availability = req.body.availability;

	Schedule.update(
		{
			date, time, availability
		},
		{ where: { id: req.params.id } }
	)
		.then((result) => {
			console.log(result[0] + ' updated');
			res.redirect('/schedule/update');
		})
		.catch(err => console.log(err));
});

router.get('/edit/:id', (req, res) => {
	Schedule.findByPk(req.params.id)
		.then((schedule) => {
			res.render('schedule/edit', { schedule });
		})
		.catch(err => console.log(err));
});


router.get('/delete/:id', async function
	(req, res) {
	let schedule = await Schedule.findByPk(req.params.id);
	let result = await Schedule.destroy({ where: { id: schedule.id } })
	res.redirect('back')
})

module.exports = router;
