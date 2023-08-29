import {io} from "socket.io-client";

const socket = io('http://localhost:3000');

socket.on('connect', () => {
    console.log(`You connected with id: ${socket.id}`);
});



const setTimeButton = document.getElementById('setTime')
const timeField = document.getElementById('timeField')
const background = document.getElementById('background')
const panik = document.getElementById('panik');
const setBackground = document.getElementById('setBackground');
const setPanik = document.getElementById('setPanik');
const PanikMode = document.getElementById('panikMode');
const textBox = document.getElementById('textBox');
const textButton = document.getElementById('textButton');


// Execute a function when the user presses a key on the keyboard
textBox.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "\n") {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the setTimeButton element with a click
      textButton.click();
        }
    
  });

setTimeButton.addEventListener("click", () =>{
    console.log(timeField.value);
    socket.emit('timeSet', timeField.value);
} );

textButton.addEventListener("click", () =>{
    


    if (textButton.innerText == 'Show Text' && textBox.value != ''){
        console.log('showText');
        textButton.innerText = 'Hide Text';
        socket.emit('showText', textBox.value);
    } else
    if (textButton.innerText == 'Hide Text'){
        textButton.innerText = 'Show Text';
        socket.emit('hideText');
    }
}
 );

setBackground.addEventListener('click', () =>{
    socket.emit('backgroundSet', background.value);
});

setPanik.addEventListener('click', () =>{
    socket.emit('panikSet', panik.value);
});

PanikMode.addEventListener('click', () =>{
    socket.emit('panikMode');
});

socket.on('panikActivated', (color) =>{
        PanikMode.style.setProperty('background-color', color);
});