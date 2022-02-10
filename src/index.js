// to use public folder as static files
const path = require('path');
// use http module for socket
const http = require('http');
// use express server
const express = require('express');
const socketio = require('socket.io')
const formatMessage = require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

// create express server instance. take that server instance and use it in expresses 
// http module to enable use in socket. use createserver function from http 
// to pass in the express server called app into it. use sockets socketio function to 
// then pass in server 
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static path
app.use(express.static(path.join(__dirname, 'public')));

const botName = "ChatCordBot";

io.on('connection', socket => {
    socket.on('joinRoom', ({username, room}) => {
        // create a variable for a chat user
        // userJoin is a function that creates a id, username & room for a user. Then
        // pushes it into the empty users array and returns user.
        const user = userJoin(socket.id, username, room);
        // join user to whatever room they pick based on qs query string params
        socket.join(user.room);

        socket.emit('message', formatMessage(botName, "Welcome To Food Chat"));

        // emmit to specific room that a new user has joined
        socket.broadcast
        .to(user.room)
        .emit('message', formatMessage(botName, `${user.username} has joined the chat!`));

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });


    });

    console.log('new websocket connection');

    // listen for chat message
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
    //users message shows up on screen 
      io
      .to(user.room)
      .emit('message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', 
                formatMessage(botName, `${user.username} has left the chat!`)
            );

            io.to(user.room).emit('roomUsers', 
            {
                room: user.room, 
                users: getRoomUsers(user.room)
            }
            );
        };
        
    });

});

const PORT = 2423;

server.listen(PORT, () => console.log(`Listening on port ${PORT}`));