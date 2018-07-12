const User = require('../models/user'); 

exports.kick = (req, res, next) => {
    let lx = req.cookies.logautx;
    let ly = req.cookies.logauty;
    User.count({ email: lx, connection_string: ly }, (err, c) => {
        if (c > 0) {
            User.findOne({ email: lx }, (err, user) => {
                if (user) {
                    req.data = { _user: user };
                    User.findOneAndUpdate({email: lx}, {$set: {date: Date.now()}})
                    .exec((err, ex) => {
                        if(err) console.log(err);
                        return next();
                    });
                }
                else {
                    req.data = { error : 'no such user found'};
                }
            });
        }
        else{
            req.data = { error : 'violated auhtentication'};
            res.redirect('/');
        } 
    });
};