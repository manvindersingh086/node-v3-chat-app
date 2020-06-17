const express = require('express')
const http = require('http')
const path = require('path')
const socket= require('socket.io')
const Filter = require('bad-words')
const PORT = process.env.PORT || 3000
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const app = express()
const server = http.createServer(app)
const {addUser,removeUser,getUser,getUsersInRoom} = require('../src/utils/users')
const io = socket(server)
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))



io.on('connection', (socket) => {
    console.log('User Connected!')

    

    socket.on('join', ({username, room}, callback) => {
        socket.join(room.toLowerCase())
        const {error, user} = addUser({
            id : socket.id,
            username:username,
            room : room
        })
        if(error)
        {
           return callback(error)
        }
        socket.emit('message', generateMessage('Welcome!',user.username))
        socket.broadcast.to(room).emit('message',generateMessage(`${username} has joined`))
        
        io.to(room.toLowerCase()).emit('roomData', {
            room : user.room,
            users : getUsersInRoom(user.room)
        })

    })

    socket.on('sendMessage', (message,callback) => {
        const filter = new Filter()
        if(filter.isProfane(message))
        {
            return callback('Profanity is not allowed')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('message',generateMessage(message,user.username))
        callback()
    })

    socket.on('sendLocation', (position,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(`https://google.com/maps?q=${position.latitude},${position.longitude}`,user.username))
        callback()
    })
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user)
        {
            io.emit('message',generateMessage(`${user.username} has left!`,user.username))
            io.to(user.room).emit('roomData', {
                room : user.room,
                users : getUsersInRoom(user.room)
            })
        }
        
    })

    
})

server.listen(PORT, () => {
    console.log('Server is up on port number ' + PORT)
})