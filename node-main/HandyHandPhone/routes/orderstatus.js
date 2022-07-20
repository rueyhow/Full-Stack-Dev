const express = require('express');
const router = express.Router();

router.get('/orderstatus', (req, res) => {
	res.render('orderstatus/orderstatus');
});

router.get('/', (req, res) => {
	const date = '01/07/22'
	const ordernumber = '00001'
	res.render('home', { date: date, ordernumber: ordernumber });
});

module.exports = router;

