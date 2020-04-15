const express = require('express');
const bodyParser = require('body-parser');
const pickPugPoopResultsRouter = express.Router();
const authenticate = require('../authentication/authenticate');
const cors = require('./cors');
const PickPugPoopResults = require('../models/pickpugpoopResult');

pickPugPoopResultsRouter.use(bodyParser.json());

// Configure '/'.options
pickPugPoopResultsRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200));

//Configure '/'.get
pickPugPoopResultsRouter.route('/')
    .get(cors.cors, (req,res,next) => {
        PickPugPoopResults.find({})
            .then((results) => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(results);
            })
            .catch(err => next(err));
        });

//Configure '/'.post
pickPugPoopResultsRouter.route('/')
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {

        let results = req.body;

        if (Array.isArray(results)) {
            results.forEach(result => result.username = req.user.username);    
        } else {
            results.username = req.user.username;
        }
        
        PickPugPoopResults.create(req.body)
            .then(result => {
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(result);
            })
            .catch(err => next(err));
        });

//Configure '/'.put
pickPugPoopResultsRouter.route('/')
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 501;
        res.end('PUT operation not supported');
    });

//Configure '/'.delete    
pickPugPoopResultsRouter.route('/')
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        PickPugPoopResults.remove({})
            .then(resp =>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(resp);
            })
            .catch(err => next(err));
        });


//Configure '/topPlayers'.options
pickPugPoopResultsRouter.route('/topPlayers')
    .options(cors.corsWithOptions, (req, res) => {res.sendStatus(200)});

//Configure '/topPlayers'.get
pickPugPoopResultsRouter.route('/topPlayers')
    .get(cors.cors, (req, res, next) => {

        let topResults = {
            easy:null,
            medium:null,
            hard:null
        }

        PickPugPoopResults.find({difficulty: 'easy'})
            .then(results => {
                topResults.easy = results.sort((a,b) => a.time > b.time)[0];
                return PickPugPoopResults.find({difficulty: 'medium'});
            })
            .then(results => {
                topResults.medium = results.sort((a,b) => a.time > b.time)[0];
                return PickPugPoopResults.find({difficulty: 'hard'});
            })
            .then(results => {
                topResults.hard = results.sort((a,b) => a.time > b.time)[0];

                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(topResults);
            })
            .catch((err) => next(err));
    })

 //Configure '/resultId'.options   
pickPugPoopResultsRouter.route('/:resultId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))


//Configure '/resultId'.get       
pickPugPoopResultsRouter.route('/:resultId')
    .get(cors.cors, (req,res,next) => {
        PickPugPoopResults.findById(req.params.resultId)
        .then(result=> {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
        })
        .catch(err => next(err));
    });

//Configure '/resultId'.post       
pickPugPoopResultsRouter.route('/:resultId')
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        res.statusCode = 501;
        res.end('POST operation not supported');
    });

//Configure '/resultId'.put       
pickPugPoopResultsRouter.route('/:resultId')
    .put(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req,res,next) => {
        PickPugPoopResults.findByIdAndUpdate(req.params.resultId,
        { $set: req.body }, { new: true}).then(result => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
        })
        .catch(err => next(err));
    });

//Configure '/resultId'.delete       
pickPugPoopResultsRouter.route('/:resultId')
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        PickPugPoopResults.findByIdAndDelete(req.params.resultId)
            .then(resp =>{
                res.statusCode = 200;
                res.setHeader('Content-Type','application/json');
                res.json(resp);
            })
            .catch(err => next(err));
    });
    
module.exports = pickPugPoopResultsRouter;