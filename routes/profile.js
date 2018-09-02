const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const jimp = require('jimp');
const authenticate = require('../controls/authenticate');
const router = express.Router();
router.use(authenticate.kick);

const User = require('../models/user');
const FUNC = require('../controls/functions');

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

router.get('/', (req, res) => {
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;
    res.render('profile', {
        pageTitle: 'profile',
        proImg: profileImgPath,
        userName: req.data._user.full_name,
        balence: req.data._user.balance,
        user: req.data._user
    });
});
router.get('/:id', (req, res) => {
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;
    FUNC.existsUser(req.params.id, res, () => {
        FUNC.userInfoGetter(req.params.id, (user) => {
            res.render('profileOther', {
                pageTitle: 'profile',
                proImg: profileImgPath,
                userName: req.data._user.full_name,
                balence: req.data._user.balance,
                user: user,
                userImage: `/user/${user.folder}/${user.image}`
            });
        });
    });
});


//------------------------------------error routes----------------------------------


//------------------------------------profile enents---------------------------------
//change profile image
router.post('/update/image/:id', imageUpload, (req, res) => {
    const img = req.data._user.full_name + req.data.ext.exten;
    console.log(img);
    User.findByIdAndUpdate(req.params.id, { $set: { image: img } }, (err, dat) => {
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
        res.redirect('/profile');
    });
});
//change name
router.post('/update/name/:id', (req, res) => {
    req.checkBody('name', 'name is not defined').notEmpty();
    let errors = req.validationErrors();
    if (errors) {
        res.redirect('dashboard/error');
    }
    else {
        User.findByIdAndUpdate(req.params.id, { $set: { full_name: req.body.name } })
            .exec((err, dat) => {
                if (err) console.log(err);
                else {
                    console.log('name updated  successfully!')
                    res.redirect('/profile');
                }
            });
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
    User.findByIdAndUpdate(req.params.id, { $set: { address: req.body.address } })
        .exec((err, dat) => {
            if (err) console.log(err);
            else {
                console.log('address updated successfully!');
                //TODO: validate phone number
                res.redirect('/profile');
            }
        });
});

//change password
router.post('/update/password/:id', (req, res) => {
    User.findById(req.params.id, (err, user) => {
        if (err) console.log(err);
        if (user) {
            //comparing the hashed password
            bcrypt.compare(req.body.password, req.data._user.password, (err, result) => {
                if (err) console.log(err);
                if (result) {
                    console.log('password matched!');
                    let newPassword = req.body.password_new;
                    bcrypt.genSalt(saltRounds, function (err, salt) {
                        bcrypt.hash(newPassword, salt, function (err, hash) {
                            if (err) console.log(err);
                            User.findByIdAndUpdate(req.data._user._id, { $set: { password: hash } })
                                .exec((err, lg) => {
                                    if (err) console.log(err);
                                    if (lg) {
                                        res.json({
                                            success: `password updateded successfully`,
                                            status: 1
                                        })
                                    };

                                });

                        });
                    });
                }
                else {
                    console.log('wrong password!');
                    res.json({ errorCode: 1, status: 0 });
                }
            });
        }

    })
});


module.exports = router;