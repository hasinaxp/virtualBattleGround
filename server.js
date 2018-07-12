//Librery Module variable
const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

//database configaration file
const config = require('./config/database');

//database connection
mongoose.connect(config.database);
let db = mongoose.connection;
//check connection
db.once('open', function () {
    console.log('connected to mongoDB');
})
//check for db err
db.on('error', function (err) {
    console.log(err);
})

//app port
const port = 3000;

//app Creation
const app = express();

//loading view engine
app.set('view engine', 'pug');

//public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));

//set up local
app.locals.dat = {
    basePath: __dirname
}

//set up middle-wares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cookieParser());

app.use(expressValidator());

//------------------------routes ------------------------------------------------

//setup home route
app.get('/', (req, res) => {
    res.render('home', {
        pageTitle: 'home'
    });
});

//dashboard route
let dashboardRoute = require('./routes/dashboard');
app.use('/dashboard', dashboardRoute);
//match route
let matchRoute = require('./routes/match');
app.use('/match', matchRoute);
//profile route
let profileRoute = require('./routes/profile');
app.use('/profile', profileRoute);
//Log route
let logRoute = require('./routes/log');
app.use('/log', logRoute);
//wallet route
let walletRoute = require('./routes/wallet');
app.use('/wallet', walletRoute);
//leaderboard route
let leaderboardRoute = require('./routes/leaderboard');
app.use('/leaderboard', leaderboardRoute);
//tournament route
let tournamentRoute = require('./routes/tournament');
app.use('/tournament', tournamentRoute);

//admin route
let adminRoute = require('./routes/admin');
app.use('/admin', adminRoute);


//------------------------api routes------------------------------------------------

let signRoute = require('./routes/api/sign');
app.use('/func/sign', signRoute);

let infoRoute = require('./routes/api/info');
app.use('/func/info', infoRoute);






//server-listen
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`listening on port : ${port}`);
});

//main io object
const io = require('socket.io')(server);

const Chat = require('./models/chat');

//shockets magic
io.on('connection', function (socket) {

    socket.emit('initChat', { hello: 'world' });
    socket.on('chatResponse', function (data) {
        let tempEvent = "msgcame" + data.chatId;
        Chat.findById(data.chatId, (err, chatList) => {
            if (err) console.log(err);
            if (chatList) {
                io.sockets.emit(tempEvent, {
                    chat: chatList
                });
            }
        });
    });
    socket.on('chatRequest', (data) => {
        if (data) {
            console.log(data);
            let logData = {
                name: data.sender,
                color: data.col,
                text: data.text,
            }
            Chat.findByIdAndUpdate(data.chatId, { $push: { log: logData } }, (err, done) => {
                if (err) console.log(err);
                if (done) {
                    let tempEvent = "msgcame" + data.chatId;
                    Chat.findById(data.chatId, (err, chatList) => {
                        if (err) console.log(err);
                        if (chatList) {
                            io.sockets.emit(tempEvent, {
                                chat: chatList
                            });
                        }
                    });
                }
            });
        }
    })
});

