#!/usr/bin/env node
'use strict';

// importing Server class
const Server = require('./server');

// Our configuration
if(!process.argv[2]) console.log("Please enter a port number  ")
if(!process.argv[3]) console.log("Missing IP address")
if(!process.argv[4]) console.log("Missing studentID")
else{
    const PORT = process.argv[2] || 8000;
    const ADDRESS = "127.0.0.1"
    const myStudentID = process.argv[4] || 14318931;
    var server = new Server(PORT, ADDRESS, myStudentID);

    // Starting our server
    server.start(() => {
        console.log(`Server started at: ${ADDRESS}:${PORT}`);
    });
}
