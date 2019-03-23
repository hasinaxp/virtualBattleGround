const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const jimp = require('jimp');
const authenticate = require('../../controls/authenticate');
const FUNC = require('../../controls/functions');
const router = express.Router();

//authentication kick 
router.use(authenticate.kick);


//--------multer storage defination----------------------------------
const imageStorage = multer.diskStorage({
    destination: './public/matchImages/',
    filename: (req, file, cb) => {
        //let nameFile = req.data._user.email + path.extname(file.originalname);
        // req.data.imageAddress = '/matchImages/' + req.body.m_id + '/' + nameFile;
        //console.log(nameFile);
        // cb(null, nameFile);
        let data = { exten: path.extname(file.originalname), name: FUNC.makeString('media') }
        req.data = data;
        req.data.imageAddress = '/matchImages/' + req.data.name+req.data.exten;
        console.log("=====original image address======");
        console.log(req.data.imageAddress);
        cb(null, req.data.name + data.exten);
    }
});
const imageUpload = multer({
    storage: imageStorage
}).single('image');


// database models
const User = require('../../models/user');
const Game = require('../../models/game');
const Match = require('../../models/match');



//match info route
router.post('/m/:match_id', (req, res) => {
    Match.findById(req.params.match_id)
        .populate('challenged challenger game chatroom')
        .exec((err, match) => {
            if (err) console.log(err);
            if(!match) {
                return;
            }
            let isChallenger = false;
            let contactReferance = '';
            if (req.data._user._id.equals(match.challenger._id)) {
                isChallenger = true;
            }
            let ur = isChallenger ? match.challenged : match.challenger;
            let challengerStatus = isChallenger ? 1 : 0;
            ur.games.forEach(g => {
                if (match.game._id.equals(g._id)) {
                    //console.log('matched!');
                    contactReferance = g.contact_string;
                }
            });
            let matchTime = new Date(match.date);
            let matchDate = matchTime.getUTCDay() + ' / ' + matchTime.getMonth() + ' / ' + matchTime.getFullYear();
            matchDate += ` - ${matchTime.getUTCHours()} : ${matchTime.getUTCMinutes()}`
            res.json({
                status: 'ok',
                game: match.game,
                contact_string: contactReferance,
                match_id: match._id,
                challenger: match.challenger,
                c_id: match.challenger._id,
                user_id: req.data._user._id,
                chat_id: match.chatroom._id,
                challenged: match.challenged,
                time: matchDate,
                bet: match.balance,
                sender: req.data._user._id,
                state: match.state,
                isChallenger: challengerStatus
            })

        });
});

//-------------------------match functions-----------------------------------------------
//request admin
//need to implement
router.post('/requestAdmin', (req, res) => {
    let user = mongoose.Types.ObjectId(req.data._user._id);
    Match.findById(req.body.m_id)
        .exec((err, match) => {
            if (match.challenger.equals(user)) {
                Match.findByIdAndUpdate(req.body.m_id, { $set: { challenger_msg: req.body.msg } })
                    .exec((err, m) => {
                        res.json({
                            msg: 'msg post successfully'
                        })
                    });
            }
            if (match.challenged.equals(user)) {
                Match.findByIdAndUpdate(req.body.m_id, { $set: { challenged_msg: req.body.msg } })
                    .exec((err, m) => {
                        res.json({
                            msg: 'msg post successfully'
                        })
                    });
            }
        })
});

// admitting defeat
router.post('/admitDefeat', (req, res) => {
    console.log(req.body)
    req.checkBody('m_id', 'm_id must be supplied').notEmpty()
    req.checkBody('is_c', 'is_c must be supplied').notEmpty()
    const errors = req.validationErrors()
    if (errors) {
        res.json({
            status: 'fail',
            errors
        })
    } else {
        FUNC.isTournament(req.body.m_id, () => {
            if (req.body.is_c == 0) {//if challenger wins
                FUNC.matchDission(req.body.m_id, 'challenger', (info) => {
                    FUNC.getTournamentStatus(info.match.tournament, (tournament) => {
                        let lp = tournament.balance * 10 + 1;
                        FUNC.calculateLeaderPoints(info.winner, lp, () => {
                            FUNC.advanceStage(tournament._id, `${req.app.locals.dat.basePath}/public/matchImages`, () => {
                                res.json({
                                    msg: 'admitted defeat successfully!',
                                    status: 'ok'
                                })
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
                                res.json({
                                    msg: 'admitted defeat successfully!',
                                    status: 'ok'
                                })
                            })
                        });
                    });
                });
            }

        }, () => {
            if (req.body.is_c == 0) {//if challenger wins
                FUNC.matchDission(req.body.m_id, 'challenger', (info) => {
                    let reward = FUNC.calculateReward(info.bp);
                    FUNC.calculateBalance(info.winner, reward.m_bp, 1, "Won in Match", () => {
                        FUNC.calculateLeaderPoints(info.winner, reward.m_lp, () => {
                            res.json({
                                msg: 'admitted defeat successfully!',
                                status: 'ok'
                            })
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
                                msg: 'admitted defeat successfully!',
                                status: 'ok'
                            })
                        });
                    });
                });
            }
        });
    }
});

//claiming victory
router.post('/claimVectory', imageUpload, (req, res) => {
    //console.log(req)
    let image = `${req.app.locals.dat.basePath}/public${req.data.imageAddress}`
    console.log("------original image---------");
    console.log(image);
    if (req.body.is_c == 1) {
        Match.findByIdAndUpdate(req.body.m_id, { $set: { state: 4, challenger_evidance: req.data.imageAddress, challenger_evidance_state: true } }, (err, m) => {
            let image = `${req.app.locals.dat.basePath}/public${req.data.imageAddress}`
            console.log("------original image---------");
            console.log(image);
            jimp.read(image, function (err, lenna) {
                if (err) throw err;
                lenna
                    .resize(680, jimp.AUTO)
                    .quality(80)                 // set JPEG quality
                    .write(image); // save
            });
            res.json({
                msg: 'screenshot uploaded successfully!',
                status: 'ok'
            });
        });
    }
    else {
        Match.findByIdAndUpdate(req.body.m_id, { $set: { state: 4, challenged_evidance: req.data.imageAddress, challenged_evidance_state: true } }, (err, m) => {
            let image = `${req.app.locals.dat.basePath}/public${req.data.imageAddress}`
            jimp.read(image, function (err, lenna) {
                if (err) throw err;
                lenna
                    .resize(680, jimp.AUTO)
                    .quality(80)                 // set JPEG quality
                    .write(image); // save
            });
            res.json({
                msg: 'screenshot uploaded successfully!',
                status: 'ok'
            });
        });
    }

})



module.exports = router;