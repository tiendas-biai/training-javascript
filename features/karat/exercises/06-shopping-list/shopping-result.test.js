import { shopping } from './shopping-result'

const products = [
  ['Cheese', 'Dairy'],
  ['Carrots', 'Produce'],
  ['Potatoes', 'Produce'],
  ['Canned Tuna', 'Pantry'],
  ['Romaine Lettuce', 'Produce'],
  ['Chocolate Milk', 'Dairy'],
  ['Flour', 'Pantry'],
  ['Iceberg Lettuce', 'Produce'],
  ['Coffee', 'Pantry'],
  ['Pasta', 'Pantry'],
  ['Milk', 'Dairy'],
  ['Blueberries', 'Produce'],
  ['Pasta Sauce', 'Pantry'],
]

describe('shopping (result)', () => {
  it('returns the visit difference for a mixed list', () => {
    const list = ['Blueberries', 'Flour', 'Pasta', 'Milk', 'Iceberg Lettuce', 'Cheese']
    // naive: Produce, Pantry, (Pantry), Dairy, Produce, Dairy = 5; optimal = 3
    expect(shopping(products, list)).toBe(2)
  })

  it('is 0 when consecutive products already group by department', () => {
    const list = ['Carrots', 'Potatoes', 'Milk', 'Cheese']
    // naive: Produce, (Produce), Dairy, (Dairy) = 2; optimal = 2
    expect(shopping(products, list)).toBe(0)
  })

  it('is 0 for a single product', () => {
    expect(shopping(products, ['Milk'])).toBe(0)
  })

  it('is 0 for an empty list', () => {
    expect(shopping(products, [])).toBe(0)
  })
})
