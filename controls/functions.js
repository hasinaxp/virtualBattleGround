const mongoose = require('mongoose');
const User = require('../models/user');
const Match = require('../models/match');
const async = require('async');
const Tournament = require('../models/tournament');
const match = require('../models/match');


function calcLev(leaderPoint) {
    levelExp = 40;
    level = 0;
    let lp = leaderPoint;
    while (lp >= levelExp) {
        level++;
        lp -= levelExp;
        if (levelExp < 200)
            levelExp *= 2;
        else
            levelExp *= 3;
    }
    return {
        m_level: level,
        m_levelExpPercent: Math.floor((lp / levelExp) * 100),
        m_lp: lp,
        m_next: levelExp - lp,
        m_total: leaderPoint
    }
};
function checkTournament(matchId, yesCallback, noCallback) {
    Match.findById(matchId)
        .exec((err, match) => {
            if (err) console.log(err);
            if (match.is_tournament == true) {
                console.log('tournament match');
                yesCallback();
            }
            else {
                noCallback();
            }
        });
};

exports.calculateLevel = calcLev;

//achevement calculaion
exports.calculateAchievements = (bp, lp, win) => {
    let achievementList = [];
    let unachievedList = [];
    //achievements ->
    let a_rookie = {
        title: 'Rookie',
        info: 'Reached level 5!',
        img: 'king.jpg'
    }
    let a_intermediate = {
        title: 'Intermediate',
        info: 'Reached level 10!',
        img: 'king.jpg'
    }
    let a_veteran = {
        title: 'Veteran',
        info: 'Reached level 20!',
        img: 'king.jpg'
    }
    let a_pro = {
        title: 'Pro',
        info: 'Reached level 50!',
        img: 'king.jpg'
    }
    let a_master = {
        title: 'Master',
        info: 'Reached level 100!',
        img: 'king.jpg'
    }
    let a_hungry = {
        title: 'Hungry',
        info: 'Has Won  50 Matches!',
        img: 'king.jpg'
    }
    let a_formidable = {
        title: 'Formidable',
        info: 'Has Won  100 Matches!',
        img: 'king.jpg'
    }
    let a_specialist = {
        title: 'Specialist',
        info: 'Has Won  500 Matches!',
        img: 'king.jpg'
    }
    let a_champion = {
        title: 'Champion',
        info: 'Has Won  1,000 Matches!',
        img: 'king.jpg'
    }
    let a_victor = {
        title: 'Victor',
        info: 'Has Won  10,000 Matches!',
        img: 'king.jpg'
    }
    let a_cashy = {
        title: 'Cashy',
        info: 'Has Earned 500 BP!',
        img: 'king.jpg'
    }
    let a_struggler = {
        title: 'Struggler',
        info: 'Has Earned 2,000 BP!',
        img: 'king.jpg'
    }
    let a_wealthy = {
        title: 'Wealthy',
        info: 'Has Earned 10,000 BP!',
        img: 'king.jpg'
    }
    let a_duke = {
        title: 'Duke',
        info: 'Has Earned 50,000 BP!',
        img: 'king.jpg'
    }
    let a_king = {
        title: 'King',
        info: 'Has Earned 100,000 BP!',
        img: 'king.jpg'
    }
    let a_emperor = {
        title: 'Emperor',
        info: 'Has Earned 500,000 BP!',
        img: 'king.jpg'
    }
    let a_millionear = {
        title: 'Millionear',
        info: 'Has Earned 1,000,000 BP!',
        img: 'king.jpg'
    }

    //achevement attachment
    let summary = calcLev(lp);
    let level = summary.m_level;

    if (level >= 5) achievementList.push(a_rookie);
    else unachievedList.push(a_rookie);

    if (level >= 10) achievementList.push(a_intermediate);
    else unachievedList.push(a_intermediate);

    if (level >= 20) achievementList.push(a_veteran);
    else unachievedList.push(a_veteran);

    if (level >= 50) achievementList.push(a_pro);
    else unachievedList.push(a_pro);

    if (level >= 100) achievementList.push(a_master);
    else unachievedList.push(a_master);

    if (win >= 50) achievementList.push(a_hungry);
    else unachievedList.push(a_hungry);

    if (win >= 100) achievementList.push(a_formidable);
    else unachievedList.push(a_formidable);

    if (win >= 500) achievementList.push(a_specialist);
    else unachievedList.push(a_specialist);

    if (win >= 1000) achievementList.push(a_champion);
    else unachievedList.push(a_champion);

    if (win >= 10000) achievementList.push(a_victor);
    else unachievedList.push(a_victor);

    if (bp >= 500) achievementList.push(a_cashy);
    else unachievedList.push(a_cashy);

    if (bp >= 2000) achievementList.push(a_struggler);
    else unachievedList.push(a_struggler);

    if (bp >= 10000) achievementList.push(a_wealthy);
    else unachievedList.push(a_wealthy);

    if (bp >= 50000) achievementList.push(a_duke);
    else unachievedList.push(a_duke);

    if (bp >= 100000) achievementList.push(a_king);
    else unachievedList.push(a_king);

    if (bp >= 500000) achievementList.push(a_emperor);
    else unachievedList.push(a_emperor);

    if (bp >= 1000000) achievementList.push(a_millionear);
    else unachievedList.push(a_millionear);


    return {
        achieved: achievementList,
        unachieved: unachievedList
    }
}


exports.calculateReward = (battlePoints) => {
    let bp = Math.floor(battlePoints * 1.8);
    let lp = Math.floor(battlePoints * 0.6 + 1);
    return {
        m_bp: bp,
        m_lp: lp
    }
}

exports.makeString = (type) => {
    if (type == 'connection') {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTijklmnopqrstuvwxyz0123456789";
        for (var i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
    }
    else if (type == 'user') {
        return 'u-' + new Date().valueOf() + '-' + Math.random().toString(36).substring(4);
    }
    else if (type == 'media') {
        return 'media-' + new Date().valueOf() + '-' + Math.random().toString(36).substring(4);
    }
    else {
        return `error! undefined type : ${type}`
    }
}
//calculating bp
exports.calculateBalance = (user_id, bp, mode,text, cb) => {
    let log = {};
    log.date = Date.now();
    log.bp = bp;
    log.mode = mode;
    log.text = text;
    bp = mode * bp;
    User.findById(user_id)
    .exec((err, userData) => {
        if(err) console.log(err);
        let newWithdrawableBalance = userData.withdrawable_balance + bp;
        if(newWithdrawableBalance > 0) {
            if (mode < 0) {
                User.findByIdAndUpdate(user_id, { $inc: { balance: bp, withdrawable_balance: bp }, $push: { balance_log: log } })
                    .exec((err, u) => {
                        if (err) console.log(err);
                        cb();
                    })
            } else {
                User.findByIdAndUpdate(user_id, { $inc: { balance: bp, withdrawable_balance: bp, total_bp_win: bp }, $push: { balance_log: log } })
                    .exec((err, u) => {
                        if (err) console.log(err);
                        cb();
                    })
            }
        } else {
                User.findByIdAndUpdate(user_id, { $inc: { balance: bp }, $push: { balance_log: log } })
                    .exec((err, u) => {
                        if (err) console.log(err);
                        cb();
                    })
        }
    });
    
};
//calculate leader points
exports.calculateLeaderPoints = (user_id, leaderPoints, cb) => {
    User.findByIdAndUpdate(user_id, {$inc: {leader_point : leaderPoints, total_win: 1}})
    .exec((err, user) => {
        if(err) console.log(err);
        cb();
    });
};


//disission
exports.matchDission = (matchId, winner, cb) => {
    if(winner == 'challenger') {
        Match.findByIdAndUpdate(matchId, {$set: {state: 2}})
            .exec((err, m) => {
                if(err) console.log(err);
                let data = {
                    winner : m.challenger,
                    match : m,
                    bp :m.balance
                };
                console.log(data);
                cb(data);    
            });

    }else if (winner == 'challenged'){
        Match.findByIdAndUpdate(matchId, {$set: {state: 3}})
            .exec((err, m) => {
                if(err) console.log(err);
                let data = {
                    winner : m.challenger,
                    match : m,
                    bp :m.balance
                };
                console.log(data);
                cb(data); 
            });
    }

};
//tournament helper function
exports.isTournament = checkTournament;

exports.getTournamentStatus = (tournamentId, cb) => {
    Tournament.findById(tournamentId)
        .exec((err, t) => {
            if (err) console.log(err);
            cb(t);
        })
}

exports.initTournament = (tournamentId, cb) => {
    Tournament.findById(tournamentId)
        .exec((err, tournament) => {
            if (err) console.log(err);
            //creating player pairs
            let pairs = [];
            for (let i = 0; i < tournament.join_counter; i += 2) {
                let pair = {};
                pair.first = tournament.players[i];
                pair.second = tournament.players[i + 1];
                pairs.push(pair);
            }
            let matchIds = [];
            async.each(pairs, (pair, callback) => {
                let match = new Match();
                match.challenger = mongoose.Types.ObjectId(pair.first);
                match.challenged = mongoose.Types.ObjectId(pair.second);
                match.balance = req.body.balance;
                match.game = mongoose.Types.ObjectId(req.body.game_id);
                match.is_tournament = true;
                match.save((err, m) => {
                    if (err) console.log(err);
                    matchIds.push(Mongoose.Types.ObjectId(m._id));
                    callback();
                });
            }, (err) => {
                if (err)
                    console.log(err);
                else {
                    Tournament.findByIdAndUpdate(tournamentId, { $set: { matchs: matchIds, stage: 1, compilation: 0 } })
                        .exec((err, t) => {
                            if (err) console.log(err);
                            cb(t);
                        })
                }
            });
        });
};

exports.advanceStage = (tournamentId, cb) => {

};

//get user info
exports.userInfoGetter = (user_id, cb) => {
    User.findById(user_id)
    .exec((err, user) => {
        if(err) console.log(err);
        cb(user);
    })
}



