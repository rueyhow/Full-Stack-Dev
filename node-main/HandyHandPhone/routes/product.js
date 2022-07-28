const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const Product = require('../models/Product');
// Required for file upload
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: './public/data/productimage/' })



router.get('/product', (req, res) => {
	res.render('/product/product');
});

router.get('/productpage', (req, res) => {
	Product.findAll({}).then((products) => {
		res.render('product/productpage', { products: products })
	});
});

router.get('/addproduct', (req, res) => {

	res.render('product/addproduct');
});


router.post('/addproduct', (req, res) => {
	var buffer = require('buffer/').Buffer;
	let name = req.body.name;
	let price = req.body.price;
	let stock = req.body.stock;
	let description = req.body.description;
	let img = req.files.productPic.data;
	console.log(img);
	let base64 = buffer.from(img).toString('base64')
	
	Product.create(
		{ name, price, stock, description, base64 }
	).then((product) => {
		console.log(product.toJSON());
		res.redirect('/product/productpage');
	}).catch(err => console.log(err))
});

router.get('/editProduct/:id', (req, res) => {
	var id = req.params.id;
	Product.findByPk(id)
		.then((product) => {
			res.render('product/editProduct', { product: product });
		})
		.catch(err => console.log(err));
})


router.post('/editProduct/:id', (req, res) => {
	let { name, price, stock, description } = req.body;
	var id = req.params.id;
	Product.update({ name, price, stock, description }, { where: { id: id } })
	res.redirect('/product/productpage');
})

router.get('/deleteProduct/:id', async function (req, res) {
	let product = await Product.findByPk(req.params.id);
	let result = await Product.destroy({ where: { id: product.id } });
	res.redirect('back');
})
module.exports = router;

