let app = require('express');

const PORT = process.env.PORT || 3000;
const INDEX = '/index.html';

const server = app()
    .use((req, res) => res.sendFile(INDEX, {root: __dirname}))
    .listen(PORT, () => console.log(`En puerto ${PORT}`))

let io = require('socket.io')(server);

io.on('connection', (socket) => {

    socket.on('disconnect', function () {
        io.emit('users-changed', { user: socket.username, event: 'left' });
    });

    socket.on('set-name', (name) => {
        socket.username = name;
        io.emit('users-changed', { user: name, event: 'joined' });
    });

    socket.on('send-message', (message) => {
        io.emit('message', { msg: message.text, user: socket.username, createdAt: new Date() });
    });
});
