const mongoose = require('mongoose');
const schema = mongoose.Schema;

let matchSchema = new schema({
    challenged: { type: schema.Types.ObjectId, ref: 'user' },
    challenger: { type: schema.Types.ObjectId, ref: 'user' },
    date: { type: Date, default: Date.now },
    state: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    game: { type: schema.Types.ObjectId, ref: 'game' },
    challenger_evidance: { type: String, required: false },
    challenged_evidance: { type: String, required: false },
    challenger_evidance_state: { type: Boolean, default: false },
    challenged_evidance_state: { type: Boolean, default: false },
    admin_request:  { type: Boolean, default: false },
    challenger_msg: { type: String, default: '' },
    challenged_msg: { type: String, default: '' },
    is_tournament: { type: Boolean, default: false },
    tournament: { type: schema.Types.ObjectId, ref: 'tournament' },
    chatroom: { type: schema.Types.ObjectId, ref: 'chat' }
});

let Match = module.exports = mongoose.model('match', matchSchema);

/*
state code :
0 - request sent
1 - request accepted
2 - challenger won
3 - challanged won
4 - challenge disput

color code :
0 - challenger
1 - challenged
2 - system

*/