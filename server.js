const path = require("path");
const express = require("express");
const http = require("http");
const socketio = require('socket.io')
const formatMessage = require('./utils/messages');
const { userJoin , getCurrentUser, userLeave } = require('./utils/users');


const app = express()
const server = http.createServer(app)
const io = socketio(server);

const botName = 'ChatChordBot';

io.on('connection', socket => {

    socket.on('joinRoom' , ({username, room}) => { 
        const user = userJoin( socket.id, username , room);
        socket.join(user.room)


        console.log("New WS connection established");
        socket.emit("message", formatMessage(botName, "Welcome to chatCord Room"));
    
    
        socket.broadcast.to(user.room).emit("message", formatMessage(botName,` ${user.username} has joined the chat`));
    });

    socket.on('chatMessage' , msg => {
        const user = getCurrentUser(socket.id)
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    })

    socket.on("disconnect", () => {
        const user = userLeave(socket.io);

        if(user){
            io.to(user.room).emit("message", formatMessage(botName,`${user.username} has left the chat`));
        }; 
    })

})
app.use(express.static(path.join(__dirname, "public")))
const PORT = 4000 || process.env.PORT;
server.listen(PORT, console.log(`Server running on port ${PORT}`))
