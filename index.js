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
        console.log(item + " is the thing");
        return item;
    };
}

io.on('connection', function (socket) {
    //log the new socket connection and its corresponding socket id
    console.log('A user with the socket id ' + socket.id + ' connected')
});

server.listen(process.env.PORT || 5000);