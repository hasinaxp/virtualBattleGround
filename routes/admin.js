const express = require('express');
const multer = require('multer');
const path = require('path');
const FUNC = require('../controls/functions');



const router = express.Router();

//setting up the storage
const gameStorage = multer.diskStorage({
    destination: './public/gameimg/',
    filename: (req, file, cb) => {
        let data = { exten: path.extname(file.originalname) }
        req.data = data;
        cb(null, req.body.name + data.exten);
    }
});

const prepareStorage = (req, res, next) =>{
    req.imageStringArray = [];
    return next();
}
const feedImageStorage = multer.diskStorage({
    destination: './public/feedimage/',
    filename: (req, file, cb) => {
        let nameFile = FUNC.makeString('media') + path.extname(file.originalname);
        //pushing the path to the iamge array
        req.imageStringArray.push(nameFile);
        console.log(nameFile);
        cb(null, nameFile);
    }
});

const gameimageUpload = multer({
    storage: gameStorage
}).single('image');

const nupload = multer();

//Models
const User = require('../models/user');
const Game = require('../models/game');
const Match = require('../models/match');
const Tournament = require('../models/tournament');
const Feed = require('../models/feed');

//admin home route
router.get('/', (req, res) => {
    //finding matches
    Match.find({ state : 4 })
        //.sort({ date: -1 })
        .populate('challenged challenger game')
        .exec((err, matches) => {
            if (err) console.log(err);
            let matchResults = [];

            matches.forEach(m => {

                    let clng = {};
                    clng._id = m._id;
                    clng.gameName = m.game.name;
                    clng.date = m.date;
                    clng.balance = m.balance;
                    matchResults.push(clng);
            });
            //finding games
            Game.find({}, (err, games) => {
                if (err) console.log(err);
                
                //finding tournaments
                Tournament.find()
                .populate('game')
                .exec((err, tournaments) => {
                    if(err) console.log(err);
                    let tournamentsOngoing =[],
                        tournamentsYetToStart =[];
                    tournaments.forEach( tour => {
                        if(tour.stage == 0)
                            tournamentsYetToStart.push(tour);
                        else
                            tournamentsOngoing.push(tour);
                    });
                    res.render('admin', {
                        pageTitle: 'admin',
                        testMsg: 'working fine',
                        games: games,
                        userName: 'Spandan Mondal',
                        userCnt: 100000,
                        matches: matchResults,
                        tournaments_ongoing : tournamentsOngoing,
                        tournaments_yet_to_start : tournamentsYetToStart
                    });

                })
            });
        });
});


//------------------- admin events ----------------------------------

//decision info load route

router.get('/decision/:id', (req, res) => {
    Match.findById(req.params.id)
        .populate('challenged challenger game')
        .exec((err, m) => {
            if (err) console.log(err);

                let clng = {};
                clng._id = m._id;
                clng.gameName = m.game.name;
                i1 = m.challenger_evidance_state? m.challenger_evidance : 'no';
                i2 = m.challenged_evidance_state? m.challenged_evidance : 'no';
                clng.challenger = {
                    _id: m.challenger._id,
                    full_name: m.challenger.full_name,
                    email : m.challenger.email,
                    image: i1,
                }
                clng.challenged = {
                    full_name: m.challenged.full_name,
                    email : m.challenged.email,
                    image: i2,
                }
                clng.date = m.date;
                clng.balance = m.balance;
                console.log(i1);
                console.log(i2);
                res.json(clng);

    });
});

//decision route
router.post('/makeVictor', (req, res) => {
    let matchId = req.body.m_id;
    let victor = req.body.vic;
    console.log(req.body);
    FUNC.isTournament(matchId, () => {

    },() => {
        if(victor == 'p1') {
            Match.findByIdAndUpdate(matchId, {$set: {state: 2}})
            .exec((err, m) => {
                if(err) console.log(err);
                let gain = FUNC.calculateReward(m.balance);
                User.findByIdAndUpdate(m.challenger, {$inc: {balance : gain.m_bp, withdrawable_bp: gain.m_bp, total_bp_win : gain.m_bp, leader_point : gain.m_lp, total_win: 1}})
                .exec((err, s)=> {
                    if(err) console.log(err);
                    res.json({
                        data : s,
                        status : 'success'
                    })
                });              
            });
        }
        else {
            Match.findByIdAndUpdate(matchId, {$set: {state: 3}})
            .exec((err, m) => {
                if(err) console.log(err);
                let gain = FUNC.calculateReward(m.balance);
                User.findByIdAndUpdate(m.challenged, {$inc: {balance : gain.m_bp, withdrawable_bp: gain.m_bp, total_bp_win : gain.m_bp, leader_point : gain.m_lp, total_win: 1}})
                .exec((err, s)=> {
                    if(err) console.log(err);
                    res.json({
                        data : s,
                        status : 'success'
                    })
                });
            });
        }
    });
});

//game add route

router.post('/game/add', gameimageUpload, (req, res) => {
    let game = new Game();
    game.name = req.body.name;
    game.image = req.body.name + req.data.exten;
    game.requirement = req.body.requirement;
    game.platform = req.body.platform;
    game.player_count = req.body.player_count;

    game.save((err) => {
        if (err) console.log(err);
        else {
            res.json({
                status: 'done',
                info: game
            })
        }
    });

});

//game rmove route
router.post('/game/remove', nupload.fields([]), (req, res) => {
    console.log(req.body);
    let ids = Object.keys(req.body);
    console.log(ids);
    ids.forEach(x => {
        Game.findByIdAndRemove(x, (err, todo) => {
            if (err) console.log(err);
            else {
                res.json({
                    status: 'working'
                });
            }
        });
    });

});

//feed add route
router.post('/feed/add', prepareStorage, multer({storage: feedImageStorage}).array('image', 10),(req, res) => {
    console.log(req.body);
    console.log(req.imageStringArray);
    let feed = new Feed();
    feed.title = req.body.title;
    feed.content = req.body.content;
    feed.images = req.imageStringArray;
    feed.date  = Date.now();
    feed.save((err, f)=> {
        if(err) console.log(err);
        res.redirect('/admin'); 
    });
});
router.get('/feed', (req, res) => {
    Feed.find({})
    .exec((err, feeds) => {
        if(err) console.log(err);
        console.log(feeds);
        res.json({
            feeds : feeds,
            status: 1
        })
    });
});
router.get('/feed/delete/:id', (req, res) => {
    Feed.findByIdAndRemove(req.params.id)
    .exec((err, rem) => {
        if(err) console.log(err);
        res.json({
                msg : `feed removed successfuly`,
                status: 1
        });
    });
})


module.exports = router;