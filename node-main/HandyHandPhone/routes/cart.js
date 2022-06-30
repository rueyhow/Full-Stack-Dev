const express = require('express');
const router = express.Router();
const CartItem = require('../models/cart')
const Product = require('../models/Product')
const os = require("os");

router.get('/addcart/:productId',async (req,res) => {
    Product.findOne(req.params.id)
    .then((product)=>{
        if (!product){
            let cartItem = await CartItem.create({name: product.name , price: product.price ,quantity : 1});
        }
        else
        {
            CartItem.findOne({where:{name:product.name}})
            .then((product)=>{
                product.quantity += 1;
            })
        }

        
    });
});
router.get('/cart', async (req, res) => {
	const userInfo = os.userInfo();
    const uid = userInfo.uid;
    const cartItems = await CartItem.findAll({where: { uid }, include: { Product }});
    return res.render('cart/cart', { cartItems });
    
    
});

module.exports = router;