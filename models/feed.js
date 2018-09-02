const mongoose = require("mongoose");
const schema = mongoose.Schema;


let feeedschema = new schema({
    title : {type : String, required : true},
    content : {type : String, required : true},
    image : {type : String, required : true},
    date : {type : Date, default : Date.now }
});

let Feed = module.exports = mongoose.model('feed',feeedschema);
