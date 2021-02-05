var socket = io('https://battledecks.herokuapp.com', { 'forceNew': true }),
    hostscreen = false;

socket.on('hi', data => {
    // Do something
    console.log("Hi")
})

var users = [];

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


const urlParams = new URLSearchParams(window.location.search);

// Stole this from here: http://mcgivery.com/htmlelement-pseudostyle-settingmodifying-before-and-after-in-javascript/
var UID = {
    _current: 0,
    getNew: function () {
        this._current++;
        return this._current;
    }
};

HTMLElement.prototype.pseudoStyle = function (element, prop, value) {
    var _this = this;
    var _sheetId = "pseudoStyles";
    var _head = document.head || document.getElementsByTagName('head')[0];
    var _sheet = document.getElementById(_sheetId) || document.createElement('style');
    _sheet.id = _sheetId;
    var className = "pseudoStyle" + UID.getNew();

    _this.className += " " + className;

    _sheet.innerHTML += " ." + className + ":" + element + "{" + prop + ":" + value + "}";
    _head.appendChild(_sheet);
    return this;
};

var time = 0;
var timer;

window.onload = () => {

    var host = urlParams.get('host') || false;
    var id = urlParams.get('id');

    if (host) {
        socket.emit('host', {
            roomCode: id
        })

        document.querySelector("#loginScreen").style.display = "none"
        document.querySelector("#contestantsScreen").style.display = "flex";
    } else {
        document.querySelector("#loginScreen").style.display = "flex";
        document.querySelector("#banner").style.display = "none";
    }

    document.querySelector("#submitButton").addEventListener('click', () => {
        socket.emit('newUser', {
            roomCode: document.querySelector("#roomCode").value,
            username: document.querySelector("#userName").value
        })

        document.querySelector("#loginScreen").style.display = "none";
    })

    socket.on('addUser', data => {
        // Do something
        users.push(data.username);
        document.querySelector("#contestantsContainer").innerHTML +=
            `<p class="chip ${randomColor()}">${data.username}</p>`
    })

    document.querySelector("#startButton").addEventListener('click', () => {
        if (host) {
            socket.emit('startRound', {
                roomCode: id
            })
        }
    })

    socket.on('startVote', data => {
        // clearListCookies();
        time = 30;
        timer = setInterval(() => {
            console.log(time);
            if (time > 0) {
                time--;
                document.querySelector("#timeButton").innerHTML = time+'s';
            }
            else clearInterval(timer);
        }, 1000)
        document.querySelector("#voteScreen #left > .voteButtonLabel").innerHTML = data.choices[0];
        document.querySelector("#voteScreen #right > .voteButtonLabel").innerHTML = data.choices[1];
        document.querySelector("#topicScreen #left > .voteButtonLabel").innerHTML = data.choices[0];
        document.querySelector("#topicScreen #right > .voteButtonLabel").innerHTML = data.choices[1];
        if (host) {
            document.querySelector("#contestantsScreen").style.display = "none";
            document.querySelector("#topicScreen").style.display = "flex";
        } else {
            document.querySelector("#voteScreen").style.display = "flex";
        }
    })

    document.querySelector("#voteScreen #left").addEventListener('click', () => {
        if (!document.cookie.includes("voted=true")) {
            socket.emit('vote', {
                choice: 0,
                roomCode: document.querySelector("#roomCode").value
            })
            // document.cookie += "voted=true";
            document.querySelector("#voteScreen").style.display = "none";
        }
    })

    document.querySelector("#voteScreen #right").addEventListener('click', () => {
        if (!document.cookie.includes("voted=true")) {
            total = [];
            socket.emit('vote', {
                choice: 1,
                roomCode: document.querySelector("#roomCode").value
            })
            // document.cookie += "voted=true";
            document.querySelector("#voteScreen").style.display = "none";
        }
    })

    socket.on('newVote', data => {
        if (host) {
            total = data.votes[0] + data.votes[1];
            var percents = [(data.votes[0] / total) * 100 + "%", (data.votes[1] / total) * 100 + "%"];
            console.log(percents);
            document.querySelector("#topicScreen #topicsContainer #left").pseudoStyle('after', 'width', percents[0]);
            document.querySelector("#topicScreen #topicsContainer #right").pseudoStyle('after', 'width', percents[1]);
        }
    })

    document.querySelector("#timeButton").addEventListener('click', () => {
        document.querySelector("#topicScreen").style.display = "none";
        document.querySelector("#roundScreen").style.display = "flex";
        socket.emit('timesUp', {
            roomCode: id,
        })
        console.log("Hi")
    })

    socket.on('roundDetails', data => {
        console.log("hello")
        document.querySelector("#contestantName").innerHTML = data.username;
        // document.querySelector("#roundTopic").innerHTML = ;
        var topic;
        if (total[0]>total[1]) {
            topic = document.querySelector("#left > .voteButtonLabel").innerHTML;
        } else {
            topic = document.querySelector("#right > .voteButtonLabel").innerHTML;
        }

        document.querySelector("#roundTopic").innerHTML = topic;
        document.querySelector("#slidesCount").innerHTML = Math.floor(Math.random() * 5) + 10;
    })

    document.querySelector("#roundDetials #startButton").addEventListener('click', ()=> {
        document.querySelector("#roundDetails").style.display = "none";
        document.querySelector("#contestantsScreen").style.display = "flex"
    })
}

var total = [];