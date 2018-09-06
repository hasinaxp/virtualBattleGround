const mongoose = require('mongoose');
const User = require('../models/user');
const Match = require('../models/match');
const async = require('async');
const _ = require('underscore');
const Tournament = require('../models/tournament');
const Chat = require('../models/chat');
const fs = require('fs');


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
//function to generate match
//matchDirPath and tournamentId are required for generating tournament match, otherwise pass any value.
function genMatch(challenger, challenged, balance, game, type, matchDirPath, tournamentId, cb) {
    let match = new Match();
    match.challenger = mongoose.Types.ObjectId(challenger);
    match.challenged = mongoose.Types.ObjectId(challenged);
    match.game = mongoose.Types.ObjectId(game);
    if (type == 'tournament') {
        match.balance = 0;
        match.is_tournament = true;
        match.tournament = mongoose.Types.ObjectId(tournamentId);
        match.save((err, m) => {
            if (err) console.log(err);
            else {
                let chat = new Chat();
                chat.save((err, chatInst) => {
                    if (err) console.log(err);
                    Match.findByIdAndUpdate(m._id, { $set: { state: 1, chatroom: chatInst._id } })
                        .populate('challenged challenger')
                        .exec((err, mat) => {
                            if (err) console.log(err);
                            else {
                                console.log(mat);
                                let newPath = `${matchDirPath}/${m._id}`;
                                console.log(newPath);
                                if (!fs.existsSync(newPath)) {
                                    fs.mkdirSync(newPath);
                                }
                                console.log('match registered successfully!');
                                cb(m);
                            }
                        });
                });

            }
        });
    }
    else {
        match.balance = balance;
        match.is_tournament = false;
        match.save((err, m) => {
            if (err) console.log(err);
            else {
                console.log('match registered successfully!');
                cb(m);
            }
        });
    }
}
exports.createMatch = genMatch;

function adjustBalance(user_id, bp, mode, text, cb){
    let log = {};
    log.date = Date.now();
    log.bp = bp;
    log.mode = mode;
    log.text = text;
    bp = mode * bp;
    User.findById(user_id)
        .exec((err, userData) => {
            if (err) console.log(err);
            let newWithdrawableBalance = userData.withdrawable_balance + bp;
            if (newWithdrawableBalance > 0) {
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
//calculating bp
exports.calculateBalance = adjustBalance; 
//calculate leader points
exports.calculateLeaderPoints = (user_id, leaderPoints, cb) => {
    User.findByIdAndUpdate(user_id, { $inc: { leader_point: leaderPoints, total_win: 1 } })
        .exec((err, user) => {
            if (err) console.log(err);
            cb();
        });
};


//disission
exports.matchDission = (matchId, winner, cb) => {
    if (winner == 'challenger') {
        Match.findByIdAndUpdate(matchId, { $set: { state: 2 } })
            .exec((err, m) => {
                if (err) console.log(err);
                let data = {
                    winner: m.challenger,
                    match: m,
                    bp: m.balance
                };
                console.log(data);
                cb(data);
            });

    } else if (winner == 'challenged') {
        Match.findByIdAndUpdate(matchId, { $set: { state: 3 } })
            .exec((err, m) => {
                if (err) console.log(err);
                let data = {
                    winner: m.challenger,
                    match: m,
                    bp: m.balance
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

exports.getTournamentsUser = (user_id, games, cb) => {
    let newTournaments = [];
    let perticipationTournaments = [];
    Tournament.find({ game: { $in: games } })
        .populate('game')
        .exec((err, tournaments) => {
            if (err) console.log(err);
            tournaments.forEach(tour => {
                //console.log(tour.players);
                //console.log(user_id.toString());
                if(!tour.has_ended) {
                    let players = tour.players.map(p => p.toString());
                if (_.contains(players, user_id.toString()))
                    perticipationTournaments.push(tour);
                else
                    newTournaments.push(tour);
                }
            });
            let data = {
                participating: perticipationTournaments,
                not_participating: newTournaments
            }
            //console.log(data);
            cb(data);
        });
};

exports.initTournament = (tournamentId, matchDirPath, cb) => {
    Tournament.findById(tournamentId)
        .exec((err, tournament) => {
            if (err) console.log(err);
            //creating player pairs
            let pairs = [];
            for (let i = 0; i < tournament.join_counter - 2; i += 2) {
                let pair = {};
                pair.first = tournament.players[i];
                pair.second = tournament.players[i + 1];
                pairs.push(pair);
                console.log(pair);
            }
            console.log(pairs);
            let matchIds = [];
            async.eachSeries(pairs, (pair, callback) => {
                console.log(pair);
                genMatch(pair.first, pair.second, tournament.balance, tournament.game, 'tournament', matchDirPath,tournamentId, (m) => {
                    matchIds.push(mongoose.Types.ObjectId(m._id));
                    callback();
                });
            }, (err) => {
                if (err)
                    console.log(err);
                else {
                    console.log('tournament initiated');
                    Tournament.findByIdAndUpdate(tournamentId, { $set: { matches: matchIds, stage: 1, compilation: 0 } })
                        .exec((err, t) => {
                            if (err) console.log(err);
                            cb(t);
                        })
                }
            });
        });
};
//to check if a stage of tournament is completed
function checkCompilation(tournamentId, cb) {
    Tournament.findById(tournamentId)
        .populate('matches')
        .exec((err, tournament) => {
            if (err) console.log(err);
            let startingIndex = 0;
            let endingIndex = 0;
            for (let i = 0; i < tournament.stage; i++)
                endingIndex += tournament.matches_per_round[i];
            if (tournament.stage > 1)
                for (let i = 0; i < tournament.stage - 1; i++)
                startingIndex += tournament.matches_per_round[i];
            else
                startingIndex = 0;
            let matchArray = tournament.matches.slice(startingIndex, endingIndex);
            let completed = 2;
            matchArray.forEach(m => {
                if (!(m.state == 2 || m.state == 3))
                    completed = 1;
            })
            let nextGen = [];
            if (completed) {
                matchArray.forEach(m => {
                    if (m.state == 2)
                        nextGen.push(m.challenger);
                    else if (m.state == 3)
                        nextGen.push(m.challenged);
                });
            }
            if (completed == 2 && tournament.stage == tournament.max_stage)
                completed = 3;
            if (completed == 3) {
                let finalMatch = tournament.matches[tournament.matches.length - 1];
                let winner, runnerUp;
                if (finalMatch.state == 2) {
                    winner = finalMatch.challenger;
                    runnerUp = finalMatch.challenged;
                } else {
                    winner = finalMatch.challenged;
                    runnerUp = finalMatch.challenger;
                }
                data = {
                    winner : winner,
                    runner_up : runnerUp,
                    balance : tournament.balance,
                    player_count : tournament.player_count,
                    tournament : tournament
                };
                cb(completed, data);
            } else {
                data = {
                    players: nextGen,
                    stage: tournament.stage + 1,
                    compilation: startingIndex,
                    tournament : tournament
                };
                cb(completed, data);
            }
        });
};
// to jump into next stage of tournament
exports.advanceStage = (tournamentId,matchDirPath, cb) => {
    checkCompilation(tournamentId, (completed, data) => {
        let tournament = data.tournament;
        if (completed == 3) {
            console.log('tournament winners decided');
            let prize = Math.floor((data.balance * data.player_count) * 9 / 10);
            let prize1 = Math.floor(prize * 0.6);
            let prize2 = Math.floor(prize * 0.4);
            adjustBalance(data.winner, prize1, 1, "Tournament Win", () => {
                adjustBalance(data.runner_up, prize2, 1, "Tournament Runner Up", () => {
                    Tournament.findByIdAndUpdate(tournamentId, {$set: {has_ended : true}})
                    .exec((err, tx) => {
                        if(err) console.log(err);
                        cb()
                    })
                })    
            });

        }
        else if (completed == 2) {
            console.log(`tournament advanced to stage ${data.stage}`);
            console.log(`advanced players : ${data.players.length}`);
            let pairs = [];
            for (let i = 0; i < data.players.length; i += 2) {
                let pair = {};
                pair.first = data.players[i];
                pair.second = data.players[i + 1];
                pairs.push(pair);
                console.log(pair);
            }
            let matchIds = [];
            async.eachSeries(pairs, (pair, callback) => {
                genMatch(pair.first, pair.second, tournament.balance, tournament.game, 'tournament', matchDirPath, tournamentId, (m) => {
                    matchIds.push(mongoose.Types.ObjectId(m._id));
                    callback();
                });
            }, (err) => {
                if (err)
                    console.log(err);
                else {
                    //console.log('tournament initiated');
                    Tournament.findByIdAndUpdate(tournamentId, { $push: { matches: { $each: matchIds } }, $set: { stage: data.stage, compilation: data.startingIndex } })
                        .exec((err, t) => {
                            if (err) console.log(err);
                            cb();
                        })
                }
            });
        } else {
            console.log('tournament match own');
            cb();
        }
    });
};

//get user info
exports.userInfoGetter = (user_id, cb) => {
    User.findById(user_id)
        .populate('games')
        .exec((err, user) => {
            if (err) console.log(err);
            cb(user);
        });
};
//if user exists
exports.existsUser = (id, res, cb) => {
    User.count({ _id: mongoose.Types.ObjectId(id) }, (err, num) => {
        if (err)
            res.json({
                errors: [{ msg: err }],
                status: 0
            });
        if (num > 0)
            cb();
        else {
            res.redirect('/dashboard/errorUser');
        }
    })
};

function frontShift(arr, numberOfElements) {
    let newArr = [];
    for(let i = numberOfElements; i < arr.length; i++)
        newArr.push(arr[i]);
    return newArr;
}
function frontSlice(arr, numberOfElements) {
    let newArr = [];
    for(let i = 0; i < numberOfElements; i++)
        newArr.push(arr[i]);
    return newArr;
}

exports.getTournamentTree = (tournamentId, cb) => {
    let TournamentSets = [];
    let rounds = [];
    console.log(tournamentId);
    Tournament.findById(tournamentId)
    .exec((err, tournament) => {
        if(err) console.log(err);
        //preparing match array;
        //console.log(tournament);
        async.eachSeries(tournament.matches, (match, callback) => {
            Match.findById(match)
            .populate('challenger challenged')
            .exec((err, m) => {
                if(err) console.log(err);
                let pair = {
                    player1 : {name :m.challenger? m.challenger.full_name : 'undefined', ID : m.challenger._id},
                    player2 : {name : m.challenged? m.challenged.full_name : 'undefined', ID : m.challenged._id}
                };
                if(m.state == 2)
                    pair.player1.winner = true;
                if(m.state == 3)
                    pair.player2.winner = true;
                console.log(pair);
                TournamentSets.push(pair);
                callback();
            });
        }, (err) => {
            if (err)
                console.log(err);
            else {
                //let returnArray = [];
                
                let tree = [];
                for(let i = 0; i < tournament.max_stage; i++) {
                    let level = [];
                    for(let j = 0; j < tournament.matches_per_round[i]; j++) {
                        let dataset = {
                            player1 : {name :'', ID : i * j},
                            player2 : {name :'', ID : i * j -1}
                        };
                        level.push(dataset);
                          
                    }
                    if(i <tournament.max_stage)
                            rounds.push(`Round-${i + 1}`); 
                    tree.push(level);
                }
                let champ = [
                    {
                        player1 : {name :'', ID : 4000000, winner : false}
                    }
                ];
                tree.push(champ);
                for(let i = 0; i < tournament.stage; i++) {
                    let temp = frontSlice(TournamentSets, tournament.matches_per_round[i]);
                    tree[i] = temp;
                    TournamentSets = frontShift(TournamentSets, tournament.matches_per_round[i]);
                    
                }
                if(tournament.stage == tournament.max_stage) {
                    if(tree[tournament.max_stage -1][0].player1.winner){
                        let champ = [
                            {
                                player1 : {name :tree[tournament.max_stage -1][0].player1.name, ID :tree[tournament.max_stage -1][0].player1.ID, winner : true}
                            }
                        ];
                        tree[tournament.max_stage] = champ;
                    }
                    if(tree[tournament.max_stage -1][0].player2.winner){
                        let champ = [
                            {
                                player1 : {name :tree[tournament.max_stage -1][0].player2.name, ID :tree[tournament.max_stage -1][0].player2.ID, winner : true}
                            }
                        ];
                        tree[tournament.max_stage] = champ;
                    }
                }
                rounds.push(`final`);
                let data = {
                    tree : tree,
                    rounds : rounds
                };
                cb(data);
            }
        });
    });
};

exports.isInTournament = (tournamentId, playerId, cb) =>{
    Tournament.findById(tournamentId)
    .exec((err, tournament) => {
        if(err) console.log(err);
        let player = playerId.toString();
        let playerArr = tournament.players.map( t => { return t.toString()});
        if(_.contains(playerArr,player))
            cb(true);
        else
            cb(false);
    });
}



