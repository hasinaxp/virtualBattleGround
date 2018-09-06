const express = require('express');
const mongoose = require('mongoose');


const authenticate = require('../controls/authenticate');
const FUNC = require('../controls/functions');

const router = express.Router();
router.use(authenticate.kick);

const User = require('../models/user');

//--------constants--------------------------------------------------
const CHAMP_NUMBER = 100;



//---------routes------------------------------------------------------

router.get('/', (req, res) => {
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;

    let levelInfo = FUNC.calculateLevel(req.data._user.leader_point);
    console.log(levelInfo);
    let achieveInfo = FUNC.calculateAchievements(req.data._user.total_bp_win, req.data._user.leader_point, req.data._user.total_win);

    User.find()
        .sort({leader_point: -1})
        .limit(CHAMP_NUMBER)
        .exec((err, ur) => {
            if (err) console.log(err);
            let championList = [];
            if (ur) {
                let rank = 1;
                ur.forEach(u => {
                    let dat = {};
                    dat._id = u._id;
                    dat.rank = rank;
                    dat.full_name = u.full_name;
                        dat.leader_point = u.leader_point;
                    dat.img = `/user/${u.folder}/${u.image}`;
                    rank++;
                    championList.push(dat);
                });

                res.render('leaderboard', {
                    pageTitle: 'leaderboard',
                    proImg: profileImgPath,
                    userName: req.data._user.full_name,
                    balence: req.data._user.balance,
                    user: req.data._user,
                    lev: levelInfo,
                    achieve: achieveInfo,
                    champions: championList
                });
            }
        });


});



module.exports = router;