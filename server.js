'use strict';
const net = require('net');
const Client = require('./client'); // importing Client class
const hash = require('js-hash-code');
class Server {
	constructor (port, address, studentID) {
		this.port = port || 5000;
		this.address = address || '127.0.0.1';
		this.studentID = studentID || 14318931;
		this.chatrooms = [];

		// Holds currently connected clients
		this.clients = [];
	}
	/*
	 * Starting the server
	 * The callback argument is executed when the server finally inits
	*/
	start (callback) {
		let server = this; // we'll use 'this' inside the callback below

		server.connection = net.createServer((socket) => {
			let client = new Client(socket);
			var firstMessageReceived = false;
			socket.write('Hi, welcome to my chat server\n');

			let clientName = `${socket.remoteAddress}:${socket.remotePort}`;
			console.log(`${client.name} connected.`);
			//used to determine what stage of the chat we are at
			//0 = join_chatroom, 1 = message
			var messageMode = 0;
			// Storing client for later usage
			server.clients.push(client);

			// Triggered on message received by this client
			socket.on('data', (data) => {
					let m = data.toString().replace(/[\n\r]*$/, '');
					if(m === "KILL SERVICE") process.exit(0);

					//HELO thing
					if(getMessageType(m) === "HELO"){
						client.socket.write(m+ "\nIP:"+client.address+"\nPORT:"+client.port+"\nStudentID:14318931\n")
					}
					//JOIN_CHATROOM thing
					else if(getMessageType(m) === "JOIN"){
						messageMode = 0;
					}
					else if (getMessageType(m) === "LEAVE"){
						socket.write("LEFT_CHATROOM: "+ client.chatroom+"\nJOIN_ID:"+client.joinID)
						client.chatroom = -1;
						messageMode = 1;
						client.joinID = "";

					}
					else if (getMessageType(m) === "DISCONNECT"){
						socket.write("Goodbye " + client.name + "\n")
						socket.destroy();
					}
					if(messageMode == 0){
						var chatroomRegex = /JOIN_CHATROOM: .*/
						var ipRegex = /CLIENT_IP: .*/
						var portRegex = /PORT: .*/
						var clientNameRegex = /CLIENT_NAME: .*/
						if(m.match(chatroomRegex)!= null){
							client.chatroom = m.match(chatroomRegex)[0].substring(15, m.length)
							console.log("it worked, chatroom name = " + client.chatroom)
						}
						if(m.match(clientNameRegex) != null){
							client.name = m.match(clientNameRegex)[0].substring(13, m.length)
							console.log(`${socket.remoteAddress}:${socket.remotePort}` + " changed their name to " + client.name);
							for(var i = 0; i < this.clients.length; i++){
								if(!(this.clients[i].name === client.name) && this.clients[i].chatroom === client.chatroom){
									this.clients[i].socket.write(`${client.name} joined the chatroom.\n`);
	                            }
							}
	                        //add chatroom to list of chatrooms, get chatroom ID and join ID
	                        var chatroomExists = false;
							var chatroomID;
	                        for(var  i = 0; i < this.chatrooms.length; i++){
	                            if(client.chatroom === this.chatrooms[i]){
	                                chatroomExists = true;
									chatroomID = i;
	                            }
	                        }
	                        if(!chatroomExists){
	                            this.chatrooms.push(client.chatroom);
								chatroomID = this.chatrooms.length-1;
	                            console.log("added chatroom " + this.chatrooms[this.chatrooms.length-1]);
	                            socket.write("You have created a chatroom that has never existed, NICE\n")
	                        }

							//join ID = hash of client name appended to unix time of join appended to chatroom ID
							var date = new Date();
							var time = date.getTime();
							var joinstring = client.name+time+chatroomID;
							client.joinID = hash(joinstring);

							socket.write("JOINED_CHATROOM:"+client.chatroom+"\nSERVER_IP:"+this.address+
										"\nPORT:"+this.port+"\nROOM_REF:"+chatroomID+"\nJOIN_ID:"+client.joinID);
							messageMode = 1;
						}
					}

					else {
						var messageRegex = /MESSAGE: .*/
						var chatroomID;
						for(var  i = 0; i < this.chatrooms.length; i++){
							if(client.chatroom === this.chatrooms[i]){
								chatroomID = i;
							}
						}
						if(m.match(messageRegex) != null){
							for(var i = 0; i < this.clients.length; i++){
								if(!(this.clients[i].name === client.name) && this.clients[i].chatroom === client.chatroom){
									this.clients[i].socket.write("CHAT: "+ chatroomID+"\nCLIENT_NAME: "+client.name+"\nMESSAGE: "+ m.substring(9, m.length)+"\n\n");
								}
							}
						}
						/*
						console.log(`${client.name} in ${client.chatroom} said: ${m}`);
						for(var i = 0; i < this.clients.length; i++){
							if(!(this.clients[i].name === client.name) && this.clients[i].chatroom === client.chatroom){
								this.clients[i].socket.write(`${client.name} said: ${m}\n`);
							}
						}*/
					}
				});

			// Triggered when this client disconnects
			socket.on('end', () => {
					// Removing the client from the list
					server.clients.splice(server.clients.indexOf(client), 1);
					console.log(`${client.name} disconnected.`);
					for(var i = 0; i < this.clients.length; i++){
							server.clients[i].socket.write(`${client.name} disconnected.\n`);
					}
			});
		});
		// starting the server
		this.connection.listen(this.port, this.address);
		// setuping the callback of the start function
		this.connection.on('listening', callback);
	}

}

function getMessageType(message){
		if (message.substring(0,4) === "HELO"){
			return "HELO";
		}
		else if(message.substring(0, 13) === "JOIN_CHATROOM"){
			return "JOIN";
		}
		else if(message.substring(0,14) === "LEAVE_CHATROOM"){
			return "LEAVE";
		}
		else if(message.substring(0, 10) === "DISCONNECT"){
			console.log("disconnect")
			return "DISCONNECT";
		}
		else return "normal";

}

module.exports = Server;
