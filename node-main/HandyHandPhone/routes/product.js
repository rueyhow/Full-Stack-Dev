const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');


router.get('/product', (req, res) => {
	res.render('product/product');
});

module.exports = router;
