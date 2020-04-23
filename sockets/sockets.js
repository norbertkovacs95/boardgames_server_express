var socketioJwt = require('socketio-jwt');
var config = require('../config');
var getUsername = require('../authentication/authenticate').getUsername;
var socketio = require('socket.io'),
    io = {};

var User = require('./modules/user').User,
    Invite = require('./modules/invite').Invite,
    Party = require('./modules/party').Party;

var users = [],
    invites = [],
    parties = [];

module.exports.startSocketServer = function(server) { 
   
    io = socketio(server)   
        .on('connection', socketioJwt.authorize({
            secret: config.secretKey,
            timeout: 15000 // 15 seconds to send the authentication message
        }))
        .on('authenticated', (socket) => {
            
            getUsername(socket.decoded_token._id)
                .then((username) => {

                    socket.username = username;
                    users.push(new User(username, socket.id));
                    console.log('User authenticated: ' , socket.username,'\n');

                    socket.on('disconnect',() => {
                        removeUser(socket.username);
                        socket.disconnect();
                        
                        //Destroy all invites and parties the users is in
                        console.log('User disconnected: ' + socket.username,'\n');
                    })

                    socket.on('aviable players', () => {
                        let onlineUsers = getAviableUser(socket.username);

                        socket.emit('aviable players', onlineUsers);
                    });
                    
                    socket.on('invite', (username) => {
                        let user1 = getUser(socket.username);
                        let user2 = getUser(username);
                        let inviteId = `i.${user1.socketId}.${user2.socketId}`;

                        setUserAviability(user1,false);
                        setUserAviability(user2,false);
                        invites.push(new Invite(user1, user2, inviteId));
                        console.log('Pending invites: ',invites,'\n');
                            
                        io.to(user2.socketId).emit('invitation', {username: user1.username, inviteId: inviteId});
                    });
                    
                    socket.on('accept invite', (invideId) => {
                        let user1 = getInvite(invideId).user1;
                        let user2 = getInvite(invideId).user2;
                        let partyId = `p.${user1.socketId}.${user2.socketId}`;

                        parties.push(new Party(user1,user2,partyId));
                        removeInvite(invideId);
                        console.log('New party crated: ', parties, '\n')    

                        io.to(user1.socketId).emit('invite accepted', partyId);
                        io.to(user2.socketId).emit('invite accepted', partyId);
                    });

                    socket.on('decline invite', (invideId) => {
                        let user1 = getInvite(invideId).user1;
                        let user2 = getInvite(invideId).user2;

                        setUserAviability(user1,true);
                        setUserAviability(user2,true);
                        removeInvite(invideId);
                        
                        io.to(user1.socketId).emit('invite declined', user2.username);
                    });

                    socket.on('leave party', partyId => {
                        let user1 = getParty(partyId).user1;
                        let user2 = getParty(partyId).user2;

                        setUserAviability(user1,true);
                        setUserAviability(user2,true);
                        removeParty(partyId);
                        console.log('Party ended, ',parties, '\n')

                        io.to(user1.socketId).emit('party left');
                        io.to(user2.socketId).emit('party left');
                    })
                })
                .catch((err) => console.log(err));
            })
        

}

function getUser(username) {
    return users.filter((user) => user.username === username)[0];
}

function setUserAviability(user, aviability) {
    users[users.indexOf(user)].isAviable = aviability;
}

function removeUser(username) {
    users = users.filter((user) => user.username !== username);
}

function getAviableUser(username) {
    return users
        .filter((user) => user.username !== username && user.isAviable)
        .map((user) => user.username);
}

function getInvite(inviteId) {
    return invites.filter((invite) => invite.inviteId === inviteId)[0];
}

function removeInvite(inviteId) {
    invites = invites.filter((invite) => invite.inviteId !== inviteId);
}

function getParty(partyId) {
    return parties.filter((party) => party.partyId === partyId)[0];
}

function removeParty(partyId) {
    parties = parties.filter((party) => party.partyId !== partyId);
}