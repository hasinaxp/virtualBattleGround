const express = require('express');
const mongoose = require('mongoose');
const _ = require('underscore');
const authenticate = require('../../controls/authenticate');
const FUNC = require('../../controls/functions');
const router = express.Router();
router.use(authenticate.kick);


//databases
const User = require('../../models/user');
const Tournament = require('../../models/tournament');


//---------routes------------------------------------------------------

router.post('/', (req, res) => {
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;
    let myGames = [];
    req.data._user.games.forEach(g => myGames.push(mongoose.Types.ObjectId(g._id)));
    FUNC.getTournamentsUser(req.data._user._id, myGames, (data) => {
        //console.log(data);
        res.json({
            user: req.data._user,
            tournaments: data,
        });
    });
});


router.post('/join', (req, res) => {
    req.checkBody('tournament_id', 'tournament_id is required!').notEmpty()
    const errors = req.validationErrors()
    if (errors) {
        res.json({
            status: 'fail',
            errors
        })
    } else {
        let id = mongoose.Types.ObjectId(req.data._user._id);
        FUNC.getTournamentStatus(req.body.tournament_id, (tournament) => {
            if (!tournament.players || tournament.players.length < tournament.player_count) {
                FUNC.calculateBalance(req.data._user._id, tournament.balance, -1, "Joined tournament", () => {
                    Tournament.findByIdAndUpdate(req.body.tournament_id, { $push: { players: id }, $inc: { join_counter: 1 } })
                        .exec((err, joined) => {
                            if (err) console.log(err);
                            if (tournament.join_counter < tournament.player_count) {
                                res.json({
                                    status: 'ok',
                                    msg : 'tournament joined successfully'
                                })
                            } else {
                                FUNC.initTournament(req.body.tournament_id, `${req.app.locals.dat.basePath}/public/matchImages`, (tournament) => {
                                    res.json({
                                        status: 'ok',
                                        msg : 'tournament joined successfully'
                                    });
                                });
                            }
                        });
                });
            } else {
                res.json({
                    status: 0,
                });
            }
        });
    }
});

router.post('/:id', (req, res) => {
    Tournament.findById(req.params.id)
        .populate('game players')
        .exec((err, tournament) => {
            if (err) console.log(err);
            FUNC.isInTournament(req.params.id, req.data._user._id, (isInTournament) => {
                let prize = Math.floor((tournament.balance * tournament.player_count) * 9 / 10);
                let prize1 = Math.floor(prize * 0.6);
                let prize2 = Math.floor(prize * 0.4);
                res.json({
                    status: 'ok',
                    game: tournament.game,
                    players: tournament.players,
                    capacity: tournament.player_count,
                    prize1: prize1,
                    prize2: prize2,
                    bet: tournament.balance,
                    time: tournament.date,
                    stage: tournament.stage,
                    isPlaying: isInTournament,
                    rules: tournament.rules
                });
            })
        });
});

router.post('/bracket/:id', (req, res) => {
    FUNC.getTournamentTree(req.params.id, (data) => {
        console.log('ok');
        res.json({
            bracket: data,
            status: 'ok'
        });
    })
});


module.exports = router;