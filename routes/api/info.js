const express = require('express');
const authentication = require('../../controls/authenticate');
const router = express.Router();

router.use(authentication.kick);

//-------------------------db schema constants-----------------------------------------------

const User = require('../../models/user');
const Game = require('../../models/game');
const Match = require('../../models/match');






//------------------------functional-----------------------------------------------------------
router.post('/getRequirement', (req, res) => {
    Game.findById(req.body.gameId, (err, game) => {
        if (err) res.json({ error: err });
        else res.json({ id: game._id.toString(), name: game.name, reqr: game.requirement, status: true });
    })
});

router.post('/getProfile', (req, res) => {
    User.findById(req.body.gameId, (err, user) => {
        if (err) res.json({ error: err });
        else{
            let profileImgPath = `../user/${user.folder}/${user.image}`;
            res.json({ name: user.full_name, image: profileImgPath, status: true });
        } 
    });
});

router.post('/getChallangerList', (req, res) => {
    let listx = [];
    if (req.body.name == '') {
        User.find({}).sort({ date: -1 })
            .exec((err, users) => {
                if (err) res.json({ error: err });
                else {
                    users.forEach(i => {
                        let dat = {};
                        dat.full_name = i.full_name;
                        dat._id = i._id;
                        dat.image = `../user/${i.folder}/${i.image}`;
                        dat.games = i.games;
                        if (i._id.equals(req.body.u_id)) {
                            //do nothing
                        } else {
                            listx.push(dat);
                        }
                    });
                    res.json({ list: listx, status: true });
                }
            });
    }
    else {
        User.find({ 'games._id': req.body.gameId, full_name: { $regex: req.body.name, $options: "i" } }).sort({ date: -1 })
            .exec((err, users) => {
                if (err) res.json({ error: err });
                else {
                    users.forEach(i => {
                        let dat = {};
                        dat.full_name = i.full_name;
                        dat._id = i._id;
                        dat.image = `../user/${i.folder}/${i.image}`;
                        dat.games = i.games;
                        if (i._id.equals(req.body.u_id)) {
                            //do nothing
                        } else {
                            listx.push(dat);
                        }
                    });
                    res.json({ list: listx, status: true });
                }
            });
    }

});


router.post('/getMatchInfo', (req, res) => {
    Match.findById(req.body.gameId)
    .populate('challenged challenger')
    .exec((err, m) => {
        if (err) res.json({ error: err });
        else{
            let information = {
                _id : m._id,
                date : m.date,
                challenger : {
                    full_name : m.challenger.full_name,
                    _id : m.challenger.id,
                },
                challenged : {
                    full_name : m.challenged.full_name,
                },
                state : m.state,
                balance : m.balance,
                fly : 0
            }

            if(req.data._user._id.equals(information.challenger._id))
                information.fly = 1

            res.json({info : information, status : true})
            
        } 
    });
});





















module.exports = router;