const moment = require('moment');

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

const getProperty = function(context , options){
    var ret = "";
    for(var prop in context)
    {
        ret = ret + options.fn({property:prop,value:context[prop]});
    }
    return ret;
}
module.exports = { formatDate, replaceCommas, checkboxCheck, radioCheck  , ifeq, calculate , getProperty};