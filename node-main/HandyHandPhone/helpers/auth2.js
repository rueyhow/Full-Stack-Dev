const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');
const jwt = require('jsonwebtoken');
const flashMessage = require('../helpers/messenger');


function sendEmail(toEmail, url1) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const message = {
    to: toEmail,
    templateId: "d-b16b1c206dd14343ae5f5429430c92e3",
    from: `Handy Hand Phone <${process.env.SENDGRID_SENDER_EMAIL}>`,
    personalizations: [
      {
        to: toEmail,
        dynamic_template_data: {
          url: url1
        },
      },
    ],
  };

  // Returns the promise from SendGrid to the calling function
  return new Promise((resolve, reject) => {
    sgMail.send(message)
      .then(response => resolve(response))
      .catch(err => reject(err));
  });
}


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5000/user/google/callback",
  passReqToCallback: true,
},
  async function (request, accessToken, refreshToken, profile, done){

    console.log(profile.emails[0].value);
    User.findOne({where : { email: profile.emails[0].value }})
      .then((data) => {
        if (!data) {
          // let user = User.create({ name: profile.displayName , email : profile.emails[0].value , password: null, verified: 0, mobile: 0, member: false, admin: false, description: null, profilePicture: "none", websitePoints: 0 , birthday : null });
          // let token = jwt.sign(profile.emails[0].value, process.env.APP_SECRET);
          // let url = `${process.env.BASE_URL}:${process.env.PORT}/user/verify/${user.id}/${token}`;
          // sendEmail(profile.emails[0].value, url)
          //   .then(response => {
          //     console.log(response);
          //     done(null, data);
          //   })
          //   .catch(err => {
          //     console.log(err);
          //     done(null, data);
          //   });
          // return done(null, false);
        }
        else
        {
          if(data.verified == false)
          {
            return done(null, false);
          }
          else
          {
            done(null, data);
          }
        }
      })
  }));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});