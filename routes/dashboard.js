const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');

const authenticate = require('../controls/authenticate');
const router = express.Router();
router.use(authenticate.kick);

const User = require('../models/user');
const Game = require('../models/game');
const Feed = require('../models/feed');
const Match = require('../models/match');
const Chat = require('../models/chat');
const FUNC = require('../controls/functions');


//dashboard home route
router.get('/', (req, res) => {
    //loading game list
    Game.find({}, (err, games) => {
        if (err) console.log(err);
        let gameList = [];
        let gamePocket = [];
        games.forEach(game => {

            let hasgame = false;
            req.data._user.games.forEach(x => {
                if (game._id.equals(x._id)) {
                    hasgame = true;
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
                    let clng = {};
                    clng._id = m._id;
                    clng.gameName = m.game.name;
                    clng.challenger = m.challenger ? {
                        _id: m.challenger._id,
                        full_name: m.challenger.full_name,
                        image: `../user/${m.challenger.folder}/${m.challenger.image}`,
                    } : {
                            full_name: 'undefined',
                            image: 'undefined',
                        };
                    clng.challenged = m.challenged ? {
                        full_name: m.challenged.full_name,
                        image: `../user/${m.challenged.folder}/${m.challenged.image}`,
                    } : {
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
                //console.log(challengeData);
                Feed.find({})
                    .exec((err, feeds) => {
                        if (err) console.log(err);
                        let profileImgPath = `../user/${req.data._user.folder}/${req.data._user.image}`;
                        res.render('dashboard', {
                            pageTitle: 'Dashboard',
                            userName: req.data._user.full_name,
                            balence: req.data._user.balance,
                            proImg: profileImgPath,
                            availableGames: gameList,
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
    .exec((err, feed)=> {
        if(err) console.log(err);
        res.json({
            feed : feed,
            status: 1
        })
    })
});

//dashboard game add route
router.post('/game/add', (req, res) => {
    User.update({ email: req.data._user.email }, {
        $push: {
            games: {
                _id: mongoose.Types.ObjectId(req.body.game_id),
                contact_string: req.body.contact_str
            }
        }
    }, (err, raw) => {
        if (err) console.log(err);
        res.redirect('/dashboard');
    });
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
    if (req.body.balance <= req.data._user.balance) {
        FUNC.createMatch(req.body.challenger, req.body.challenged, req.body.balance, req.body.game_id, 'normal', 'not necessary', 123456, (match) => {
            res.redirect('/dashboard');
        });
    }
    else {
        res.redirect('/dashboard/balanceError');
    }
});

//dashboard challenge remove route

router.get('/challenge/decline/:id', (req, res) => {
    Match.findByIdAndRemove(req.params.id, (err, done) => {
        if (err) console.log(err);
        else {
            res.redirect('/dashboard');
        }
    });
});

//dashboard challenge accept route
router.get('/challenge/accept/:id', (req, res) => {
    Match.findById(req.params.id)
        .populate('challenged challenger')
        .exec((err, mx) => {
            if (err) console.log(err);
            if ((mx.balance < mx.challenged.balance) && (mx.balance < mx.challenger.balance)) {
                let chat = new Chat();
                chat.save((err, chatInst) => {
                    Match.findByIdAndUpdate(req.params.id, { $set: { state: 1, chatroom: chatInst._id } })
                        .populate('challenged challenger')
                        .exec((err, mat) => {
                            if (err) console.log(err);
                            else {
                                //console.log(mat);
                                let newPath = req.app.locals.dat.basePath + '/public/matchImages/' + req.params.id;
                                //console.log(newPath);
                                if (!fs.existsSync(newPath)) {
                                    fs.mkdirSync(newPath);
                                }
                                FUNC.calculateBalance(mat.challenged._id, mat.balance, -1, "match initiated", () => {
                                    FUNC.calculateBalance(mat.challenger._id, mat.balance, -1, "match initiated", () => {
                                        res.redirect('/dashboard');
                                    });
                                });
                            }
                        });
                });
            } else if ((mx.balance < mx.challenged.balance) && (mx.balance > mx.challenger.balance)) {
                res.redirect('/dashboard/balanceError2');
            }
            else {
                res.redirect('/dashboard/balanceError');
            }
        });

});

//dashboard match route
router.get('/match/:id', (req, res) => {
    Match.findById(req.params.id)
        .populate('challenged challenger game chat')
        .exec((err, match) => {
            if (err) console.log(err);
            res.render('match', {
                gameName: match.game.name,
                matchId: match._id,
                challenger: match.challenger.full_name,
                challenged: match.challenged.full_name,
                time: match.date,
                bet: match.balance
            });

        });
});



module.exports = router;