const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');

const authenticate = require('../../controls/authenticate');
const router = express.Router();
router.use(authenticate.kick);

const User = require('../../models/user');
const Game = require('../../models/game');
const Feed = require('../../models/feed');
const Match = require('../../models/match');
const Chat = require('../../models/chat');
const FUNC = require('../../controls/functions');


//dashboard home route
router.post('/', (req, res) => {
    //loading game list
    Game.find({}, (err, games) => {
        if (err) console.log(err);
        let gameList = [];
        let gamePocket = [];
        games.forEach(game => {
            game = JSON.parse(JSON.stringify(game));
            let hasgame = false;
            req.data._user.games.forEach(x => {
                if (game._id == x._id) {
                    hasgame = true;
                    game.contact_string=x.contact_string;
                }
            });
            if (!hasgame) {
                gameList.push(game);
            }
            else {
                gamePocket.push(game);
            }
        });
        //loading challange log
        Match.find({ $or: [{ challenger: req.data._user._id }, { challenged: req.data._user._id }] })
            .populate('challenged challenger game')
            .exec((err, matches) => {
                if (err) console.log(err);
                let challengeData = [];
                let challengeOngoing = [];
                matches.forEach(m => {
                    console.log(m);
                    let clng = {};
                    clng._id = m._id;
                    clng.game = m.game;
                    clng.is_tournament = m.is_tournament;
                    clng.image = m.image;
                    clng.challenger = m.challenger ? {
                        _id: m.challenger._id,
                        full_name: FUNC.protectedString(m.challenger.full_name),
                        image: `user/${m.challenger.folder}/${m.challenger.image}`,
                    } : {
                            id : 0,
                            full_name: 'undefined',
                            image: 'undefined',
                        };
                    clng.challenged = m.challenged ? {
                        _id: m.challenged._id,
                        full_name: FUNC.protectedString(m.challenged.full_name),
                        image: `user/${m.challenged.folder}/${m.challenged.image}`,
                    } : {
                            id : 0,
                            full_name: 'undefined',
                            image: 'undefined',
                        };

                    clng.date = m.date;
                    clng.balance = m.balance;
                    if (m.state == 0)
                        challengeData.push(clng);
                    if (m.state == 1 || m.state == 4)
                        challengeOngoing.push(clng);
                });
              
                Feed.find({})
                    .exec((err, feeds) => {
                        if (err) console.log(err);

                        res.json({
                            gameList: gameList,
                            gamePocket: gamePocket,
                            challenges: challengeData,
                            matches: challengeOngoing,
                            feeds: feeds
                        });
                    });

            })//match finding ends here

    }); // game find function ends here....

});
//-----------------------------error Routes----------------------------------
//error
router.get('/error', (req, res) => {
    res.render('error', {
        pageTitle: 'error',
        errorMessage1: `Given data is incorrect`,
        errorMessage2: `please provide Correct Data`

    });
});
//balance error
router.get('/balanceError', (req, res) => {
    res.render('error', {
        pageTitle: 'error',
        errorMessage1: `your balance is ${req.data._user.balance}.`,
        errorMessage2: `You have insafficiant balance... please be honest.`

    });
});
router.get('/balanceError2', (req, res) => {
    res.render('error', {
        pageTitle: 'error',
        errorMessage1: `Challenger of this match has insufficient balance.`,
        errorMessage2: `you should cancel this match.`

    });
});
router.get('/ErrorUser', (req, res) => {
    res.render('error', {
        pageTitle: 'error',
        errorMessage1: `User Doesnot Exists`,
        errorMessage2: `This userId is invalid. Please try again.`

    });
});

//-----------------------------games routes----------------------------------
router.get('/feed/:id', (req, res) => {
    Feed.findById(req.params.id)
        .exec((err, feed) => {
            if (err) console.log(err);
            res.json({
                feed: feed,
                status: 1
            })
        })
});
//dashboard game update id
router.post('/game/updateid', (req, res) => {
    req.checkBody('game_id', 'game_id is required').notEmpty()
    req.checkBody('contact_string', 'contact_string is required').notEmpty()
    const errors = req.validationErrors()
    if(errors) {
        res.json({
            status: 'fail',
            errors
        })
    } else {
        User.findOne({"games.contact_string":FUNC.protectedString(req.body.contact_string)}, (err, raw) => {
            if(raw) {
                return res.json({
                    status: 'fail',
                    msg:'This gameid already exist'
                })  
            }
            User.findByIdAndUpdate( req.data._user._id, {
                $pull: {
                    games: { _id: mongoose.Types.ObjectId(req.body.game_id) }
                },
                $push: {
                    games: {
                        _id: mongoose.Types.ObjectId(req.body.game_id),
                        contact_string: FUNC.protectedString(req.body.contact_string)
                    }
                }
            }, (err, raw) => {
                if (err) console.log(err);
                res.json( {
                    status: 'ok',
                    msg: 'gameid updated successfully!'
                })
            });
        });        
    }
});
//dashboard game add route
router.post('/game/add', (req, res) => {
    req.checkBody('game_id', 'game_id is required').notEmpty()
    req.checkBody('contact_string', 'contact_string is required').notEmpty()
    const errors = req.validationErrors()
    if(errors) {
        res.json({
            status: 'fail',
            errors
        })
    } else {
        User.findOne({"games.contact_string":FUNC.protectedString(req.body.contact_string)}, (err, raw) => {
            if(raw) {
                return res.json({
                    status: 'fail',
                    msg:'This gameid already exist'
                })  
            }
            User.findByIdAndUpdate( req.data._user._id, {
                $push: {
                    games: {
                        _id: mongoose.Types.ObjectId(req.body.game_id),
                        contact_string: FUNC.protectedString(req.body.contact_string)
                    }
                }
            }, (err, raw) => {
                if (err) console.log(err);
                res.json( {
                    status: 'ok',
                    msg: 'game added successfully!'
                })
            });
        });        
    }
});
//dashboard game remove route

router.get('/game/remove/:id', (req, res) => {
    const reqUrl = req.params.id;
    console.log(reqUrl + ' : game removed');
    User.findByIdAndUpdate(req.data._user._id, {
        $pull: {
            games: { _id: reqUrl }
        }
    })
        .exec((err, dat) => {
            if (err) console.log(err);
            res.json({
                status: 'ok',
            })
        });
});

//dashboard game challange route
router.post('/game/challange', (req, res) => {
    req.checkBody('challenger', 'challenger must be defined').notEmpty()
    req.checkBody('challenged', 'challenged must be defined').notEmpty()
    req.checkBody('balance', 'balance must be defined').notEmpty()
    req.checkBody('game_id', 'game_id must be defined').notEmpty()

    let errors = req.validationErrors();
    if (errors) {
        res.json({
            errors,
            status: 'fail'
        })
    } else {
        if (req.body.balance == 0 || req.body.balance <= req.data._user.balance) {
            FUNC.createMatch(req.body.challenger, req.body.challenged, req.body.balance, req.body.game_id, 'normal', 'not necessary', 123456, (match) => {
                res.json({
                    status: 'ok'
                })
            });
        }
        else {
            res.json({
                errors : [{msg : 'insufficient balance', param: 'ins_balance'}],
                status: 'fail'
            })
        }
    }
});

//dashboard challenge remove route

router.post('/game/challange/decline', (req, res) => {
    req.checkBody('match_id', 'challenger must be defined').notEmpty()
    let errors = req.validationErrors();
    if (errors) {
        res.json({
            errors,
            status: 'fail'
        })
    }else {
        Match.findByIdAndRemove(req.body.match_id, (err, done) => {
            if (err) console.log(err);
            else {
                res.json({
                    status: 'ok'
                })
            }
        });
    }
});
router.get('/chat/listusers', (req, res) => {
    User.find({user_type:'normal'},'image _id email full_name folder', (err, user) => {
        res.send(user);
    });
});
//dashboard challenge accept route
router.post('/game/challange/accept', (req, res) => {
    req.checkBody('match_id', 'match_id must be defined').notEmpty()
    let errors = req.validationErrors();
    if (errors) {
        res.json({
            errors,
            status: 'fail'
        })
    }else {
    Match.findById(req.body.match_id)
        .populate('challenged challenger')
        .exec((err, mx) => {
            if (err) console.log(err);
            if ((mx.balance < mx.challenged.balance) && (mx.balance < mx.challenger.balance)) {
                let chat = new Chat();
                chat.save((err, chatInst) => {
                    Match.findByIdAndUpdate(req.body.match_id, { $set: { state: 1, chatroom: chatInst._id } })
                        .populate('challenged challenger')
                        .exec((err, mat) => {
                            if (err) console.log(err);
                            else {
                                //console.log(mat);
                                let newPath = req.app.locals.dat.basePath + '/public/matchImages/' + req.body.match_id;
                                //console.log(newPath);
                                if (!fs.existsSync(newPath)) {
                                    fs.mkdirSync(newPath);
                                }
                                FUNC.calculateBalance(mat.challenged._id, mat.balance, -1, "match initiated", () => {
                                    FUNC.calculateBalance(mat.challenger._id, mat.balance, -1, "match initiated", () => {
                                        res.json({
                                            status: 'ok'
                                        })
                                    });
                                });
                            }
                        });
                });
            } else if ((mx.balance < mx.challenged.balance) && (mx.balance > mx.challenger.balance)) {
                res.json({
                    errors: [{msg: 'challenger has insufficient Balance'}],
                    status: 'fail'
                });
            }
            else {
                res.json({
                    errors: [{msg: 'you have insufficient Balance'}],
                    status: 'fail'
                });
            }
        });
    }
});




module.exports = router;