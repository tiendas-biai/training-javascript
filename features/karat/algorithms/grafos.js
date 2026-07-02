// GRAFOS desde cero — ejemplos ejecutables (node grafos.js)
// Acompaña a GRAFOS.md. Cada parte imprime algo: lee la salida junto al código.

console.log('=== PARTE 1: construir un grafo (lista de adyacencia) ===\n')

// Un grafo no dirigido de amistades: Map<persona, Set<amigos>>
// - Map  → encontrar los vecinos de alguien es O(1)
// - Set  → sin duplicados, y preguntar "¿son amigos?" es O(1)
const amigos = new Map()

// Helper: devuelve el Set de vecinos de una persona, creándolo la primera
// vez que la vemos. Así los nodos existen aunque terminen sin conexiones.
function vecinosDe(persona) {
  if (!amigos.has(persona)) {
    amigos.set(persona, new Set())
  }
  return amigos.get(persona)
}

// Conectar es SIMÉTRICO: siempre se actualizan LOS DOS lados.
function conectar(a, b) {
  vecinosDe(a).add(b)
  vecinosDe(b).add(a)
}

function desconectar(a, b) {
  vecinosDe(a).delete(b)
  vecinosDe(b).delete(a)
}

conectar('Alice', 'Bob')
conectar('Alice', 'Charlie')
conectar('Bob', 'Diana')

// Así se ve el grafo por dentro:
for (const [persona, vecinos] of amigos) {
  console.log(`${persona} -> { ${[...vecinos].join(', ')} }`)
}
// Alice -> { Bob, Charlie }
// Bob -> { Alice, Diana }
// Charlie -> { Alice }
// Diana -> { Bob }

console.log('\n=== PARTE 2: desconectar (y por qué los nodos persisten) ===\n')

conectar('Eva', 'Alice')
desconectar('Eva', 'Alice') // Eva se queda sin amigos...

console.log('¿Eva sigue existiendo en el grafo?', amigos.has('Eva')) // true
console.log('Amigos de Eva:', amigos.get('Eva').size)               // 0
// Lección del ejercicio 08: se borran ARISTAS, nunca NODOS.
// Eva tiene 0 conexiones y aun así debe aparecer en el resultado.

console.log('\n=== PARTE 3: grado = número de vecinos (ejercicio 08) ===\n')

// El "grado" de un nodo es el tamaño de su Set. Con eso, el ejercicio 08
// (¿quién tiene N o más conexiones?) ya está resuelto: no hay que recorrer nada.
const objetivo = 2
const populares = []
const noPopulares = []
for (const [persona, vecinos] of amigos) {
  if (vecinos.size >= objetivo) populares.push(persona)
  else noPopulares.push(persona)
}
console.log(`Con ${objetivo}+ conexiones:`, populares)     // [ 'Alice', 'Bob' ]
console.log(`Con menos de ${objetivo}:`, noPopulares)      // [ 'Charlie', 'Diana', 'Eva' ]

console.log('\n=== PARTE 4: BFS — recorrer por capas, con traza ===\n')

// BFS visita el grafo "en ondas": primero los vecinos directos (distancia 1),
// luego los vecinos de esos (distancia 2), etc. Usa una COLA (fila del súper).
function bfs(grafo, inicio) {
  const visitados = new Set([inicio]) // marcamos al ENCOLAR, no al salir
  const cola = [[inicio, 0]]          // pares [nodo, distancia desde inicio]

  while (cola.length > 0) {
    const [actual, distancia] = cola.shift() // saca el PRIMERO (FIFO)
    console.log(`  visito ${actual} (distancia ${distancia})`)

    for (const vecino of grafo.get(actual) ?? new Set()) {
      if (!visitados.has(vecino)) {
        visitados.add(vecino)
        cola.push([vecino, distancia + 1])
      }
    }
  }
  return visitados
}

console.log('BFS desde Alice:')
bfs(amigos, 'Alice')
// visito Alice (0) → Bob (1) → Charlie (1) → Diana (2)
// Fíjate: salen ordenados por distancia. Esa es la gracia de BFS.

console.log('\n=== PARTE 5: DFS — un camino hasta el fondo, luego vuelve ===\n')

// DFS con recursión: métete por un vecino hasta agotarlo, después el siguiente.
// El Set de visitados evita los bucles infinitos cuando hay ciclos.
function dfs(grafo, actual, visitados = new Set()) {
  visitados.add(actual)
  console.log(`  visito ${actual}`)
  for (const vecino of grafo.get(actual) ?? new Set()) {
    if (!visitados.has(vecino)) {
      dfs(grafo, vecino, visitados)
    }
  }
  return visitados
}

console.log('DFS desde Alice:')
dfs(amigos, 'Alice')
// visito Alice → Bob → Diana → Charlie
// Se fue "al fondo" por Bob→Diana antes de volver por Charlie.

console.log('\n=== PARTE 6: camino más corto SIN pesos = BFS ===\n')

// Como BFS explora por distancia creciente, la PRIMERA vez que llegas a un
// nodo llegaste por el camino más corto. Guardamos "desde dónde llegué"
// para poder reconstruir el camino al final.
function caminoMasCorto(grafo, inicio, destino) {
  const llegueDesde = new Map([[inicio, null]]) // nodo -> nodo anterior
  const cola = [inicio]

  while (cola.length > 0) {
    const actual = cola.shift()
    if (actual === destino) break
    for (const vecino of grafo.get(actual) ?? new Set()) {
      if (!llegueDesde.has(vecino)) {   // "has" hace de visitados
        llegueDesde.set(vecino, actual)
        cola.push(vecino)
      }
    }
  }

  if (!llegueDesde.has(destino)) return null // no hay camino

  // Reconstruir caminando hacia atrás: destino -> ... -> inicio
  const camino = []
  for (let nodo = destino; nodo !== null; nodo = llegueDesde.get(nodo)) {
    camino.unshift(nodo)
  }
  return camino
}

console.log('De Charlie a Diana:', caminoMasCorto(amigos, 'Charlie', 'Diana'))
// [ 'Charlie', 'Alice', 'Bob', 'Diana' ] — 3 saltos, y no existe nada más corto
console.log('De Charlie a Eva:  ', caminoMasCorto(amigos, 'Charlie', 'Eva'))
// null — Eva quedó desconectada en la Parte 2

console.log('\n=== BONUS: la "degradación" del ejercicio 11 ===\n')

// "Cada ubicación lleva a EXACTAMENTE UNA siguiente" → el grafo es una cadena.
// No hace falta BFS: se camina con un while, sumando los pesos (minutos).
const siguiente = new Map([
  ['Liverpool', { destino: 'Milton', minutos: 10 }],
  ['Milton', { destino: 'Campground', minutos: 30 }],
])

let ubicacion = 'Liverpool'
let tiempo = 0
while (siguiente.has(ubicacion)) {
  const { destino, minutos } = siguiente.get(ubicacion)
  tiempo += minutos
  ubicacion = destino
  console.log(`  llego a ${ubicacion} en el minuto ${tiempo}`)
}
// llego a Milton en el minuto 10
// llego a Campground en el minuto 40
// Lección: busca la frase del enunciado que simplifica el grafo antes de
// sacar la artillería (BFS/DFS/Dijkstra).
