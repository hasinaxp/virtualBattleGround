const mongoose = require('mongoose');

const schema = mongoose.Schema;


let chatSchema = new schema( {
    log: [{
        name : {type : String, required: true},
        color: {type : Number, default : 0},
        text : {type : String, required: true},
        date : {type: Date, default: Date.now}
    }]
});


let Match = module.exports = mongoose.model('chat', chatSchema);