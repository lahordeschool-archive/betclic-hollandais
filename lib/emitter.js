const EventEmitter = require('events');
const emitter = new EventEmitter();

const eventTypes = {
    // Add your event types here

    // User events
    USER_CREATED: "userCreated",
    USER_JOINED_TEAM: "userJoinedTeam",
    USER_LEFT_TEAM: "userLeftTeam",
    USER_COMPLETED_ACTIVITY: "userCompletedActivity",
    USER_COLLECTED_BADGE: "userCollectedBadge",

    // Ship events
    SHIP_CREATED: "shipCreated",

    // Activities events
    ACTIVITY_CREATED: "activityCreated",
    ACTIVITY_COMPLETED: "activityCompleted",

    // Global events
    NEW_HOUR: "newHour",
    MORNING_MESSAGE: "morningMessage",
    LUNCH_MESSAGE: "lunchMessage",
    EVENING_MESSAGE: "eveningMessage",

    // Dolibarr events
    SYNCHRO_DOLIBARR_PROPOSALS: "synchroDolibarrProposals",
};

// Export the emitter object
module.exports = { emitter, eventTypes };
