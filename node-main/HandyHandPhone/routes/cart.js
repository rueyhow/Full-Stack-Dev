const express = require('express');
const ensureAuthenticated = require('../helpers/auth');
const flashMessage = require('../helpers/messenger');
const router = express.Router();
const CartItem = require('../models/cart');
const Product = require('../models/Product');
const User = require('../models/User');
const UserVouchers = require('../models/Voucher').UserVouchers;
const cookieParser = require("cookie-parser");
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

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
    return res.render('cart/cart', { cartItems, megaPrice: megaPrice });
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
    res.send({ quantity: quantity, totalPrice: totalPrice, megaPrice: megaPrice });

});


// rueyhow's try
router.get('/testCart', async function (req, res) {
    // setting up payment intents
    const paymentIntent = await stripe.paymentIntents.create({
        amount: 1099,
        currency: 'sgd',
        payment_method_types: ['card'],
        receipt_email: req.user.dataValues.email,
      })

    // get cookies
    var discount = 1;
    var deliveryDiscount = 15;
    if (req.cookies.voucherDiscount != undefined) {
        discount = req.cookies.voucherDiscount[0];
    }
    if (req.cookies.DeliveryDiscount !== undefined) {
        deliveryDiscount = req.cookies.DeliveryDiscount[0];
    }
    const userId = req.user.dataValues.id;
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
    if (discount == 1) {
        discountedAmount = 0;
    }
    const tax = parseInt(megaPrice * 0.02);
    var discountedAmount = megaPrice - (megaPrice * discount);
    // get user's vouchers
    const userVouchers = await UserVouchers.findAll({ where: { userId: req.user.dataValues.id } });
    res.render("cart/testCart", { cartItems: cartItems, megaPrice: megaPrice, tax: tax, deliver: deliveryDiscount, UserVouchers: userVouchers, discount: discount, discountedAmount: discountedAmount, })
});


router.get("/action/:id/:action", async (req, res) => {
    const CartId = req.params.id;
    var action = req.params.action;
    const cartItem = await CartItem.findByPk(CartId, { include: Product });
    if (action == 'add') { cartItem.quantity += 1; }
    else if (action == 'minus') { cartItem.quantity -= 1; }
    else if (action == 'remove') {
        const cartItem = await CartItem.findOne({ where: { id: CartId } });
        await cartItem.destroy();
    }
    const quantity = cartItem.quantity;
    const totalPrice = cartItem.quantity * cartItem.product.price;

    if (quantity == 0) {
        await cartItem.destroy();
    } else {
        await cartItem.save();
    }

    flashMessage(res, "success", "Cart Updated")
    res.redirect("back");
});

router.get("/redeemVoucher/:VoucherCode", async (req, res) => {
    // normal code
    const userId = req.user.dataValues.id;
    const voucherCode = req.params.VoucherCode;
    UserVouchers.findOne({ where: { userId: userId, VoucherCode: voucherCode } })
        .then(data => {
            if (!req.cookies.voucherDiscount && !req.cookies.DeliveryDiscount) {
                if (data.expired == false) {
                    if (data.VoucherCategory == "discount") {
                        const discountPercentage = data.discount / 100
                        res.cookie("voucherDiscount", [1 - discountPercentage, data.VoucherCode], { httpOnly: true });
                        flashMessage(res, "success", "Discount Applied!")
                        res.redirect("back");
                    }
                    else if (data.VoucherCategory == "delivery") {
                        res.cookie("DeliveryDiscount", [0, data.VoucherCode], { httpOnly: true })
                        flashMessage(res, "success", "Discount Applied!")
                        res.redirect("back");
                    }
                }
                else {
                    flashMessage(res, "error", 'Voucher has expired and cannot be used anymore');
                    res.redirect("back");
                }
            }
            else {
                flashMessage(res, "error", 'You have already applied a voucher!');
                res.redirect("back");
            }

        })
});

router.get('/revokeVouchers', async function (req, res) {
    res.clearCookie("voucherDiscount");
    res.clearCookie("DeliveryDiscount");
    res.redirect("back");
});


router.post("/create-checkout-session/:total/:discountedAmount/:tax", async function (req, res) {
    var discount = 1;
    var deliveryDiscount = 15;
    const DiscountAmount = req.params.discountedAmount;
    const TotalAmount = req.params.total;
    const userId = req.user.dataValues.id;
    const UserCart = await CartItem.findAll({ where: { userId: userId } }, { include: { model: Product } });
    // accessing the discount

    if (req.cookies.voucherDiscount != undefined) {
        discount = req.cookies.voucherDiscount[0];
    }
    const shippingArray = [];
    if (req.cookies.DeliveryDiscount !== undefined) {
        shippingArray.push({
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 0,
                currency: 'sgd',
              },
              display_name: 'Free shipping',
              // Delivers between 5-7 business days
              delivery_estimate: {
                minimum: {
                  unit: 'business_day',
                  value: 5,
                },
                maximum: {
                  unit: 'business_day',
                  value: 7,
                },
              }
            }
          })
        deliveryDiscount = req.cookies.DeliveryDiscount[0];
    }
    else
    {
        shippingArray.push({
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 2000,
                currency: 'sgd',
              },
              display_name: 'Express Shipping',
              // Delivers between 5-7 business days
              delivery_estimate: {
                minimum: {
                  unit: 'business_day',
                  value: 5,
                },
                maximum: {
                  unit: 'business_day',
                  value: 7,
                },
              }
            }
          },
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: {
                amount: 3000,
                currency: 'sgd',
              },
              display_name: 'Next day air',
              // Delivers in exactly 1 business day
              delivery_estimate: {
                minimum: {
                  unit: 'business_day',
                  value: 1,
                },
                maximum: {
                  unit: 'business_day',
                  value: 1,
                },
              }
            }
          },
          )
    }


    // passing info to list from UserCart
    const CartArray = [];
    for (let i = 0; i < UserCart.length; i++) {
        const Item = await Product.findByPk(UserCart[i].productId);
        CartArray.push({
            price_data: {
                currency: "sgd",
                product_data: {
                    name: Item.name,
                },
                unit_amount: Item.price * 100 * discount,
            },
            quantity: UserCart[i].quantity,
        })
    }
    CartArray.push(
        {
            price_data: {
                currency: "sgd",
                product_data: {
                    name: "tax"
                },
                unit_amount: req.params.tax * 100,
            },
            quantity: 1,
        })
    try {
        // Create a checkout session with Stripe
        const session = await stripe.checkout.sessions.create({
            shipping_address_collection: {
                allowed_countries: ['SG'],
              },
              shipping_options: [
                {
                  shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                      amount: 1000,
                      currency: 'sgd',
                    },
                    display_name: 'Express Shipping',
                    // Delivers between 5-7 business days
                    delivery_estimate: {
                      minimum: {
                        unit: 'business_day',
                        value: 5,
                      },
                      maximum: {
                        unit: 'business_day',
                        value: 7,
                      },
                    }
                  }
                },
                {
                  shipping_rate_data: {
                    type: 'fixed_amount',
                    fixed_amount: {
                      amount: 3000,
                      currency: 'sgd',
                    },
                    display_name: 'Next day air',
                    // Delivers in exactly 1 business day
                    delivery_estimate: {
                      minimum: {
                        unit: 'business_day',
                        value: 1,
                      },
                      maximum: {
                        unit: 'business_day',
                        value: 1,
                      },
                    }
                  }
                },
              ],


            payment_method_types: ["card"],
            line_items: CartArray,
            mode: "payment",
            // Set a success and cancel URL we will send customers to
            // These must be full URLs
            // In the next section we will setup CLIENT_URL
            success_url: `${process.env.BASE_URL}:${process.env.PORT}/cart/create-payment-intent`,
            cancel_url: `${process.env.BASE_URL}:${process.env.PORT}/cart/cancel`,
        })
        res.redirect(session.url);
    } catch (e) {
        // If there is an error send it to the client
        res.status(500).json({ error: e.message })
    }
});

router.get('/create-payment-intent' , ensureAuthenticated ,async function (req, res){
    // res.clearCookie("voucherDiscount");
    // res.clearCookie("DeliveryDiscount");

    // const Cart = await CartItem.findAll({where  : { userId: req.user.dataValues.id }});
    // if (Cart != undefined){
    //     for (var i = 0 ; i < Cart.length ; i++){
    //         Cart[i].destroy();
    //     }
    // }
    res.render("cart/success");
});

router.get('/cancel' , async function (req, res){
    res.render("cart/cancel");
});
module.exports = router;