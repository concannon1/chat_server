#!/usr/bin/env node
'use strict';

// load the Node.js TCP library
const net = require('net');

const PORT = 5000;
const ADDRESS = '127.0.0.1';

function Chatroom(name){
	this.name = name;
}

let server = net.createServer(onClientConnected);
server.listen(PORT, ADDRESS);

function onClientConnected(socket) {

	console.log(`New client: ${socket.remoteAddress}:${socket.remotePort}`);



	let clientName = socket.remoteAddress+":"+socket.remotePort;
    socket.write("hi "+clientName+", please enter a username:\n");


	var hasEnteredUsername = false;

	// Triggered on data received by this client
	socket.on('data', (data) => {
		if(!hasEnteredUsername){
			clientName = data.toString().replace(/[\n\r]*$/, '');
			hasEnteredUsername = true;
			socket.write("Your username is: " + clientName);
		}
		else{
    		// getting the string message and also trimming
    		// new line characters [\r or \n]
    		let m = data.toString().replace(/[\n\r]*$/, '');

    		// Logging the message on the server
    		console.log(`${clientName} said: ${m}`);

    		// notifing the client
    		socket.write(`We got your message. Fuck you!\n`);
			if(m === "quit")
				socket.destroy();
		}
  	});


}

console.log(`Server started at: ${ADDRESS}:${PORT}`);
