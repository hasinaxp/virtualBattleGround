var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var crypto = require('crypto');

const mongoose = require('mongoose');
const authenticate = require('../controls/authenticate');
const router = express.Router();
router.use(authenticate.kick);


app.get('/', function (req, res) {
	var ord = JSON.stringify(Math.random() * 1000);
	var i = ord.indexOf('.');
	ord = 'ORD' + ord.substr(0, i);
	res.render(__dirname + '/checkout.html', { orderid: ord });

});

app.post('/response.html', (req, res) => {
	var key = req.body.key;
	var salt = req.body.salt;
	var txnid = req.body.txnid;
	var amount = req.body.amount;
	var productinfo = req.body.productinfo;
	var firstname = req.body.firstname;
	var email = req.body.email;
	var udf5 = req.body.udf5;
	var mihpayid = req.body.mihpayid;
	var status = req.body.status;
	var resphash = req.body.hash;

	var keyString = key + '|' + txnid + '|' + amount + '|' + productinfo + '|' + firstname + '|' + email + '|||||' + udf5 + '|||||';
	var keyArray = keyString.split('|');
	var reverseKeyArray = keyArray.reverse();
	var reverseKeyString = salt + '|' + status + '|' + reverseKeyArray.join('|');

	var cryp = crypto.createHash('sha512');
	cryp.update(reverseKeyString);
	var calchash = cryp.digest('hex');

	var msg = 'Payment failed for Hash not verified...';
	if (calchash == resphash)
		msg = 'Transaction Successful and Hash Verified...';

	res.render(__dirname + '/response.html', {
		key: key, salt: salt, txnid: txnid, amount: amount, productinfo: productinfo,
		firstname: firstname, email: email, mihpayid: mihpayid, status: status, resphash: resphash, msg: msg
	});
});


app.post('/', function (req, res) {
	var strdat = '';

	req.on('data', function (chunk) {
		strdat += chunk;
	});

	req.on('end', function () {
		var data = JSON.parse(strdat);
		var cryp = crypto.createHash('sha512');
		var text = data.key + '|' + data.txnid + '|' + data.amount + '|' + data.pinfo + '|' + data.fname + '|' + data.email + '|||||' + data.udf5 + '||||||' + data.salt;
		cryp.update(text);
		var hash = cryp.digest('hex');
		res.setHeader("Content-Type", "text/json");
		res.setHeader("Access-Control-Allow-Origin", "*");
		res.end(JSON.stringify(hash));
	});


});

router.post('/response', function (req, res) {

	var key = req.body.key;
	var salt = req.body.salt;
	var txnid = req.body.txnid;
	var amount = req.body.amount;
	var productinfo = req.body.productinfo;
	var firstname = req.body.firstname;
	var email = req.body.email;
	var udf5 = req.body.udf5;
	var mihpayid = req.body.mihpayid;
	var status = req.body.status;
	var resphash = req.body.hash;

	if (key && salt && txnid && amount && productinfo && firstname && email && udf5 && mihpayid && status && reshphash) {

		var keyString = key + '|' + txnid + '|' + amount + '|' + productinfo + '|' + firstname + '|' + email + '|||||' + udf5 + '|||||';
		var keyArray = keyString.split('|');
		var reverseKeyArray = keyArray.reverse();
		var reverseKeyString = salt + '|' + status + '|' + reverseKeyArray.join('|');

		var cryp = crypto.createHash('sha512');
		cryp.update(reverseKeyString);
		var calchash = cryp.digest('hex');

		var msg = 'Payment failed for Hash not verified...';
		if (calchash == resphash) {
			msg = 'Transaction Successful and Hash Verified...';
		}
		res.status(200).send({
				key: key, salt: salt, txnid: txnid, amount: amount, productinfo: productinfo,
				firstname: firstname, email: email, mihpayid: mihpayid, status: status, resphash: resphash, msg: msg
		});
	} else {
		res.status(500).send({ msg: 'Insufficient Informtion for payment' })
	}
});

exports.router = router;