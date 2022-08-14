/*
* 'require' is similar to import used in Java and Python. It brings in the libraries required to be used
* in this JS file.
* */
const express = require('express');
const { engine } = require('express-handlebars');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const Handlebars = require('handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');
require('dotenv').config();
const fileUpload = require("express-fileupload");
const CartItem = require('./models/cart');
const Product = require('./models/Product');
const User = require('./models/User');

/*
* Creates an Express server - Express is a web application framework for creating web applications
* in Node JS.
*/
const app = express();

// Handlebars Middleware
/*
* 1. Handlebars is a front-end web templating engine that helps to create dynamic web pages using variables
* from Node JS.
*
* 2. Node JS will look at Handlebars files under the views directory
*
* 3. 'defaultLayout' specifies the main.handlebars file under views/layouts as the main template
*
* */
async function getUserCartCount(UserId) {
    const cart = await CartItem.findOne({ where: { UserId } });
    if (cart){
        const cartItems = await CartItem.findAll({ where: { id: cart.id } });
        var count = 0;
        cartItems.forEach(item => count += item.quantity)
    }
    else{
        count = 0
    }
    return count;
}

const helpers = require('./helpers/handlebars');
app.engine('handlebars', engine({
	helpers: helpers,
	handlebars: allowInsecurePrototypeAccess(Handlebars),
	defaultLayout: 'main' // Specify default template views/layout/main.handlebar 
}));
app.set('view engine', 'handlebars');

app.use(fileUpload());

// Express middleware to parse HTTP body in order to read HTTP data
app.use(express.urlencoded({
	extended: false
}));
app.use(express.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, 'public')));

// Enables session to be stored using browser's Cookie ID
app.use(cookieParser());

// Library to use MySQL to store session objects 
const MySQLStore = require('express-mysql-session');
var options = {
	host: process.env.DB_HOST,
	port: process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PWD,
	database: process.env.DB_NAME,
	clearExpired: true,
	// The maximum age of a valid session; milliseconds: 
	expiration: 3600000, // 1 hour = 60x60x1000 milliseconds
	// How frequently expired sessions will be cleared; milliseconds: 
	checkExpirationInterval: 1800000 // 30 min
};

// To store session information. By default it is stored as a cookie on browser
app.use(session({
	secret: process.env.APP_SECRET,
	store: new MySQLStore(options),
	resave: false,
	saveUninitialized: false,
}));

// Bring in database connection 
const DBConnection = require('./config/DBConnection');
// Connects to MySQL database 
DBConnection.setUpDB(process.env.DB_RESET == 1); // To set up database with new tables (true)

// Messaging library
const flash = require('connect-flash');
app.use(flash());
const flashMessenger = require('flash-messenger');
app.use(flashMessenger.middleware);

// Passport Config 
const passport = require('passport');
const passportConfig = require('./config/passportConfig');
passportConfig.localStrategy(passport);

// Initilize Passport middleware 

app.use(passport.initialize());
app.use(passport.session());

// Place to define global variables
app.use(async function (req, res, next) {
	res.locals.messages = req.flash('message');
	res.locals.errors = req.flash('error');
	res.locals.user = req.user || null;
	res.locals.cartcount  = req.isAuthenticated()
	? await getUserCartCount(req.user.id)
	: 0;
	next();  
});

// mainRoute is declared to point to routes/main.js
const mainRoute = require('./routes/main');
const userRoute = require('./routes/user');
const productRoute = require('./routes/product');
const adminRoute = require("./routes/admin");
const memberRoute = require("./routes/member");
const cartRoute = require("./routes/cart");
const ticketRoute = require("./routes/ticket");
const orderstatusRoute = require("./routes/orderstatus");
const deliverydetailsRoute = require("./routes/deliverydetails");
const scheduleRoute = require("./routes/schedule");




// Any URL with the pattern ‘/*’ is directed to routes/main.js
app.use('/', mainRoute);
app.use('/user', userRoute);
app.use('/product' , productRoute);
app.use('/admin' , adminRoute);
app.use('/cart' , cartRoute);
app.use('/member' , memberRoute);
app.use('/ticket' , ticketRoute);
app.use('/orderstatus', orderstatusRoute);
app.use('/deliverydetails', deliverydetailsRoute);
app.use('/schedule', scheduleRoute);




/*
* Creates a port for express server since we don't want our app to clash with well known
* ports such as 80 or 8080.
* */
const port = process.env.PORT;

// Starts the server and listen to port
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});