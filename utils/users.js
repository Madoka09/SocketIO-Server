const e = require("express");

const users = [];
const rooms = [];
// Join user to chat
function userJoin(id, username, room) {
    const user = { id, username, room};

    if(rooms.indexOf(room) === -1 ){
        rooms.push(room);
    }

    users.push(user);

    return user;
}

// Get current User
function getCurrentUser(id){
    return users.find(user => user.id === id);
}

// Get destination User
function getDestinationUser(id){
    return users.find(user => user.id === id);
}

// Get room users
function getRoomUsers(room){
    return users.filter(user => user.room === room);
}

// Get all rooms
function getAllRooms(){
    return rooms;
}

// Room leave
function roomLeave(room){
    const index = rooms.indexOf(room)

    if(index !== -1 ){
        return rooms.splice(index, 1)[0];
    }
}

// User leaves
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1 ){
        return users.splice(index, 1)[0];
    }
}

module.exports = {
    userJoin,
    getCurrentUser,
    getRoomUsers,
    userLeave,
    getAllRooms,
    roomLeave,
    getDestinationUser
};