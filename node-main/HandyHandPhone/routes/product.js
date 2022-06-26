const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');


router.get('/product', (req, res) => {
	res.render('/product/product');
});

router.get('/productpage', (req, res) =>{
	res.render('product/productpage');
});

router.get('/addproduct', (req, res) =>{

	res.render('product/addproduct');
});

router.post('/addproduct', (req, res) =>{
	let { name, email, password} = req.body;
	
	res.render('product/addproduct');
});


module.exports = router;
