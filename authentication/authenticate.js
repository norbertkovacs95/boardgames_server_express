var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/users');
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var jwt = require('jsonwebtoken');
var config = require('../config');
var encryption = require('./encryption');

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
passport.use(new LocalStrategy(User.authenticate()));

var opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = config.secretKey;
passport.use(new JwtStrategy(opts,
    (jwt_payload, done) => {
        
        User.findOne({_id: jwt_payload._id}, (err, user) => {
            if (err) {
                return done(err, false);
            }
            else if (user) {
                return done(null, user);
            }
            else {
                return done(null, false);
            }
        });
    }
));

exports.verifyUser = passport.authenticate('jwt', { session: false });
exports.passport = passport;
exports.getToken = function(user) {
    return jwt.sign(user,config.secretKey, {
        expiresIn: 7200
    });
};
exports.verifyAdmin = function (req, res, next) {
    if (req.user.admin) {
        next();
    }
    else {
        err = new Error('You are not authorized to perform this operation!');
        err.status = 403;
        return next(err);        
    }
};
exports.verifyGameStartToken = function(req, res, next) {

    let gameStartToken = encryption.decrypter(req.header('gameStartToken'));
    let [user,difficulty,expiry] = gameStartToken.split('.');
    
    if (user == req.user._id && difficulty == req.body.difficulty) {
        next();
    } else {
        err = new Error('GameStartToken does not matches the game result');
        err.status = 401;
        return next(err);
    }
}