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
router.post('/create', (req, res) => {
    console.log(req.body);
    let tournament = new Tournament();
    tournament.balance = req.body.balance;
    tournament.player_count = req.body.player_count;
    tournament.game = req.body.game_id;
    //calculating maximum number of stages
    let i = 0, cap = req.body.player_count;
    while (cap > 1) {
        i++;
        cap /= 2;
    }
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

router.get('/', (req, res) => {
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;
    let myGames = [];
    req.data._user.games.forEach(g => myGames.push(mongoose.Types.ObjectId(g._id)));
    Tournament.find()
    .populate('game')
        .exec((err, tournaments) => {
            if (err) console.log(err);
            let tournamentsOngoing = [],
                tournamentsYetToStart = [];
            tournaments.forEach(tour => {
                if (tour.stage == 0)
                    tournamentsYetToStart.push(tour);
                else
                    tournamentsOngoing.push(tour);
            });
            console.log(tournamentsYetToStart);
            res.render('tournament', {
                pageTitle: 'tournament',
                proImg: profileImgPath,
                userName: req.data._user.full_name,
                balence: req.data._user.balance,
                user: req.data._user,
                tournaments_ongoing: tournamentsOngoing,
                tournaments_yet_to_start: tournamentsYetToStart
            });
        });

});

router.get('/join/:tournament_id/:_id', (req, res) => {
    let _id = mongoose.Types.ObjectId(req.params._id);
    FUNC.getTournamentStatus(req.params.tournament_id, (tournament) => {
        if (tournament.join_counter < tournament.player_count) {
            Tournament.findByIdAndUpdate(req.params.tournament_id, { $push: { players: req.params._id }, $inc : {join_counter : 1} })
                .exec((err, joined) => {
                    if (err) console.log(err);
                    //TODO : redirect to that specific tournament page
                });
        } else {
            FUNC.initTournament(req.params.tournament_id, (tournament) => {
                console.log(tournament);
            });
        }
    });
});

router.get('/:id',(req,res)=>{

    Tournament.findById(req.params.id)
    .populate('game')
    .exec((err,tournament)=> {
        if(err) console.log(err);
        let prize = Math.floor((tournament.balance * tournament.player_count) * 9/10);
        let prize1 = Math.floor(prize * 0.6);
        let prize2 = Math.floor(prize * 0.4);

        res.render('tournamentDetail', {
            gameName : tournament.game.name,
            tournamentId : tournament._id,
            capacity : tournament.player_count,
            prize1 : prize1,
            prize2 : prize2,
            bet : tournament.balance,
            time : tournament.date,
            stage : tournament.stage,
            pageTitle: 'tournament | detail',
            isPlaying : false
        })

    });

});


module.exports = router;