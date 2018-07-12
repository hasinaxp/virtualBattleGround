const mongoose = require('mongoose');
const schema = mongoose.Schema;

let gameSchema = new schema({
    name : {type : String, required : true, unique : true },
    platform : {type: Number, required : true},//0: mobile, 1: pc
    image : { type: String, required : true },
    requirement : {type :String, required : true},
    player_count : {type: Number, required : true}, // for singal player and multi player

});

let Game = module.exports = mongoose.model('game',gameSchema);