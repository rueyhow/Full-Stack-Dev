const express = require('express');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const router = express.Router();
const CartItem = require('../models/cart')
const Product = require('../models/Product')


router.get('/', ensureAuthenticated, async (req, res) => {
    const userId = req.user.id;
    const cartItems = await CartItem.findAll({
        where: { userId },
        include: { model: Product }
    });
    const UserCart = await CartItem.findAll({ where: { userId: req.user.dataValues.id } }, { include: Product })
    var megaPrice = 0;
    for (var i = 0; i < UserCart.length; i++) {
        const ItemPrice = await Product.findByPk(UserCart[i].productId);
        megaPrice += UserCart[i].quantity * ItemPrice.price;
    }
    return res.render('cart/cart', { cartItems  , megaPrice : megaPrice});
});

router.get('/addcart/:productId', ensureAuthenticated, async (req, res) => {
    // get current user id = req.user.Datavalues.id;
    // req.params.example
    const product = await CartItem.findOne({ where: { userId: req.user.dataValues.id, productId: req.params.productId } })
    if (!product) {
        let cartItem = await CartItem.create({ quantity: 1, userId: req.user.dataValues.id, productId: req.params.productId });
        flashMessage(res, "success", "Cart Updated")
        res.redirect("back")
    }
    else {
        product.quantity += 1;
        await product.save();
        flashMessage(res, "success", "Cart Updated");
        res.redirect("back");
    }
});

router.delete('/delete/:cartItemId', ensureAuthenticated, async (req, res) => {
    const cartItemId = parseInt(req.params.cartItemId);
    const cartItem = await CartItem.findOne({ where: { id: cartItemId } });
    await cartItem.destroy();
    return res.send({ deleted: true });
});



router.post('/cart/:id/create', async (req, res) => {
    // get product id from the url
    const productId = req.params.id;

    // get user id from request
    const userId = req.user.id;

    // create new cart item with product id linked
    const cartItem = await CartItem.create({
        productId,
        userId,
        // quantity is 1 by default
    })
})

router.post('/cart/:id/:action', async (req, res) => {
    const cartItemId = req.params.id;
    const action = req.params.action;
    const cartItem = await CartItem.findByPk(cartItemId, { include: Product });

    if (action == 'add') { cartItem.quantity += 1; }
    else if (action == 'minus') { cartItem.quantity -= 1; }

    const quantity = cartItem.quantity;
    const totalPrice = cartItem.quantity * cartItem.product.price;

    if (quantity == 0) {
        await cartItem.destroy();
    } else {
        await cartItem.save();
    }

    // calculate total price
    const UserCart = await CartItem.findAll({ where: { userId: req.user.dataValues.id } }, { include: Product })
    var megaPrice = 0;
    for (var i = 0; i < UserCart.length; i++) {
        const ItemPrice = await Product.findByPk(UserCart[i].productId);
        megaPrice += UserCart[i].quantity * ItemPrice.price;
    }
    res.send({ quantity: quantity, totalPrice: totalPrice , megaPrice: megaPrice});

});

module.exports = router;