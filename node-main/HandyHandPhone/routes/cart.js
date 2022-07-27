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




router.get('/zart', async (req, res) => {
    const products = await Product.findAll();
    const userId = req.user.dataValues.id;
    console.log("userId: ",userId)
    return res.render('cart/zart', { products, userId })
})

router.get('/cart', async (req, res) => {
    const userId = req.user.dataValues.id; // gets the *logged in* user id from the request
    var cartItems = await CartItem.findAll({ // finds all cart items that belongs to the user,
        where: { userId: userId }, // through `userId`
        include: { model: Product } 
        // [fetching all associated elements](https://sequelize.org/docs/v6/advanced-association-concepts/eager-loading/#fetching-all-associated-elements)
    })
    // will return:
    // cartitem {
    //      ...,
    //      product {
    //          ...
    //      }
    // }
    // linked product object can be accessed like this:
    // `const productName = cartObject.product.name`
    return res.render('cart/cart', { cartItems });
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

router.post('/cart/:id/add', async (req, res) => {
    // get cart item id from the url
    const cartItemId = req.params.id;

    // find the cart item through `cartItemId`
    const cartItem = await CartItem.findByPk(cartItemId);

    // add 1 to the cart item quantity
    cartItem.quantity += 1;
    console.log('add') // for debugging
    // save changes in the database
    await cartItem.save()
})

router.post('/cart/:id/minus', async (req, res) => {
    // get cart item id from the url
    const cartItemId = req.params.id;

    // find the cart item through `cartItemId`
    const cartItem = await CartItem.findByPk(cartItemId);

    // minus 1 to the cart item quantity
    cartItem.quantity -= 1;

    if (cartItem.quantity == 0) {
        // cart item should not exist with quantity 0
        await cartItem.destroy(); 
    }
    else {
        // save changes in the database
        await cartItem.save()
    }
    console.log('minus') // for debugging
})

module.exports = router;