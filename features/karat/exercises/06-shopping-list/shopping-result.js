/**
 * Difference between naive and optimal department visits for a shopping list.
 * @param {[string, string][]} products — [product, department] catalog
 * @param {string[]} list — ordered product names to buy
 * @returns {number} — naiveVisits - optimalVisits
 */
export function shopping(products, list) {
  const departmentByProduct = new Map(products)
  const distinctDepartments = new Set()

  let lastDepartment = ''
  let naiveVisits = 0

  for (const product of list) {
    const department = departmentByProduct.get(product)
    if (department !== lastDepartment) naiveVisits++
    lastDepartment = department
    distinctDepartments.add(department)
  }

  return naiveVisits - distinctDepartments.size
}
