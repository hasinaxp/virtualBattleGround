const mongoose = require('mongoose');
const schema = mongoose.Schema;

let msgSchema = new schema({
    date: {type: Date, default: Date.now},
    title: {type: String, required: true},
    body: {type: String, required: true},
    image: {type: String, required : false},
    status: {type: Number, default: 0},
    user : [{ type: schema.Types.ObjectId, ref: 'user'}]
});

let Msg = module.exports = mongoose.model('msg', msgSchema);

/*
*status- 0: notification, 1: challange
*/