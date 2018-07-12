const mongoose = require('mongoose');
const schema = mongoose.Schema;

let adminSchema = new schema({
    username: {type : String, required : true},
    password: {type : String, required : true},
    connection_String: {type: String, default: 'ilovesex'},
    level: { type: Number, default: 0},
    address: {type: String},
    phone: {type: String, required: true},
    email: {type: String, required: true}
});

let Admin = module.exports = mongoose.model('admin', adminSchema);