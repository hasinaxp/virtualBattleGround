const mongoose = require('mongoose');
const schema = mongoose.Schema;

let tProtoSchema = new schema({
    is_final : {type: Boolean, default: false},
   is_completed : {type: Boolean, default: false},
   winner: {type:schema.Types.ObjectId, ref: 'user'},
   match: {type:schema.Types.ObjectId, ref: 'user'},
   left: {type:schema.Types.ObjectId, ref: 'tproto'},
   right: {type:schema.Types.ObjectId, ref: 'tproto'},
});

let Tournament = module.exports = mongoose.model('tproto', tProtoSchema);