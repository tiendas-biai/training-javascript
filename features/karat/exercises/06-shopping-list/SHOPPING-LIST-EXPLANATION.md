# Exercise 06 — Shopping List

## What it does

Counts how many department visits the naive (in-order) walk costs, counts how
many distinct departments the optimal walk needs, and returns the difference —
all in a single pass.

## Key concepts

### Catalog as a `Map`

```js
const departmentByProduct = new Map(products)
```

`new Map(arrayOfPairs)` builds the product→department lookup directly from the
`[product, department]` entries.

### Two counters in one loop

```js
let lastDepartment = ''
let naiveVisits = 0
for (const product of list) {
  const department = departmentByProduct.get(product)
  if (department !== lastDepartment) naiveVisits++  // naive: count transitions
  lastDepartment = department
  distinctDepartments.add(department)               // optimal: count uniques
}
return naiveVisits - distinctDepartments.size
```

- **Naive** = number of times the department *changes* as you walk the list in
  order (run-length count).
- **Optimal** = number of *distinct* departments (a `Set`'s size).

## Implementation notes

- **One pass.** Both quantities are accumulated together; no need to walk the
  list twice.
- **`lastDepartment` starts as `''`.** Since no real department equals the empty
  string, the very first product always registers as a new visit.

## Things to watch out for

- **Naive counts transitions, not products.** Three Pantry items in a row are one
  visit, not three. Comparing each department to the previous one captures that.
- **Optimal ignores order entirely.** It only depends on *which* departments
  appear, so a `Set` is exactly the right tool.
- **Empty / single-item lists.** Both yield a difference of `0` (naive and
  optimal agree), which the transition/Set logic handles without special cases.
