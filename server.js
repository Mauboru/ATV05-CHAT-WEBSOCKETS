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

let connectedUsers = {};

io.on('connection', (socket) => {
    console.log("Conexão detectada...");

    socket.on('join-request', (data) => {
        const { username, room } = data;

        socket.username = username;
        socket.room = room;

        socket.join(room);

        if (!connectedUsers[room]) {
            connectedUsers[room] = [];
        }
        connectedUsers[room].push(username);

        socket.emit('user-ok', connectedUsers[room]);
        socket.broadcast.to(room).emit('list-update', {
            joined: username,
            list: connectedUsers[room]
        });
    });

    socket.on('send-msg', (data) => {
        const { room, message } = data;
        let obj = {
            username: socket.username,
            message: message
        };

        socket.broadcast.to(room).emit('show-msg', obj);
    });

    socket.on('disconnect', () => {
        const room = socket.room;
        if (connectedUsers[room]) {
            connectedUsers[room] = connectedUsers[room].filter(u => u !== socket.username);
            socket.broadcast.to(room).emit('list-update', {
                left: socket.username,
                list: connectedUsers[room]
            });
        }
        console.log(connectedUsers);
    });
});
