const mongoose = require('mongoose');
const schema = mongoose.Schema;


let liveSchema = new schema({
    user_id : {type :schema.Types.ObjectId, ref: 'user'},
    login_time : {type : Date, default : Date.now},
});

let Live = module.exports = mongoose.model('live', liveSchema);