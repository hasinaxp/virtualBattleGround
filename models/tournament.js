const mongoose = require('mongoose');
const schema = mongoose.Schema;

let tournament8Schema = new schema({
    state: {type: Number, default: 0},
    balance: {type : Number, default: 0},
    game: {type: schema.Types.ObjectId, ref: 'game'},
    player_1 : {type: schema.Types.ObjectId, ref: 'user'},
    player_2 : {type: schema.Types.ObjectId, ref: 'user'},
    player_3 : {type: schema.Types.ObjectId, ref: 'user'},
    player_4 : {type: schema.Types.ObjectId, ref: 'user'},
    player_5 : {type: schema.Types.ObjectId, ref: 'user'},
    player_6 : {type: schema.Types.ObjectId, ref: 'user'},
    player_7 : {type: schema.Types.ObjectId, ref: 'user'},
    player_8 : {type: schema.Types.ObjectId, ref: 'user'},
    compilation : {type: Number, default: 0},
    join_counter : {type: Number, default: 1},
    player_count : {type: Number, required: true},
    match_1: {type: schema.Types.ObjectId, ref: 'match'},
    match_2: {type: schema.Types.ObjectId, ref: 'match'},
    match_3: {type: schema.Types.ObjectId, ref: 'match'},
    match_4: {type: schema.Types.ObjectId, ref: 'match'},
    match_5: {type: schema.Types.ObjectId, ref: 'match'},
    match_6: {type: schema.Types.ObjectId, ref: 'match'},
    match_7: {type: schema.Types.ObjectId, ref: 'match'},
});

let Tournament8 = module.exports = mongoose.model('tournament8', tournament8Schema);
/*
stage->
    1 - first stage
    2 - second stage
    3 - 3rd stage
    4 - final

*/