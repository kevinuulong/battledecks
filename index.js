const express = require('express'),
    app = express(),
    server = app.listen(process.env.PORT || 5000, '0.0.0.0', function () {
        console.log("connected to port 5000")
    }),
    io = require('socket.io')(server);

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/game.html');
});

var colors = [];

function randomColor() {
    if (colors.length == 0) {
        colors = ['orange', 'red', 'green', "blue"];
    }
    var index = Math.floor(Math.random() * colors.length);
    var color = colors[index];
    colors.splice(index, 1);
    return color;
}

//Stole this nifty shuffle algorithm from here (https://stackoverflow.com/a/2450976/9253840)
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

//https://stackoverflow.com/a/17891411/9253840
function randomNoRepeats(array) {
    var copy = array.slice(0);
    return function () {
        if (copy.length < 1) { copy = array.slice(0); }
        var index = Math.floor(Math.random() * copy.length);
        var item = copy[index];
        copy.splice(index, 1);
        return item;
    };
}

var users = [];

io.on('connection', socket => {

    var topic = randomNoRepeats(topics);

    //log the new socket connection and its corresponding socket id
    console.log('A user with the socket id ' + socket.id + ' connected')

    socket.on('newUser', data => {
        // var room = io.sockets.adapter.rooms[data.roomCode];
        console.log(socket.id + ' transfering to ' + data.roomCode);
        socket.join(data.roomCode);
        // console.log(room);
        io.to(data.roomCode).emit('addUser', {
            username: data.username
        });
        users.push(data.username);
    })

    socket.on('host', data => {
        socket.join(data.roomCode);
    })

    socket.on('startRound', data => {
        votes = [0, 0];
        currentChoices = [topic(), topic()];
        io.to(data.roomCode).emit('startVote', {
            choices: currentChoices,
            colors: [randomColor(), randomColor()]
        })
        time = 30;
        timer = setInterval(() => {
            console.log(time);
            if (time > 0) 
                time--;
            else clearInterval(timer);
        }, 1000)
    })

    socket.on('vote', data => {
        if (time > 0) {
            votes[data.choice]++;
            console.log(votes);

            io.to(data.roomCode).emit('newVote', {
                votes: votes
            })
        }
    })

    socket.on('timesUp', data => {
        randUsers = randomNoRepeats(users);
        console.log("howdy")
        io.to(data.roomCode).emit('roundDetails', {
            username: randUsers()
        })
    })

    socket.on('clearUsers', () => {
        randUsers = "";
        users = [];
    })


});

var topics = ["turtles", "alligators", "poems", "crabs", "desks", "office chairs", "butterflies", "doors", "windows", "mice", "cars", "cards", "carpets", "GIF's", "erasers", "tissues", "cats", "graphs", "walls", "bricks", "TV's", "phones", "laptops", "cake", "towels", "plates", "paintings", "cookies", "laptops", "horses", "windows", "coffee", "apples", "oranges", "brownies", "dancing", "songs", "pens", "pencils", "carwash", "pyramid", "statues", "sprinkles", "facebook", "instagram", "snapchat", "twitter", "google", "billion", "mac and cheese", "fancy cars", "lampshades"];

var randUsers;
var copyOfUsers;

var currentChoices = [];
var votes = [];
var time = 0;
var timer;

server.listen(process.env.PORT || 5000);