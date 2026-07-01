// TODO: Implement `grouping(events, count)`.
//
// You are given a chronological log of CONNECT / DISCONNECT events on a social
// network where connections are symmetrical (if A connects to B, B is connected
// to A). Each event is a triple:
//
//   ['CONNECT', 'Alice', 'Bob']      // connects Alice and Bob
//   ['DISCONNECT', 'Bob', 'Alice']   // disconnects them (order doesn't matter)
//
// After processing every event, split users by their number of connections.
// Return an object { less, more } where:
//   - less = users with FEWER than `count` connections
//   - more = users with `count` OR MORE connections
//
// Ordering within each group does not matter.
//
// Run: npm test -- 08-social-network
let connectValue = {
    CONNECT: 1,
    DISCONNECT:-1
}

function getEventsMapCount(events) {
    let eventsMap = new Map();

    for (let [connectedStatus, user1, user2] of events){
        let value = connectValue[connectedStatus];

        let user1Count = eventsMap.get(user1)
        if (user1Count){
            user1Count += value
        } else {
           user1Count = value;
        }
        eventsMap.set(user1, user1Count)

        let user2Count = eventsMap.get(user2)
        if (user2Count){
            user2Count+=value
        } else {
            user2Count = value
        }
        eventsMap.set(user2, user2Count)
    }
    // Your code here
   return eventsMap;
}



export function grouping(events, count) {
    let eventsMap = getEventsMapCount(events);
    let keys = [...eventsMap.keys()]
    let less = [];
    let more = [];
    for (let user of keys){
        let userCount = eventsMap.get(user);
        if (userCount < count){
            less.push(user);
        } else {
            more.push(user);
        }
    }
    return {
        less,
        more
    }
}
