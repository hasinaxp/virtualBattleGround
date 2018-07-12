const mongoose = require('mongoose');
const schema = mongoose.Schema;

let balanceSchema = new schema({
    
    user: { type: schema.Types.ObjectId, ref: 'user' },
    bp: {type: Number, default : 0},
    
});

let User = module.exports = mongoose.model('balance', balanceSchema);

/*
documentation----







*/