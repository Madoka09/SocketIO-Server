let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io')(server);
var cors = require('cors')

app.use(cors())

app.get('/', function (req, res, next) {
    res.json({msg: 'This is CORS-enabled for all origins!'})
})

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

var port = process.env.PORT || 3001;

server.listen(port, function () {
    console.log('listening in http://localhost:' + port);
});