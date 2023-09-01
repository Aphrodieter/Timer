const express = require('express');
const app = express();
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors')
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*'
    }
});

var data = {
    hs: 0,
    mins: 0,
    secs: 0,
    intervalID: 0,
    transitionTime: 1,
    panik_color: 'red',
    background_color: 'black',
    transitioncolor: 'red',
    panikInterval: null,
    panikModetime: 60,
    panikMode: false,
    showText: false,
    text: '',

}


// var [data.hs, data.mins, data.secs] = [0, 0, 0];
// var data.intervalID = null;

server.listen(3000);

io.on('connection', socket => {
    console.log(`User connected: ${socket.id}`);

    // socket.emit('sendData', data);

    socket.on('timeSet', (time) => {
        setTime(time);
        socket.broadcast.emit('timeSet', data.hs, data.mins, data.secs);
        
        clearInterval(data.intervalID);
        startCountdown();
    });

    socket.on('requestData', () =>{
        socket.emit('sendData');
    });

    socket.on('backgroundSet', (color) =>{
        console.log(color);
        data.background_color = color;
        socket.broadcast.emit('backgroundSet', color);
    });

    socket.on('panikSet', (color) =>{
        data.panik_color = color;
        socket.broadcast.emit('panikSet', color);
    });

    socket.on('showText', (text) =>{
        data.text = text;
        data.showText = true;
        socket.broadcast.emit('showText', text);
    });

    socket.on('hideText',() =>{
        data.showText = false;
        socket.broadcast.emit('hideText');
    });

    socket.on('panikMode',() =>{
        console.log('Server Panik');
        data.panikMode = true;
        socket.broadcast.emit('panikMode');
    });

    socket.on('panikActivated', (color) =>{
        socket.broadcast.emit('panikActivated', color);
    });


    
    
});

function setTime(time){
    
    data.hs = parseInt(time.slice(0,2));
    data.mins = parseInt(time.slice(3,5));
    data.secs = parseInt(time.slice(6,8));

    data.totalSeconds = data.secs + data.mins * 60 + data.hs * 3600;
}

function startCountdown(){
        var start = Date.now();
        
        data.intervalID = setInterval(function(){
            var delta = Date.now() - start;
            var secondsSinceStart = Math.floor(delta/1000);
            var newSeconds = data.totalSeconds - secondsSinceStart;
            //console.log(`${data.hs}:${data.mins}:${data.secs}`)
            io.emit('currentTime', newSeconds);
            if(timerFinished(newSeconds)){
                clearInterval(data.intervalID)
            }
            
            

        
    }, 100);
}

function timerFinished(newSeconds){
    return newSeconds == 0;
}

function substractStepwise(start){
    var delta = Date.now() - start;
    var secondsSinceStart = Math.floor(delta/1000);
    var [new_hs, new_mins, new_secs] = [data.hs, data.mins, data.secs];

    if(data.secs > 0){
        new_secs = data.secs - secondsSinceStart;
    }
    else if(data.mins > 0){
        data.mins--;
        data.secs=59;
    }
    else{
        data.hs--;
        data.mins=59;
        data.secs=59;
    }
    
}


