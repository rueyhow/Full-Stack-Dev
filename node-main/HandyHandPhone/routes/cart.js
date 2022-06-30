const express = require('express');
const router = express.Router();
const CartItem = require('../models/cart')
const Product = require('../models/Product')

router.get('/addcart/:productId',async (req,res) => {
    Product.findOne(req.params.id)
    .then (async(product)=>{
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
    const userId = req.user.dataValues.id;
    var cartItems = await CartItem.findAll({where: { userId }, include: { model: Product }})
    return res.render('cart/cart', { cartItems });
});

router.post('/cart/:id/add', async (req, res) => {
    const cartItemId = req.params.id;
    const cartItem = await CartItem.findByPk(cartItemId);
    cartItem.quantity += 1;
    console.log('add')
    await cartItem.save()
})
router.post('/cart/:id/minus', async (req, res) => {
    const cartItemId = req.params.id;
    const cartItem = await CartItem.findByPk(cartItemId);
    if (cartItem.quantity == 1) {
        await cartItem.destroy();
    }
    else {
        cartItem.quantity -= 1;
        await cartItem.save()
    }
    console.log('minus')
})

module.exports = router;