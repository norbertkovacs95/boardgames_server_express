const express = require('express');
const bodyParser = require('body-parser');
const moviesRouter = express.Router();
const authenticate = require('../authentication/authenticate');
const cors = require('./cors');
const Movies = require('../models/movies');

moviesRouter.use(bodyParser.json());


// Configure '/'
moviesRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req,res,next) => {
        Movies.find({}).then((movies) => {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(movies);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Movies.create(req.body).then((movie) => {
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(movie);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /Movies');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Movies.remove({}).then((resp) =>{
            res.statusCode = 200;
            res.setHeader('Content-Type','application/json');
            res.json(resp);
        }, (err) => next(err))
        .catch((err) => next(err));
    });


// Configure '/movieId'
moviesRouter.route('/:movieId')
    .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
    .get(cors.cors, (req,res,next) => {
        Movies.findById(req.params.movieId)
        .then((movie) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(movie);
        }, (err) => next(err))
        .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
        res.statusCode = 403;
        res.end('POST operation not supported on /Movies/:' + req.params.movieId);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Movies.findByIdAndUpdate(req.params.movieId, 
            { $set: req.body }, { new: true}).then((movie) => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(movie);
            }, (err) => next(err))
            .catch((err) => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Movies.findByIdAndDelete(req.params.movieId)
            .then((resp) =>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(resp);
            }, (err) => next(err))
            .catch((err) => next(err));
    });


module.exports = moviesRouter;