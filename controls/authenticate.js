const User = require('../models/user'); 

exports.kick = (req, res, next) => {
    const headers = req.headers;
    let lx = req.header('logautx')
    let ly = req.header('logauty')
     if(req.url.includes("public")) {
        return next();
     }
     User.count({ email: lx, connection_string: ly }, (err, c) => {
        if (c > 0) {
            User.findOne({ email: lx })
            .exec((err, user) => {
                if(err) console.log(err);
                if (user) {
                    req.data = { _user: user };
                    User.findOneAndUpdate({email: lx}, {$set: {date: Date.now()}})
                    .exec((err, ex) => {
                        if(err) console.log(err);
                        return next();
                    });
                }
                else {
                    res.json({ error : 'no such user found'});
                }
            });
        }
        else{
            res.json({ error : 'violated auhtentication'});
        } 
    }); 
};