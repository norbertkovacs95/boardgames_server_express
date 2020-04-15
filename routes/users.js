var express = require('express');
var bodyParser = require('body-parser');
var User = require('../models/users');
var authenticate = require('../authentication/authenticate');
var passport = authenticate.passport;
const cors = require('./cors');

var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.route('/')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.corsWithOptions, passport.authenticate('local'), authenticate.verifyAdmin, function(req, res, next) {
    User.find({})
      .then((users) => {
        res.statusCode = 200;
        res.setHeader('Content-Type','application/json');
        res.json(users);
      })
      .catch(err => next(err))
  });

router.route('/signup')
  .options(cors.corsWithOptions, (req, res) =>  res.sendStatus(200))
  .post(cors.corsWithOptions, (req, res, nex) => {
    User.register(
      new User({username: req.body.username, email: req.body.email, admin: false}),
      req.body.password, 
      (err, user) => {

        if(err) {
          if (err.name == "UserExistsError") {
            res.statusCode = 409;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
          } else {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
          }
        } 
        else {
            passport.authenticate('local')(req, res, () => {
              var token = authenticate.getToken({_id: req.user._id});
              res.statusCode = 200;
              res.setHeader('Content-Type','application/json');
              res.json({token: token, status: 200});
            })
        }
      })
  });

router.route('/login')
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .post(cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type','application/json');
    res.json({token:token, status: 200})  
  });

router.route('/verifyUser')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })  
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
      let user = {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        phone: req.user.phone,
        username:req.user.username,
        _id: req.user._id
      }
      res.statusCode = 200;
      res.setHeader('Content-Type','application/json');
      res.json({success: true, user: user, status: 'You are successfully logged in'});
  })

router.route('/logout')
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.corsWithOptions, (req, res, next) => {
    if(req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
    }
    else {
      var err = new Error('You are not logged in!');
      err.status = 403;
      next(err);
    }
  });

module.exports = router;
