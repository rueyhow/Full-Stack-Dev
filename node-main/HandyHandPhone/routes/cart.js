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
const sgMail = require('@sendgrid/mail');
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const { request } = require('http');
const bodyParser = require('body-parser');
require('dotenv').config();
const Transaction = require('../models/Transaction');
const DeliveryDetails = require('../models/Deliverydetails');
const Deliverydetails = require('../models/Deliverydetails');
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
router.get('/testCart', ensureAuthenticated , async function (req, res) {
  // get cookies
  var discount = 1;
  var deliveryDiscount = 15;
  var savedAddress = undefined;
  if (req.session.user.voucherDiscount != undefined) {
    discount = req.session.user.voucherDiscount[0];
  }
  if (req.session.user.DeliveryDiscount != undefined) {
    deliveryDiscount = req.session.user.DeliveryDiscount[0];
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
  if(!req.session.user.megaprice){
    req.session.user.megaprice = megaPrice;
  }
  // get user's voucher
  const userVouchers = await UserVouchers.findAll({ where: { userId: req.user.dataValues.id } });

  // delivery section
  const deliverydetails = await DeliveryDetails.findAll({where : {userId : req.user.dataValues.id}});
  // currently saved deliverty address
  if(req.session.user.address != undefined){
    savedAddress = JSON.parse(req.session.user.address);
  }

  res.render("cart/testCart", { cartItems: cartItems, megaPrice: megaPrice, tax: tax, deliver: deliveryDiscount, UserVouchers: userVouchers, discount: discount, discountedAmount: discountedAmount, deliverydetails: deliverydetails , savedAddress : savedAddress})
});
// use saved address
router.get("/useAddress/:id" , async function (req, res) { 
  // delete existing cookie
  const id = req.params.id;
  const Address = await Deliverydetails.findByPk(id);

  // create cookie to store current saved address for this particular order
  // res.cookie('Address', JSON.stringify({ firstname: Address.firstname ,lastname: Address.lastname,unitnumber : Address.unitnumber , address : Address.address , phone : Address.phone} , {httpOnly:true , overwrite: true  , expires : 0 }))
  const sessiondata = req.session;
  sessiondata.user.address = JSON.stringify({ firstname: Address.firstname ,lastname: Address.lastname,unitnumber : Address.unitnumber , address : Address.address , phone : Address.phone})
  flashMessage(res , 'success' , "Address has been successfully updated")
  res.redirect("back");
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
      if (!req.session.user.voucherDiscount && !req.session.user.DeliveryDiscount) {
        if (data.expired == false) {
          if (data.VoucherCategory == "discount") {
            const discountPercentage = data.discount / 100
            req.session.user.voucherDiscount = [1 - discountPercentage, data.VoucherCode];
            flashMessage(res, "success", "Discount Applied!")
            res.redirect("back");
          }
          else if (data.VoucherCategory == "delivery") {
            req.session.user.DeliveryDiscount = [1 - discountPercentage, data.VoucherCode];
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
  req.session.user.voucherDiscount = undefined;
  req.session.user.DeliveryDiscount = undefined;
  flashMessage(res , "success", "Cart Updated")
  res.redirect("back");
});


router.post("/create-checkout-session/:total/:discountedAmount/:tax", async function (req, res) {
  if (req.session.user.address == undefined){
    flashMessage(res , 'error', "Please enter your delivery address");
    res.redirect("back");
  }
  else{
    // declare variables
    const taxRate = await stripe.taxRates.create({ // Here
      display_name: 'Sales Tax',
      percentage: 2,
      inclusive: false
    });

  var discount = 1;
  var deliveryDiscount = 15;
  const DiscountAmount = req.params.discountedAmount;
  const TotalAmount = req.params.total;
  const userId = req.user.dataValues.id;
  const UserCart = await CartItem.findAll({ where: { userId: userId } }, { include: { model: Product } });
  // accessing the discount
  if (!req.session.user.amounts){
    req.session.user.amounts = [DiscountAmount , TotalAmount];
  }

  if (req.session.user.voucherDiscount != undefined) {
    discount = req.session.user.voucherDiscount[0];
  }
  const shippingArray = [];
  if (req.session.user.DeliveryDiscount !== undefined) {
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
    deliveryDiscount = req.session.user.DeliveryDiscount[0];
  }
  else {
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
      tax_rates: [taxRate.id],
    })
  }

  try {
    // Create a checkout session with Stripe
    const session = await stripe.checkout.sessions.create({
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
      customer_email: req.user.dataValues.email,
      payment_intent_data : {
        receipt_email: req.user.dataValues.email,
      },
      line_items: CartArray,
      mode: "payment",
      // Set a success and cancel URL we will send customers to
      // These must be full URLs
      // In the next section we will setup CLIENT_URL
      success_url: `${process.env.BASE_URL}:${process.env.PORT}/cart/create-payment-intent`,
      cancel_url: `${process.env.BASE_URL}:${process.env.PORT}/cart/cancel`,
    })
    if (!req.session.user.sessionId){
      req.session.user.sessionId = session.id;
    }
    res.redirect(session.url);
  } catch (e) {
    // If there is an error send it to the client
    res.status(500).json({ error: e.message })
  }
  }
});

router.get('/create-payment-intent', ensureAuthenticated, async function (req, res) {
  // declare variables 
  const sessionId = req.session.user.sessionId;
  const emailTemplate = fs.readFileSync(path.join(__dirname, "../views/custom/index.handlebars"), "utf-8")
  const template = handlebars.compile(emailTemplate)
  const orderDetails = await CartItem.findAll({ where: { userId: req.user.dataValues.id }});
  const CartDetails = [];
  let date = new Date()
  let day = date.getDate();
  let month = date.getMonth()+1;
  let year = date.getFullYear();
  let fullDate = day + "/" + month + "/" + year + ".";
  const session1 = await stripe.checkout.sessions.retrieve(
    sessionId,
  );
  const shippingTotal = session1.shipping_cost.amount_total;

// clear cookies as well as cart from session

  // res.clearCookie("voucherDiscount");
  // res.clearCookie("DeliveryDiscount");

  // const Cart = await CartItem.findAll({where  : { userId: req.user.dataValues.id }});
  // if (Cart != undefined){
  //     for (var i = 0 ; i < Cart.length ; i++){
  //         Cart[i].destroy();
  //     }
  // }


  // adding items into template jsonify array
  for (var i = 0 ; i <orderDetails.length; i++){
    const productdetail = await Product.findByPk(orderDetails[i].productId);
    CartDetails.push({
        name : `${productdetail.name}`,
        description : `${productdetail.description}`,
        productId : `${orderDetails[i].productId}`,
        quantity : `${orderDetails[i].quantity}`,
        price : `${productdetail.price}`,
        total : productdetail.price * orderDetails[i].quantity
    })
  }
  // create and enter order into database
  const Order = await Transaction.create({
    transactionCategory : "order" , 
    price : req.session.user.megaprice , 
    information : `Order By ${req.user.dataValues.name}` , 
    completed : true , 
    items : CartDetails , 
    userId : req.user.dataValues.id,
    address : JSON.parse(req.session.user.address),
  })

  // creating template for transaction email
  const messageBody = (template({
    order_num : Order.transactionId,
    order_details: CartDetails,
    delivery_details : JSON.parse(req.session.user.address),
    purchase_date : fullDate,
    name : req.user.dataValues.name,
    total : req.session.user.amounts[1],
    discountedAmount : req.session.user.amounts[0],
    shipping : shippingTotal / 100,
    subtotal : req.session.user.megaprice,
    tax : 0.02 * req.session.user.megaprice,
  }
  ))

  // confirmation email function
  function sendConfirmationEmail() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const message = {
      to: req.user.dataValues.email,
      subject: "Confirmation Email From HandyHandPhone",
      from: `Handy Hand Phone <${process.env.SENDGRID_SENDER_EMAIL}>`,
      html: messageBody
    };
    // Returns the promise from SendGrid to the calling function
    return new Promise((resolve, reject) => {
      sgMail.send(message)
        .then(response => resolve(response))
        .catch(err => console.log(err));
    });
  }
  sendConfirmationEmail();
  res.render("cart/success");
});

router.get('/cancel', async function (req, res) {
  res.clearCookie("voucherDiscount");
  res.clearCookie("DeliveryDiscount");
  res.clearCookie("sessionId");
  res.clearCookie("megaprice");
  res.clearCookie("Address");
  res.render("cart/cancel");
});

module.exports = router;