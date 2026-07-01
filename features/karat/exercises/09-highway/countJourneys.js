
// TODO: Implement `countJourneys(logEntries)`.
//
// `logEntries` is a chronological list of toll-booth records. Each entry is an
// object { license_plate, booth_type } where booth_type is "ENTRY" or "EXIT".
// Count the number of COMPLETED journeys. A journey completes when a car that
// currently has an open ENTRY records an EXIT.
//
// Rules:
//   - An EXIT with no open ENTRY for that plate is ignored.
//   - A second ENTRY before an EXIT does not start a second journey; the car is
//     simply still considered "inside".
//
//   countJourneys([
//     { license_plate: 'A', booth_type: 'ENTRY' },
//     { license_plate: 'A', booth_type: 'EXIT' },
//   ]) => 1
//
// Run: npm test -- 09-highway

function logEntriesToMap(logEntries){
    let logEntriesMap = new Map();
    for (let log of logEntries){
        const {license_plate, booth_type} = log;
        let licensePlateMapValues = logEntriesMap.get(license_plate)??[];
        licensePlateMapValues = [...licensePlateMapValues, booth_type]
        logEntriesMap.set(license_plate, licensePlateMapValues)
    }
    return logEntriesMap;
}

export function countJourneys(logEntries) {
  // Your code here
    let logEntriesMap = logEntriesToMap(logEntries);
    let licensePlates = [...logEntriesMap.keys()];
    let count = 0;
    for (let licensePlate of licensePlates){
        let currentBoothType = "";
        let plateValues = logEntriesMap.get(licensePlate);
        for (let value of plateValues){
            if ((currentBoothType === "ENTRY")&&(value==="EXIT")){
                count++
            }
            currentBoothType = value;
        }
    }
    return count;
}
