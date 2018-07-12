const mongoose = require('mongoose');
const schema = mongoose.Schema;

let userSchema = new schema({
    full_name: { type: String, required: true },
    image: { type: String, default: "default.png" },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    connection_string: { type: String, default: 'ieatpoison' },
    phone: { type: String, required: false },
    valid_email: { type: Boolean, default: false },
    valid_Phone: { type: Boolean, default: false },
    address: {type: String, default: ''},
    balance: { type: Number, default: 100 },
    withdrawable_bp : {type: Number, default : 0},
    balance_log : [{
        date: {type: Date, default: Date.now},
        mode : { type: Number, required: true},
        bp : {type : Number, required: true},
    }],
    leader_point: { type: Number, default: 0 },
    total_win: { type: Number, default: 0 },
    total_bp_win : {type : Number, default: 0},
    date: { type: Date, default: Date.now },
    folder: { type: String, required: true },
    games: [{
        _id: { type: schema.Types.ObjectId, ref: 'game' },
        contact_string: { type: String, required: true },
    }]
});

let User = module.exports = mongoose.model('user', userSchema);

/*
documentation----







*/