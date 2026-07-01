// TODO: Implement `shopping(products, list)`.
//
// `products` is a list of [product, department] pairs (a catalog). `list` is an
// ordered shopping list of product names. Compute the DIFFERENCE in department
// visits between two strategies:
//
//   - Naive: pick up products in the given order. Each time the department
//     changes from the previous product, it counts as a new visit. Consecutive
//     products in the same department count as one visit.
//   - Optimal: reorder freely so each department is visited at most once. The
//     count equals the number of distinct departments needed.
//
// Return naiveVisits - optimalVisits.
//
//   With list ['Blueberries','Flour','Pasta','Milk','Iceberg Lettuce','Cheese']
//   naive = 5, optimal = 3  =>  2
//
// Run: npm test -- 06-shopping-list
export function shopping(products, list) {
    let currentDepartment = "";
    let productsMap = new Map(products);
    let naive = [];
    for (let product of list){
        let department = productsMap.get(product);
        if (currentDepartment !== department){
            naive.push(department);
        }
        currentDepartment = department;
    }
    let output = naive.length - [...new Set(naive)].length
    return output;
}
