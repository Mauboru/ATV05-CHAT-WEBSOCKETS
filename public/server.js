import express from 'express';
import path from 'path';
import http from 'http';
import { Server } from 'socket.io'

const express = require('express');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

server.listen(3000);

app.use(express.static(path.join(__dirname, 'public')));

let connectedUsers = [];