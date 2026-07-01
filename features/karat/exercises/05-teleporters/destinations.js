// TODO: Implement `destinations(teleporters, dieSides, startPos, lastSquare)`.
//
// A board has squares 0..lastSquare. `teleporters` is a list of "from,to"
// strings; landing exactly on `from` immediately moves you to `to` (only one
// teleport per turn). From `startPos`, a player rolls a die numbered 1..dieSides
// and moves forward that many squares, but never past `lastSquare` (overshooting
// stops on `lastSquare`). Return the set of distinct squares reachable in one
// turn (any order, no duplicates).
//
//   destinations(['3,1', '4,2', '5,10'], 6, 0, 20) => [1, 2, 10, 6]
//
// Run: npm test -- 05-teleporters
function teleporterToList(value) {
    let valueToArray = value.split(',')
    let [from, to] = valueToArray;
    return [+from,+to]
}

function teleportersToMap(teleporters) {
    let teleportersMap = new Map();
    for (let teleporter of teleporters){
        const [key,value] = teleporterToList(teleporter)
        teleportersMap.set(key,value);
    }
    return teleportersMap;
}

export function destinations(teleporters, dieSides, startPos, lastSquare) {
    let teleportersMap = teleportersToMap(teleporters);
    let posibleDestinations = [];
    for (let i = startPos+1; i<(dieSides+startPos+1); ++i){
        let destination = teleportersMap.get(i)??i;
        if (destination >= lastSquare){
            posibleDestinations.push(lastSquare)
        } else {
            posibleDestinations.push(destination)
        }
    }
    return Array.from(new Set(posibleDestinations));
}
