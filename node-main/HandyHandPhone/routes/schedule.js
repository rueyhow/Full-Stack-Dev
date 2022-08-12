const express = require('express');
const Schedule = require('../models/Schedule');
const router = express.Router();
const Test = require('../models/Schedule')


router.get('/schedule', (req, res) => {
	res.render('schedule/schedule');
});

router.post('/schedule', (req, res) => {
	let date = req.body.date;
	let time = req.body.time;
	let isAvailable = req.body.isAvailable;

	Schedule.create(
		{
			date, time, isAvailable
		}).then((schedule) => {
			console.log(schedule.toJSON());
			res.redirect('/schedule/schedule');
		}).catch(err => console.log(err))
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

router.post('/create', (req, res) => {
	let date = req.body.date;
	let time = req.body.time;
	let isAvailable = req.body.isAvailable;

	Schedule.create(
		{
			date, time, isAvailable
		}).then((schedule) => {
			console.log(schedule.toJSON());
			res.redirect('/schedule/create');
		}).catch(err => console.log(err))
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
	let isAvailable = req.body.isAvailable;

	Schedule.update(
		{
			date, time, isAvailable
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