module.exports.User = class {
    username;
    socketId;

    constructor(username, socketId, isAviable = true) {
        this.username = username;
        this.socketId = socketId; 
        this.isAviable = isAviable;
    }
}