'use strict';
const net = require('net');
const Client = require('./client'); // importing Client class

class Server {
  constructor (port, address) {
    this.port = port || 5000;
    this.address = address || '127.0.0.1';
    // Holds our currently connected clients
    this.clients = [];
  }
  /*
   * Starting the server
   * The callback argument is executed when the server finally inits
  */
  start (callback) {
    let server = this; // we'll use 'this' inside the callback below
    // our old onClientConnected
    server.connection = net.createServer((socket) => {
      let client = new Client(socket);
      var hasEnteredUsername = false;
      socket.write('Hi, enter a username pls\n');

      let clientName = `${socket.remoteAddress}:${socket.remotePort}`;
      console.log(`${client.name} connected.`);

      // TODO 1: Broadcast to everyone connected the new client connection

      // Storing client for later usage
      server.clients.push(client);

      // Triggered on message received by this client
      socket.on('data', (data) => {
          let m = data.toString().replace(/[\n\r]*$/, '');
          if(!hasEnteredUsername){
            client.name = m;
            console.log(`${socket.remoteAddress}:${socket.remotePort}` + " changed their name to " + client.name);
            hasEnteredUsername = true;
            for(var i = 0; i < this.clients.length; i++){
                if(!(this.clients[i].name === client.name))
                      this.clients[i].socket.write(`${client.name} connected.\n`);
                    }
          }
          else{
              console.log(`${client.name} said: ${m}`);
              for(var i = 0; i < server.clients.length; i++){
                  console.log(server.clients[i].name + ", " + client.name);
                  if(!(server.clients[i].name === client.name)){
                      server.clients[i].socket.write(`${client.name} said:${m}\n`);
                  }

                }

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

  // TODO
  broadcast(message, clientSender) {}
}
module.exports = Server;
