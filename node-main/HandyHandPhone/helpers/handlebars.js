const moment = require('moment');
const CartItem = require('../models/cart')

const formatDate = function (date, targetFormat) {
    return moment(date).format(targetFormat);
};

const replaceCommas = function(value) {
    return value ? value.replace(/,/g, ' | ') : 'None';
};

const checkboxCheck = function (value, checkboxValue) {
    return (value.search(checkboxValue) >= 0) ? 'checked' : '';
};

const radioCheck = function (value, radioValue) {
    return (value == radioValue) ? 'checked' : '';
};

const ifeq = function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
};

const calculate = function (a, b) {
    a = parseInt(a)
    b = parseInt(b)
    return a * b;
}

const isInCart = async function (pId, uId) {
    console.log("pId: ",pId)
    console.log("uId: ",uId)
    const productId = parseInt(pId);
    const userId = parseInt(uId);
    const cartItem = await CartItem.findOne({
        where: { userId, productId }
    })

    if (cartItem) {
        return true;
    } else {
        return false;
    }
}

module.exports = { formatDate, replaceCommas, checkboxCheck, radioCheck  , ifeq, calculate, isInCart};