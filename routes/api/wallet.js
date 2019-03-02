const express = require('express');
const mongoose = require('mongoose');
const authenticate = require('../../controls/authenticate');
const router = express.Router();
router.use(authenticate.kick);

const User = require('../../models/user');



//---------routes------------------------------------------------------

router.post('/', (req, res) => {
    let transactionLog = [];
    req.data._user.balance_log.forEach( t => {
        let dataSet = {};
        dataSet._id = t._id
        dataSet.text = t.text;
        dataSet.mode = t.mode;
        dataSet.bp = t.bp;
        dataSet.date = `${t.date.getDate()}/${t.date.getMonth() + 1}/${t.date.getFullYear()}`;
        transactionLog.push(dataSet);
    });
    transactionLog.reverse();
    let profileImgPath = `/user/${req.data._user.folder}/${req.data._user.image}`;
    res.json( {
        balance: req.data._user.balance,
        withdrawable_bp: req.data._user.withdrawable_bp,
        user: req.data._user,
        transaction_log : transactionLog,
        status : 'ok'
    });
});



module.exports = router;