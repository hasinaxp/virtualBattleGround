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
const feedStorage = multer.diskStorage({
    destination: './public/feedimage/',
    filename: (req, file, cb) => {
        let data = { exten: path.extname(file.originalname), name: FUNC.makeString('media') }
        req.data = data;
        cb(null, data.name + data.exten);
    }
});
const gameimageUpload = multer({
    storage: gameStorage
}).single('image');
const feedImageUpload = multer({
    storage: feedStorage
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
        if (victor == 'p1') {//if challenger wins
            FUNC.matchDission(req.body.m_id, 'challenger', (info) => {
                FUNC.getTournamentStatus(info.match.tournament, (tournament) => {
                    let lp = tournament.balance * 10 + 1;
                    FUNC.calculateLeaderPoints(info.winner, lp, () => {
                        FUNC.advanceStage(tournament._id, `${req.app.locals.dat.basePath}/public/matchImages`, () => {
                            res.redirect('/dashboard');
                        })
                    });
                });
            });
        }
        else {//if challenged wins
            FUNC.matchDission(req.body.m_id, 'challenged', (info) => {
                FUNC.getTournamentStatus(info.match.tournament, (tournament) => {
                    let lp = tournament.balance * 10 + 1;
                    FUNC.calculateLeaderPoints(info.winner, lp, () => {
                        FUNC.advanceStage(tournament._id, `${req.app.locals.dat.basePath}/public/matchImages`, () => {
                            res.redirect('/dashboard');
                        })
                    });
                });
            });
        }

    },() => {
        if(victor == 'p1') {
            FUNC.matchDission(req.body.m_id, 'challenger', (info) => {
                let reward = FUNC.calculateReward(info.bp);
                FUNC.calculateBalance(info.winner, reward.m_bp, 1, "Won in Match", () => {
                    FUNC.calculateLeaderPoints(info.winner, reward.m_lp, () => {
                        res.json({
                            status: 'challenger won'
                        });
                    });
                });
            });
        }
        else {//if challenged wins
            FUNC.matchDission(req.body.m_id, 'challenged', (info) => {
                let reward = FUNC.calculateReward(info.bp);
                FUNC.calculateBalance(info.winner, reward.m_bp, 1, "Won in Match", () => {
                    FUNC.calculateLeaderPoints(info.winner, reward.m_lp, () => {
                        res.json({
                            status: 'challenged won'
                        });
                    });
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
router.post('/feed/add', feedImageUpload,(req, res) => {
    console.log(req.body);
    console.log(req.imageStringArray);
    let feed = new Feed();
    feed.title = req.body.title;
    feed.content = req.body.content.replace(/\r?\n/g, '<br />');
    feed.image = req.data.name + req.data.exten;
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

//tournament ------------------
router.post('/tournament/create', (req, res) => {
    console.log(req.body);
    let tournament = new Tournament();
    tournament.balance = req.body.balance;
    tournament.player_count = req.body.player_count;
    tournament.game = req.body.game_id;
    tournament.rules = req.body.rules;
    //calculating maximum number of stages
    let i = 0, cap = req.body.player_count;
    let match_array = [];
    while (cap > 1) {
        i++;
        cap /= 2;
        match_array.push(cap);
    }
    tournament.matches_per_round = match_array;
    tournament.max_stage = i;
    tournament.join_counter = 1;
    tournament.save((err, s) => {
        if (err) console.log(err);
        else {
            console.log(s);
            res.json({
                status: `done`
            });
        }
    })
});


module.exports = router;