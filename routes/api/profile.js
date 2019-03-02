const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const jimp = require('jimp');
const bcrypt = require('bcrypt')
const authenticate = require('../../controls/authenticate');
const router = express.Router();
router.use(authenticate.kick);
const saltRounds = 10;

const User = require('../../models/user');
const FUNC = require('../../controls/functions');

//--------multer storage defination----------------------------------
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/user/' + req.data._user.folder);
    },
    filename: (req, file, cb) => {
        let dat = { exten: path.extname(file.originalname) }
        req.data.ext = dat;
        let nameFile = req.data._user.full_name + dat.exten;
        console.log(nameFile);
        cb(null, nameFile);
    }
});
const imageUpload = multer({
    storage: imageStorage
}).single('image');

//---------routes------------------------------------------------------
//get profile of the user
router.post('/', (req, res) => {
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;
    let levelInfo = FUNC.calculateLevel(req.data._user.leader_point);
    let achieveMentInfo = FUNC.calculateAchievements(req.data._user.total_bp_win, req.data._user.leader_point, req.data._user.total_win);
    FUNC.matchData(req.data._user._id, (matchData) => {
        console.log(matchData)
        res.json( {
            status: 'ok',
            proImg: profileImgPath,
            user: req.data._user,
            level: levelInfo,
            achievements: achieveMentInfo.achieved,
            match: matchData
        });
    });
});

//get profile of other user
router.post('/:id', (req, res) => {
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;
    FUNC.existsUser(req.params.id, res, () => {
        FUNC.userInfoGetter(req.params.id, (user) => {
            let levelInfo = FUNC.calculateLevel(user.leader_point);
            let achieveMentInfo = FUNC.calculateAchievements(user.total_bp_win, user.leader_point, user.total_win);
            FUNC.matchData(req.params.id, (matchData) => {
                res.json( {
                    status: 'ok',
                    user: user,
                    level: levelInfo,
                    achievements: achieveMentInfo.achieved,
                    match: matchData
                });
                });
        });
    });
});


//------------------------------------error routes----------------------------------


//------------------------------------profile enents---------------------------------
//change profile image
router.post('/update/image', imageUpload, (req, res) => {
    const img = req.data._user.full_name + req.data.ext.exten;
    console.log(img);
    User.findByIdAndUpdate(req.data._user._id, { $set: { image: img } }, (err, dat) => {
        if (err) console.log(err);
        let image = `${req.app.locals.dat.basePath}/public/user/${req.data._user.folder}/${img}`
        jimp.read(image, function (err, lenna) {
            if (err) throw err;
            lenna
                .resize(400, jimp.AUTO)
                .quality(80)                 // set JPEG quality
                .write(image); // save
        });
        console.log('profile image changed successfully!')
        res.json({
            status: 'ok',
            msg: 'Image updated successfully'
        });
    });
});
//change name
router.post('/update/name/', (req, res) => {
    req.checkBody('name', 'name is required!').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.json({
            status: 'fail',
            errors
        })
    }
    else {
        User.findByIdAndUpdate(req.data._user._id, { $set: { full_name: FUNC.protectedString(req.body.name) } })
            .exec((err, dat) => {
                if (err) console.log(err);
                else {
                    console.log('name updated  successfully!')
                    res.json({
                        status: 'ok',
                        msg: 'Name updated successfully'
                    });
                }
            });
    }
});


//change password
router.post('/update/password', (req, res) => {
    req.checkBody('password', 'password is required!').notEmpty();
    req.checkBody('new_password', 'new password is required!').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.json({
            status: 'fail',
            errors
        })
    }
    else {
    User.findById(req.data._user._id, (err, user) => {
        if (err) console.log(err);
        if (user) {
            //comparing the hashed password
            bcrypt.compare(req.body.password, req.data._user.password, (err, result) => {
                if (err) console.log(err);
                if (result) {
                    console.log('password matched!');
                    let newPassword = req.body.new_password;
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        bcrypt.hash(newPassword, salt, function (err, hash) {
                            if (err) console.log(err);
                            User.findByIdAndUpdate(req.data._user._id, { $set: { password: hash } })
                                .exec((err, lg) => {
                                    if (err) console.log(err);
                                    if (lg) {
                                        res.json({
                                            success: `password updateded successfully`,
                                            status: 'ok'
                                        })
                                    };

                                });

                        });
                    });
                }
                else {
                    console.log('wrong password!');
                    res.json({
                        status: 'fail',
                        errors: [{param : 'password', msg: 'wrong old password!'}]
                 });
                }
            });
        }

    })
}
});

//change phone number
router.post('/update/phone/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, { $set: { phone: req.body.phone } })
        .exec((err, dat) => {
            if (err) console.log(err);
            else {
                console.log('phone number updated successfully!');
                //TODO: validate phone number, update 
                res.redirect('/profile');
            }
        });
});
//change address
router.post('/update/address/:id', (req, res) => {
    User.findByIdAndUpdate(req.params.id, { $set: { address: FUNC.protectedString(req.body.address) } })
        .exec((err, dat) => {
            if (err) console.log(err);
            else {
                console.log('address updated successfully!');
                //TODO: validate phone number
                res.redirect('/profile');
            }
        });
});


module.exports = router;