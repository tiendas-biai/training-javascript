// TODO: Implement `mismatches(records)`.
//
// `records` is an ordered list of [employee, action] entries where action is
// "enter" or "exit". The room starts empty and everyone is required to leave
// before the log ends. Return two collections (as a two-element array):
//
//   1. Employees who entered without a matching exit (entered but never left,
//      or re-entered while already inside).
//   2. Employees who exited without a matching enter (exited while not inside).
//
// Each collection contains no duplicates. Ordering within each collection does
// not matter.
//
//   mismatches([['Paul','enter'],['Paul','enter'],['Paul','exit'],['Paul','exit']])
//     => [['Paul'], ['Paul']]
//
// Run: npm test -- 07-security-system
function getRecordsMap(records){
    let recordsMap = new Map();
    for (let [employee, action] of records){
        let employeeActions = recordsMap.get(employee) ?? []
        recordsMap.set(employee, [...employeeActions, action])
    }
    return recordsMap;
}


export function mismatches(records) {

    let recordsMap = getRecordsMap(records);
    let enter = []
    let exit = []
    let employees = Array.from(recordsMap.keys())
    for (let employee of employees){
        let values = recordsMap.get(employee);
        let currentValue = ""
        for (let value of values){
            if (currentValue !== ""){
                if (currentValue === "enter" && value === "enter"){
                    enter.push(employee)
                }
                if (currentValue === "exit" && value === "exit"){
                    exit.push(employee)
                }
            }
            currentValue = value;
        }
        if (values.at(-1) === "enter"){
            enter.push(employee);
        }
    }

    return [[...new Set(enter)], [...new Set(exit)]];
}
