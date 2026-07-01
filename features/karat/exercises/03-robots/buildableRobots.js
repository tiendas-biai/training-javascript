// TODO: Implement `buildableRobots(parts, requiredStr)`.
//
// You have a list of available robot parts, each a string "Robot_part"
// (e.g. "Optimus_leg"). `requiredStr` is a comma-separated list of part names
// (e.g. "leg,wheel,screw"). Return the names of all robots for which every
// required part is available, in the order the robots first appear in `parts`.
//
//   buildableRobots(
//     ['Optimus_leg', 'Rosie_arm', 'Optimus_wheel', 'Optimus_screw', 'Rosie_claw'],
//     'leg,wheel,screw'
//   ) => ['Optimus']
//
// Run: npm test -- 03-robots

function getRobotsMap(robotsWithParts){
    let robotsMap = new Map();

    for (const robotWithPart of robotsWithParts) {
        const [robot, part] = robotWithPart.split("_")
        let robotParts = robotsMap.get(robot);

        if (robotParts) {
            robotsMap.set(robot, [...robotParts, part])
        } else {
            robotsMap.set(robot, [part]);
        }
    }
    return robotsMap;

}

export function buildableRobots(robotsWithParts, parts) {
    let robotsMap = getRobotsMap(robotsWithParts);
    let output = [];
    for (const [key, value] of robotsMap){
        let hasAllParts = true;
        for (const part of parts.split(",")){
            if (!value.includes(part)){
                hasAllParts = false
            }
        }
        if (hasAllParts){
            output.push(key)
        }
    }
    return output;
}