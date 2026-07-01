// TODO: Implement `carpool(roads, starts, people)`.
//
// Friends are carpooling to a campground. `roads` is a directed list of
// [origin, destination, durationMinutes] (durations are strings). Routes are
// linear: each location leads to exactly one next location, with no loops.
//
// `starts` is a list of the cars' starting locations. All cars leave at the same
// time (t = 0) and drive toward the campground. `people` is a list of
// [name, location] pairs. The FIRST car to reach a person's location picks them
// up; on a tie, either car may take them.
//
// Return a collection of who ends up in each car — an array parallel to `starts`,
// where entry i is the list of names in the car that started at starts[i].
//
// Run: npm test -- 11-campground

function getRoadsMap(roads, people){
    let roadsMap = new Map();
    let peopleObj = {}
    for (const [person, town] of people){
        peopleObj[town] = person;
    }
    for (let road of roads){
        let [town, to, time] = road;
        let values = {
            to,
            time: +time,
            person: peopleObj[town]
        }
        roadsMap.set(town, values)
    }
    return roadsMap
}

function getPeoplePickedMap(roadsMap, startTown) {
    let destiny = "Campground";
    let currentTown = startTown;
    let personMap = new Map();
    let timeTo = 0;
    while (destiny !== currentTown){
        let {to, time, person} = roadsMap.get(currentTown);
        if (person){
            personMap.set(person,timeTo)
        }
        currentTown = to;
        timeTo +=time
    }
    return personMap;
}

export function carpool(roads, starts, people) {
    let roadsMap = getRoadsMap(roads, people);
    let [start1, start2] = starts;
    let personMap1 = getPeoplePickedMap(roadsMap, start1);
    let personMap2= getPeoplePickedMap(roadsMap, start2);
    for (const [key, value] of personMap1.entries()){
        let value2 = personMap2.get(key);
        if (value2>=0){
            if (value2>value){
                personMap2.delete(key);
            } else {
                personMap1.delete(key)
            }
        }
    }
    return[[...personMap1.keys()],[...personMap2.keys()]]
}
