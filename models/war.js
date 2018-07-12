const mongoose = require('mongoose');
const schema = mongoose.Schema;

let warSchema = new schema({
    challenger : {type: schema.Types.ObjectId, ref: 'team'},
    challenged : {type: schema.Types.ObjectId, ref: 'team'},
    date: {type: Date, default: Date.now},
    state: {type: Number, default: 0},//0: pending, 1: challanger win, 2: challanged win, 3: other
    balance: {type : Number, default: 0},
    game: {type: schema.Types.ObjectId, ref: 'game'}
});

let War = module.exports = mongoose.model('war', warSchema);