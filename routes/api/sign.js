const express = require('express');
const fs = require('fs');
const bcrypt = require('bcrypt');
const emailExistence = require('email-existence');
const FUNC = require('../../controls/functions');
const saltRounds = 10;

const router = express.Router();

const User = require('../../models/user');


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
    req.checkBody('full_name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').notEmpty();
    req.checkBody('email', 'This is not a valid email').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('confirm', 'Passwords does not match').equals(req.body.password);
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ errors: errors });
    } else {
        // emailExistence.check(req.body.email, function (err, t) {
            // if (t == false) {
            //     let error = [{
            //         location: 'body',
            //         msg: 'This email does not exist',
            //         param: 'email'
            //     }]
            //     res.json({ errors: error });
           // } else {
                User.find({ email: req.body.email.trim().toLowerCase() }, (err, any) => {
                    if (err) {
                        res.json({ errors: [{ msg: 'Internal error occured.please try again', param: 'email' }] });
                    }
                    if (any.length) {
                        res.json({ errors: [{ msg: 'This email is already registered', param: 'email' }] });
                    }
                    else {
                        let user = new User();
                        user.user_type = 'normal';
                        user.full_name = FUNC.protectedString(req.body.full_name);
                        user.email = FUNC.protectedString(req.body.email).trim().toLowerCase();
                        user.password = FUNC.protectedString(req.body.password);
                        user.connection_string = 'theBrightSun';
                        let fld = FUNC.makeString('user');
                        user.folder = fld;
                        user.image = 'default.jpg';
                        user.date = Date.now();
                        let newPath = req.app.locals.dat.basePath + '/public/user/' + fld;
                        if (!fs.existsSync(newPath)) {
                            fs.mkdirSync(newPath);
                        }
                        fs.createReadStream(req.app.locals.dat.basePath + '/public/img/default.jpg').pipe(fs.createWriteStream(newPath + '/default.jpg'));
                        bcrypt.genSalt(saltRounds, function (err, salt) {
                            bcrypt.hash(user.password, salt, function (err, hash) {
                                user.password = hash;
                                user.save((err, ur) => {
                                    if (err) console.log(err);
                                    if (ur) {
                                        res.json({
                                            success: ' Registration successful.'
                                        });
                                    }
                                });
                            });
                        });
                    }
                });
           // }
        //});
    }
});

//login
router.post('/login', (req, res, next) => {
    req.checkBody('email', 'Email is required!').notEmpty();
    req.checkBody('email', 'This is not an email-address').isEmail();
    req.checkBody('password', 'Password is required').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.json({ errors: errors });
    } else {
        let emailAddress = FUNC.protectedString(req.body.email);
        let password = FUNC.protectedString(req.body.password);
        User.findOne({ email: emailAddress }, (err, user) => {
            if (err) throw err;
            if (user) {
                bcrypt.compare(password, user.password, (err, result) => {
                    if (err) throw err;
                    if (result) {
                        //console.log('password matched!');
                        res.cookie('logautx', user.email);
                        res.cookie('logauti', user._id.toString());
                        res.cookie('logauty', user.connection_string);
                        User.findByIdAndUpdate(user._id, { $set: { date: Date.now() } }, (err, lg) => {
                            if (err) console.log(err);
                            res.json({
                                success: ' Sign In successful.',
                                id : user._id.toString(),
                                connection_string : user.connection_string,
                                email :  user.email,
                        });
                        });
                    }
                    else {
                        res.json({errors :[{param: 'password', msg: 'wrong password!'}]});
                    }
                });
            }
            else {
                res.json({errors :[{param: 'email', msg: 'email is not registered!'}]});
            }
        });
    }
});
//google login

router.post('/login/google', (req, res) => {
    console.log(req.body);
    res.json({
        success: 1,
        data: req.body
    })
});


//logout
router.get('/logout', (req, res) => {
    let conStr = FUNC.makeString('connection');
    User.update({ email: req.cookies.logautx }, {
        $set: {
            'connection_string': conStr
        }
    }, { new: true }, (err, data) => {
        //console.log('logout successfull');
        res.clearCookie('logautx');
        res.clearCookie('logauty');
        res.redirect('/');
    });
});


module.exports = router;