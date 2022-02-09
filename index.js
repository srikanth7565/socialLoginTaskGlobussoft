const express = require('express');
const app = express();
const session = require('express-session');
const FacebookStrategy = require('passport-facebook').Strategy;
const config = require('./config')
const mongoose=require('mongoose');
const StudentModel = require('./studentschema');
const swaggerUi = require('swagger-ui-express'),
swaggerDocument = require('./swagger.json');


app.set('view engine', 'ejs');

app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: 'SECRET' 
}));

const CONNECTION_URL = 'mongodb+srv://mydb:sri974213@cluster0.czy9j.mongodb.net/social';

mongoose.connect(CONNECTION_URL, { useNewUrlParser : true, 
    useUnifiedTopology: true }, function(error) {
        if (error) {
            console.log("Error!" + error);
        }
    });

app.get('/', function(req, res) {
  res.render('pages/auth');
});

/*  PASSPORT SETUP  */

const passport = require('passport');
var userProfile;

app.use(passport.initialize());
app.use(passport.session());


app.get('/success', function (req, res){ 
    findfirst(),
    res.render('success.ejs', { 
    user: userProfile})
});
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

/*  Google AUTH  */
 
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GOOGLE_CLIENT_ID = '303722851318-jpg7hbaa69pcoqk0jbaa3dj2uqi3s4hr.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = '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';
passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
      userProfile=profile;      
      return done(null, userProfile);
  }
));
 
app.get('/auth/google', 
  passport.authenticate('google', { scope : ['profile', 'email'] }));
 
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/error' }),
  function(req, res) {
    // Successful authentication, redirect success.
    res.redirect('/success');
  });

//facebook auth
passport.use(new FacebookStrategy({
    clientID: config.facebookAuth.clientID,
    clientSecret: config.facebookAuth.clientSecret,
    callbackURL: config.facebookAuth.callbackURL
  }, function (accessToken, refreshToken, profile, done) {
    userProfile=profile;
    
    return done(null, profile);
  }
));


app.get('/auth/facebook', passport.authenticate('facebook', {
    scope: ['public_profile', 'email']
  }));
  
app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/success',
      failureRedirect: '/error'
    }));
  
  
  function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
      return next();
    res.redirect('/');
  }

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });

//database operations
function findfirst(req, res) {
    StudentModel.findOne({id:userProfile.id}, 
        function(err, data) {
            if(err){
                console.log(error);
                
            }
            else{
                if(data==null){
                    dbsave();
                }
                else{
                    console.log(data);
                    console.log("data exists");
                }
                
            }
        });  
  }

function dbsave(req, res){
   var newStudent = new StudentModel();
 
   newStudent.id = userProfile.id;
   newStudent.displayName = userProfile.displayName;
   
   newStudent.save(function(err, data){
    if(err){
        console.log(error);
    }
    else{
        console.log("data inserted");
    }
});
}

app.use(
    '/api-docs',
    swaggerUi.serve, 
    swaggerUi.setup(swaggerDocument)
  );

const port = process.env.PORT || 3000;
app.listen(port , () => console.log('App listening on port ' + port));