//Librery Module variable
const express = require('express');
const expressValidator = require('express-validator');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

//database configaration file
// const config = require('./config/database');
const credentials = require('./config/credentials.json')[process.env.NODE_ENV || 'dev'];
//database connection
mongoose.connect(credentials.database);
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
const port = credentials.port;
//app host
const host = credentials.host;
//app Creation
const app = express();
//cross origin access
app.use(function (req, res, next) {

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', '*');
    res.setHeader('Access-Control-Allow-Credentials', true);

    next();
});
//loading view engine
app.set('view engine', 'pug');

//public folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'vbg-front/build')));
//set up local
app.locals.dat = {
    basePath: path.resolve(),
    baseUrl: `${host}:${port}`,
    stringArray: []
}

//set up middle-wares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressValidator());
//------------------------routes ------------------------------------------------

let signRoute = require('./routes/api/sign');
app.use('/api/sign', signRoute);

let infoRoute = require('./routes/api/info');
app.use('/api/info', infoRoute);

let dashboardAPIRoute = require('./routes/api/dashboard');
app.use('/api/dashboard', dashboardAPIRoute);

let tournamentAPIRoute = require('./routes/api/tournament');
app.use('/api/tournament', tournamentAPIRoute);

let profileAPIRoute = require('./routes/api/profile');
app.use('/api/profile', profileAPIRoute);

let matchAPIRoute = require('./routes/api/match');
app.use('/api/match', matchAPIRoute);

let logAPIRoute = require('./routes/api/log');
app.use('/api/log', logAPIRoute);

let walletAPIRoute = require('./routes/api/wallet');
app.use('/api/wallet', walletAPIRoute);

let leaderboardAPIRoute = require('./routes/api/leaderboard');
app.use('/api/leaderboard', leaderboardAPIRoute);


let adminAPIRoute = require('./routes/api/admin');
app.use('/api/admin', adminAPIRoute);

//---------------------client app------------------------------------
//setup home route
app.get('*', (req, res) => {
    res.sendFile(__dirname +'/vbg-front/build/index.html')
});



//server-listen
const server = app.listen(port, host, () => {
    console.log(`listening on port ${host}:${port}`);
});

//main io object
const io = require('socket.io')(server);

const Chat = require('./models/chat');

//shockets magic
io.on('connection', function (socket) {

    socket.emit('initChat', { hello: 'world' });
    socket.on('chatResponse', function (data) {
        let tempEvent = "msgcame" + data.chatId;
        Chat.findById(data.chatId)
            .populate('log.name')
            .exec((err, chatList) => {
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
                    Chat.findById(data.chatId)
                    .populate('log.name')
                     .exec((err, chatList) => {
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

