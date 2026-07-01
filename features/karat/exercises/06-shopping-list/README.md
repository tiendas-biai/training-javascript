# Exercise 06: Shopping List

## Question

You are given a catalog of `products` (a list of `[product, department]` pairs)
and an ordered shopping `list` of product names. Compute the **difference in the
number of department visits** between two shopping strategies.

**Naive approach** — pick up products in the given order. Each time the
department changes from the previous product, it counts as a new visit.
Consecutive products in the same department count as a single visit.

**Optimal approach** — reorder pickups freely so each department is visited at
most once. The number of visits equals the number of distinct departments
required.

Write a function `shopping(products, list)` that returns
`naiveVisits - optimalVisits`.

### Example

```js
const list = ['Blueberries', 'Flour', 'Pasta', 'Milk', 'Iceberg Lettuce', 'Cheese']
// Naive:   Produce, Pantry, Pantry, Dairy, Produce, Dairy  => 5 visits
// Optimal: Produce, Pantry, Dairy                          => 3 visits
shopping(products, list) // => 2
```
