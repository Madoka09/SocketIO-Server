let app = require('express');
const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';
const server = app()
    .use((req, res) => res.sendFile(INDEX, {root: __dirname}))
    .listen(PORT, () => console.log(`En puerto ${PORT}`))

const { userJoin, getCurrentUser, userLeave, getRoomUsers, getAllRooms, roomLeave, getDestinationUser } = require ('./utils/users');
let io = require('socket.io')(server);



io.on('connection', (socket) => {

    console.log('new ws connection');

    // when client from table connects
    socket.once('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // send connect event
        io.to(user.room).emit('users-changed', { user: user.username, event: 'joined' });

        //send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })

        socket.broadcast.emit('broadcast', user.room)
        //console.log(user.room);
    })


    // when client disconnects
    socket.on('disconnect', function () {
        const user = userLeave(socket.id);

        if(user){
            // send disconnect event
            io.to(user.room).emit('users-changed', { user: user.username, event: 'left' });
            console.log(`desconectado de ${getAllRooms()}`)
            socket.broadcast.emit('broadcast', user.room)

            //send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            })
            roomLeave(user.room);
        }


    });   
    
    // when sending message
    socket.on('send-message', (message) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', { msg: message.text, user: user.username, createdAt: new Date(), room: message.room });
        socket.broadcast.emit('save-local', { msg: message.text, user: user.username, createdAt: new Date(), room: message.room });
        console.log(`sending message to ${user.room}`)
        console.log(`mensaje del restaurante ${message.restaurant}`)
    });

    // message to waiter chat index

    // send message from waiter
    socket.on('waiter-message', (message) => {
        const user = getCurrentUser(socket.id);

        io.to(message.id).emit('message', { msg: message.text, user: user.username, createdAt: new Date(), room: message.room, })
        io.to(user.room).emit('self-message', { msg: message.text, user: user.username, createdAt: new Date(), room: message.room });
        //console.log(`cuarto del mesero ${message.room}`)
        //console.log(`Dejando cuarto ${user.room}`)
        console.log(`intentaras escribirle al usuario con el id ${message.id}, io soy ${user.username}`)
    })

    socket.on('getRooms', function() {
       io.emit('getRooms', getAllRooms())
       //console.log(getAllRooms())
    })

    // typing alert for tables
    socket.on('typingTable', (data) =>{
        const user = getCurrentUser(socket.id);

        if(data.typing === true){
            io.to(user.room).emit('typingTable', {typing: data.typing, user: user.username});
        } else {
            io.to(user.room).emit('typingTable', {typing: data.typing, user: user.username});
        }

        //console.log(`Escribiendo ${data.typing}, usuario que escribe ${user.username}`)
    })

    // typing alert for waiters
    socket.on('typingWaiter', (data) =>{
        const user = getCurrentUser(socket.id);

        if(data.typing === true){
            io.to(data.destination).emit('typingWaiter', {typing: data.typing, user: user.username});
        } else {
            io.to(data.destination).emit('typingWaiter', {typing: data.typing, user: user.username});
        }

        //console.log(`Escribiendo ${data.typing}, usuario que escribe ${user.username}`)
    })

});
