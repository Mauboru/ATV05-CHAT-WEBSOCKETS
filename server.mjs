import express from 'express';
import path from 'path';
import http from 'http';

import socketIO from 'socket.io';
const { Server } = socketIO;

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.use(express.static(path.join(process.cwd(), 'public')));

let connectedUsers = [];

io.on('connection', (socket) => {
    console.log("Conexão detectada...");

    socket.on('join-request', (username) => {
        socket.username = username;
        connectedUsers.push(username);
        console.log(connectedUsers);

        socket.emit('user-ok', connectedUsers);
        socket.broadcast.emit('list-update', {
            joined: username,
            list: connectedUsers
        });
    });

    socket.on('disconnect', () => {
        connectedUsers = connectedUsers.filter(u => u != socket.username);
        console.log(connectedUsers);

        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connectedUsers
        });
    });

    socket.on('send-msg', (txt) => {
        let obj = {
            username: socket.username,
            message: txt
        };

        socket.broadcast.emit('show-msg', obj);
    });
});