const mongoose = require('mongoose');
const schema = mongoose.Schema;

let teamSchema = new schema({
    name: {type : String, required : true},
    image: {type: String, default: 'default.png'},
    members: [{ type: schema.Types.ObjectId, ref: 'user'}],
    leader: { type: schema.Types.ObjectId, ref: 'user'},
    game: {type: schema.Types.ObjectId, ref: 'game'},

});

let Team = module.exports = mongoose.model('team', teamSchema);