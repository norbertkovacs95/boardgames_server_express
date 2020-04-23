module.exports.Invite = class {
    user1;
    user2;
    inviteId;

    constructor(user1, user2, inviteId) {
        this.user1 = user1;
        this.user2 = user2;
        this.inviteId = inviteId; 
    }
}