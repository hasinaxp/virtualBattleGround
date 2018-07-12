const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../controls/authenticate');
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
    tournament.save((err, s) => {
        if(err) console.log(err);
        else {
            res.json({
                status: `done`
            });
        }
    })
});

router.get('/', (req, res) => { 
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;
    res.render('tournament', {
        pageTitle: 'tournament',
        proImg: profileImgPath,
        userName: req.data._user.full_name,
        balence: req.data._user.balance,
        user: req.data._user
    });
});

router.get('/join/:tournament_id/:_id', (req, res) => {
    let _id = mongoose.Types.ObjectId(req.params._id);
    Tournament.findById(req.params.tournament_id)
    .exec((err, tournament) => {
        if(err) console.log(err);
        if(tournament.join_counter <= tournament.player_count) {
            let query = `{$set: {player_${tournament.join_counter} : ${_id}}}`;
        Tournament.findByIdAndUpdate(req.params.tournament_id, query)
        .exec((err, joined)=> {
            if(err) console.log(err);
            //TODO : redirect to that specific tournament page
        });
        } else {
            //TODO: tournament filled ... joining closed!
        }
    });
});


module.exports = router;