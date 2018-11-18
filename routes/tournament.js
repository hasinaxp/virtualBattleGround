const express = require('express');
const mongoose = require('mongoose');
const _ = require('underscore');
const authenticate = require('../controls/authenticate');
const FUNC = require('../controls/functions');
const router = express.Router();
router.use(authenticate.kick);


//databases
const User = require('../models/user');
const Tournament = require('../models/tournament');


//---------routes------------------------------------------------------

router.get('/', (req, res) => {
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;
    let myGames = [];
    req.data._user.games.forEach(g => myGames.push(mongoose.Types.ObjectId(g._id)));
        FUNC.getTournamentsUser(req.data._user._id, myGames, (data) => {
            //console.log(data);
            res.render('tournament', {
                pageTitle: 'tournament',
                proImg: profileImgPath,
                userName: req.data._user.full_name,
                balence: req.data._user.balance,
                user: req.data._user,
                tournaments: data,
            });
        });
});


router.get('/join/:tournament_id', (req, res) => {
    let id = mongoose.Types.ObjectId(req.data._user._id);
    FUNC.getTournamentStatus(req.params.tournament_id, (tournament) => {
        if (req.data._user.balance > tournament.balance) {
            FUNC.calculateBalance(req.data._user._id, tournament.balance, -1, "Joined tournament",() =>{
            Tournament.findByIdAndUpdate(req.params.tournament_id, { $push: { players: id }, $inc: { join_counter: 1 } })
                .exec((err, joined) => {
                    if (err) console.log(err);
                    if (tournament.join_counter < tournament.player_count) {
                        res.json({
                            status : 1
                        })
                    } else {
                        FUNC.initTournament(req.params.tournament_id,`${req.app.locals.dat.basePath}/public/matchImages`, (tournament) => {
                            //console.log(tournament);
                            res.json({
                                status : 1
                            });
                        });
                    }
                });
            });
        }else {
            res.json({
                status : 0
            });
        }
    });
});

router.get('/:id', (req, res) => {
    Tournament.findById(req.params.id)
        .populate('game players')
        .exec((err, tournament) => {
            if (err) console.log(err);
            FUNC.isInTournament(req.params.id, req.data._user._id, (isInTournament) => {
                let prize = Math.floor((tournament.balance * tournament.player_count) * 9 / 10);
                let prize1 = Math.floor(prize * 0.6);
                let prize2 = Math.floor(prize * 0.4);
                res.render('tournamentDetail', {
                    gameName: tournament.game.name,
                    tournamentId: tournament._id,
                    players : tournament.players,
                    capacity: tournament.player_count,
                    prize1: prize1,
                    prize2: prize2,
                    bet: tournament.balance,
                    time: tournament.date,
                    stage: tournament.stage,
                    pageTitle: 'tournament | detail',
                    isPlaying: isInTournament,
                    rules : tournament.rules
                });
            })
        });
});

router.get('/bracket/:id', (req, res) => {
    console.log(req.params.id);
    FUNC.getTournamentTree(req.params.id, (data) => {
        console.log(data);
        res.json({
            data: data,
            status : 1
        });
    })
});


module.exports = router;