const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../controls/authenticate');
const router = express.Router();
router.use(authenticate.kick);

const User = require('../models/user');



//---------routes------------------------------------------------------

router.get('/', (req, res) => { 
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;
    res.render('wallet', {
        pageTitle: 'wallet',
        proImg: profileImgPath,
        userName: req.data._user.full_name,
        balance: req.data._user.balance,
        withdrawable_bp: req.data._user.withdrawable_bp,
        user: req.data._user
    });
});



module.exports = router;