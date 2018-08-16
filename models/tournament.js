const mongoose = require('mongoose');
const schema = mongoose.Schema;

let tournamentSchema = new schema({
    max_stage: {type: Number, default: 0},
    balance: {type : Number, default: 0},
    game: {type: schema.Types.ObjectId, ref: 'game'},
    players : [{type: schema.Types.ObjectId, ref: 'user'}],
    compilation : {type: Number, default: 0},
    join_counter : {type: Number, default: 1},
    player_count : {type: Number, required: true},
    stage : {type: Number, default : 0},
    matches: [{type: schema.Types.ObjectId, ref: 'match'}],
    date : {type: Date, default: Date.now},
    matches_per_round : [{type: Number, default: 1}]
});

let Tournament = module.exports = mongoose.model('tournament', tournamentSchema);
/*
stage->
    1 - first stage
    2 - second stage
    3 - 3rd stage
    4 - final
*/