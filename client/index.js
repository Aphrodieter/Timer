import {io} from "socket.io-client";

const socket = io.connect('http://192.168.178.40:3000/');
const timer = document.getElementById('Timer');
const container = document.getElementById('outer');

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

socket.on('connect', () => {
    console.log(`You connected with id: ${socket.id}`);
    container.style.setProperty('transition',`background-color ${data.transitionTime}s`);
    
});


//on Load

//fetch information from server
// socket.on('sendData', (data_) =>{
//     data = data_;
// });


// //show current content
// if (data.showText){
//     showText();
// }else
// {
//     showTimer();    
// }

//fit screen size 
resize_to_fit();






// get width of data.text snippet in px
function getWidthOfText(txt, fontname, fontsize){
    if(getWidthOfText.c === undefined){
        getWidthOfText.c=document.createElement('canvas');
        getWidthOfText.ctx=getWidthOfText.c.getContext('2d');
    }
    var fontspec = fontsize + ' ' + fontname;
    if(getWidthOfText.ctx.font !== fontspec)
        getWidthOfText.ctx.font = fontspec;
    return getWidthOfText.ctx.measureText(txt).width;
}


// get rendered property from browser page
function css( element, property ) {
    return window.getComputedStyle( element, null ).getPropertyValue( property );
}

function splitText(){
    var list = data.text.split(' ');
    var newLine = parseInt(list.length / 2);
    list[newLine] = list[newLine] + "<br />";
    data.text = list.join(' ');

}

socket.on('showText', (text_) =>{
    data.text = text_;
    data.showText = true;
    
    showText();
});

socket.on('hideText',() =>{
    //display timer
    timer.innerHTML=`${data.hs}:${data.mins}:${data.secs}`;

    //reset size
    timer.style.setProperty('font-size', "50vw");
    resize_to_fit();
    data.showText = false;
});

socket.on('backgroundSet', (color) =>{
    data.background_color = color;
    container.style.setProperty('background-color', color);
});

socket.on('panikSet', (color)=>{
    data.panik_color = color;
});

//panik button pressed
socket.on('panikMode', ()=>{

    if(!data.panikMode){
        socket.emit('panikActivated', data.panik_color);
        panikModeActivate();
    }
    else{
        socket.emit('panikActivated', data.background_color);
        data.panikMode = false;
        container.style.setProperty('background-color', data.background_color);
        clearInterval(data.panikInterval);
    }
});


socket.on('timeSet', (hs_, mins_, secs_)=>{
    [data.hs, data.mins, data.secs] = [hs_, mins_, secs_];
    console.log('timeSet');
    //reset timer
    clearInterval(data.panikInterval);
    data.panikMode = false;
    container.style.setProperty('background-color', data.background_color);
    //fillup
    data.hs = fillup(data.hs);
    data.mins = fillup(data.mins);
    data.secs = fillup(data.secs);

    if (!data.showText){
        showTimer();
    }
})


//get current time information from server
socket.on('currentTime', (newSeconds) =>{
    data.hs = parseInt(newSeconds/3600);
    data.mins = parseInt((newSeconds%3600) / 60);
    data.secs = newSeconds%60;



    // 60 sekunden übrig --> panikmode activated
    if(timeRunningOut() && !data.panikMode){
        socket.emit('panikActivated', data.panik_color);
        panikModeActivate();
    }
    //timer abgelaufen
    if(timeOut()){
        clearInterval(data.panikInterval);
        container.style.setProperty('background-color', data.panik_color);
    }
    //fillup
    data.hs = fillup(data.hs);
    data.mins = fillup(data.mins);
    data.secs = fillup(data.secs);

    //aktualisiere zeit 
    if(!data.showText){
    timer.innerHTML=`${data.hs}:${data.mins}:${data.secs}`;
    }
});



//resize font size to fit text into window
function resize_to_fit(){ 
    var fontsize = timer.style.getPropertyValue('font-size');
    var newfontsize = (parseFloat(fontsize) - 1);

    timer.style.setProperty('font-size', newfontsize + 'vw');
    if ((timer.clientWidth >= container.clientWidth && newfontsize >= 15)){
        resize_to_fit();
    } else
    if (timer.clientHeight >= container.clientHeight){
        resize_to_fit();
    }
    
    
}

//Precede a number with a 0 if it is a single digit
function fillup(time){
    return time.toString().length == 1 ? `0${time}` : time;
}


function timeRunningOut(){
    return data.hs*3600 + data.mins*60 + data.secs <= data.panikModetime;
}


function timeOut(){
    return data.hs + data.mins + data.secs == 0;
}

//make screen flash with panik color
function panikModeActivate(){
    data.panikMode = true;

    changeColor();
    data.panikInterval = setInterval(function(){
        changeColor();
    }, data.transitionTime*1000);
}

//change screen color to background or panik color depending on the current color
function changeColor(){
    console.log('changeColor');
    container.style.setProperty('background-color', data.transitioncolor);
    data.transitioncolor = 
    data.transitioncolor == data.panik_color
    ? data.background_color
    : data.panik_color;
}


//show text in timer container
function showText() {
    timer.innerHTML = data.text;
    timer.style.setProperty('font-size', "50vw");
    resize_to_fit();
}

//show timer in timer container
function showTimer() {
    timer.innerHTML=`${data.hs}:${data.mins}:${data.secs}`;
    timer.style.setProperty('font-size', "50vw");
    resize_to_fit();
}



