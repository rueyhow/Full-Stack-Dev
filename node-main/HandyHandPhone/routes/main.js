const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');




router.get('/', async function(req, res){
    req.session.user = {};
	res.render('home');
});


router.get('/aboutUs', (req, res) => {
	res.render('about/index');
});


router.post('/flash', (req, res) => {
	const message = 'This is an important message';
	const error = 'This is an error message';
	const error2 = 'This is the second error message';

    // req.flash('message', message);
    // req.flash('error', error);
    // req.flash('error', error2);

    flashMessage(res, 'success', message);
    flashMessage(res, 'info', message);
    flashMessage(res, 'error', error);
    flashMessage(res, 'error', error2, 'fas fa-sign-in-alt', true);

	res.redirect('/about');
});

module.exports = router;
