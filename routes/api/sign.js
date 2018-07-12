const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const FUNC = require('../../controls/functions');
const saltRounds = 10;

const router = express.Router();

const User = require('../../models/user');
const Balance = require('../../models/balance');

//making a new connectionString
function makeConnectionString() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 10; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}


//register
router.post('/register', (req, res) => {
    req.checkBody('full_name', 'Full Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').notEmpty();
    req.checkBody('email', 'This is not an email-address').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('confirm', 'paswords does not match').equals(req.body.password);
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ errors: errors });
    } else {
        User.find({ email: req.body.email }, (err, any) => {
            if (err) console.log(err);
            if (any.length) {
                res.json({ errors: [{ msg: 'email-id is already registered' }, { msg: 'try other email-id' }] });
            }
            else {
                let user = new User();
                user.full_name = req.body.full_name;
                user.email = req.body.email;
                user.password = req.body.password;
                user.connection_string = 'theBrightSun';
                let fld = FUNC.makeString('user');
                user.folder =fld;
                user.image = 'default.jpg';
                user.date = Date.now();
                let newPath = req.app.locals.dat.basePath + '/public/user/' + fld;
                console.log(newPath);
                if (!fs.existsSync(newPath)) {
                    fs.mkdirSync(newPath);
                }
                fs.createReadStream(req.app.locals.dat.basePath + '/public/img/default.jpg').pipe(fs.createWriteStream(newPath + '/default.jpg'));
                bcrypt.genSalt(saltRounds, function (err, salt) {
                    bcrypt.hash(user.password, salt, function (err, hash) {
                        user.password = hash;
                        user.save((err, ur) => {

                            if(err) console.log(err);
                            if(ur){
                                res.json({
                                    success: ' Registration successful.'
                                });
                            }
                        });
                    });
                });          
            }
        });
    }
});

//login
router.post('/login', (req, res, next) => {
    let emailAddress = req.body.email;
    let password = req.body.password;
    User.findOne({ email: emailAddress }, (err, user) => {
        if (err) throw err;
        if (user) {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) throw err;
                if (result) {
                    console.log('password matched!');
                    res.cookie('logautx', user.email);
                    res.cookie('logauti', user._id.toString());
                    res.cookie('logauty', user.connection_string);
                    User.findByIdAndUpdate(user._id, { $set: { date: Date.now() } }, (err, lg) => {
                        if (err) console.log(err);
                        res.redirect('/dashboard');
                    });
                }
                else {
                    console.log('wrong password!');
                    res.redirect('/');
                }
            });
        }
        else {
            console.log('wrong email address!');
            res.redirect('/');
        }
    });
});

//logout
router.get('/logout', (req, res) => {
    let conStr = FUNC.makeString('connection');
    User.update({ email: req.cookies.logautx }, {
        $set: {
            'connection_string': conStr
        }
    }, { new: true }, (err, data) => {
        console.log('logout successfull');
        res.clearCookie('logautx');
        res.clearCookie('logauty');
        res.redirect('/');
    });
});


module.exports = router;