# Grafos — desde cero

> Teoría en español, pensada para entender los grafos desde lo más básico.
> Los ejemplos ejecutables están en `grafos.js` (córrelo con `node grafos.js`).

## 1. ¿Qué es un grafo?

Un grafo es simplemente **cosas conectadas entre sí**. Nada más. Se compone de:

- **Nodos** (también llamados *vértices*): las "cosas". Personas, ciudades,
  páginas web, casillas de un tablero.
- **Aristas** (también llamadas *edges* o *conexiones*): las relaciones entre
  esas cosas. Amistades, carreteras, links, teletransportadores.

Ya usas grafos todos los días sin llamarlos así:

| Ejemplo real | Nodos | Aristas |
|---|---|---|
| Red social | personas | amistades |
| Google Maps | ciudades/esquinas | carreteras |
| Internet | páginas | links |
| Karat ejercicio 08 | usuarios | eventos CONNECT |
| Karat ejercicio 11 | ubicaciones | carreteras con minutos |

La idea clave: cuando un problema dice "X está conectado con Y", estás ante
un grafo, aunque la palabra "grafo" no aparezca en ningún lado.

## 2. Tipos de grafos (los 3 conceptos que importan)

**a) No dirigido vs dirigido.**
- *No dirigido*: la conexión va en ambos sentidos. Si Alice es amiga de Bob,
  Bob es amigo de Alice. (Ejercicio 08: "connections are always symmetrical".)
- *Dirigido*: la conexión tiene flecha. Yo te sigo en Twitter, pero tú a mí
  no. Las carreteras del ejercicio 11 son dirigidas: van de `origin` a
  `destination`.

**b) Con peso vs sin peso.**
- *Sin peso*: la conexión existe o no existe (amistad).
- *Con peso*: la conexión tiene un costo — minutos, kilómetros, dinero.
  (Ejercicio 11: cada carretera tarda `duration` minutos.)

**c) Con ciclos vs sin ciclos.**
- Un *ciclo* es un camino que vuelve al punto de partida (A → B → C → A).
  Importa porque un recorrido ingenuo puede quedarse dando vueltas infinitas —
  por eso los recorridos usan un conjunto de "visitados" (lo vemos abajo).

## 3. ¿Cómo se guarda un grafo en JavaScript?

La representación que vas a usar el 99% de las veces se llama **lista de
adyacencia**: un `Map` donde cada nodo apunta al conjunto de sus vecinos.

```js
// "adyacente" = vecino, nodo directamente conectado
const amigos = new Map()
amigos.set('Alice', new Set(['Bob', 'Charlie']))
amigos.set('Bob', new Set(['Alice']))
amigos.set('Charlie', new Set(['Alice']))
```

¿Por qué `Map` de `Set`s y no otra cosa?

- `Map` → buscar los vecinos de un nodo es O(1): `amigos.get('Alice')`.
- `Set` → no hay vecinos duplicados (dos CONNECT de las mismas personas no
  cuentan doble) y preguntar "¿son amigos?" es O(1): `set.has('Bob')`.

La alternativa que verás en libros es la **matriz de adyacencia** (una tabla
n×n de true/false). Casi nunca conviene en entrevistas: gasta memoria n²
aunque haya pocas conexiones, y obliga a numerar los nodos. Menciónala si te
preguntan, pero usa el Map.

### Las dos reglas de oro al construirlo

1. **Grafo no dirigido = actualizar SIEMPRE los dos lados.** Si conectas
   Alice→Bob, también Bob→Alice. Si se te olvida un lado, el grafo queda
   "desincronizado" (Alice cree que conoce a Bob, Bob no) — es el bug número
   uno del ejercicio 08.
2. **Crear el nodo la primera vez que lo ves, y nunca borrarlo.** Se borran
   *aristas* (amistades), no *nodos* (personas). Un usuario que se quedó sin
   amigos sigue existiendo, con 0 conexiones — y el ejercicio 08 espera que
   lo clasifiques.

## 4. Grado de un nodo (lo único que pide el ejercicio 08)

El **grado** de un nodo es cuántos vecinos tiene. Con nuestra representación
es gratis:

```js
const gradoDeAlice = amigos.get('Alice').size // 2
```

Fíjate en algo importante para Karat: el ejercicio 08 ("Aquaintly") parece un
problemón de grafos, pero al final **solo pide el grado de cada usuario**
(¿tiene N o más conexiones?). No hay que recorrer nada. Muchos problemas de
grafos en entrevistas se resuelven solo construyendo bien la estructura.

## 5. Recorrer un grafo: BFS y DFS

A veces sí necesitas "caminar" por el grafo: ¿puedo llegar de A a B?
¿a cuántos pasos está? Para eso hay dos recorridos clásicos. Los dos visitan
todos los nodos alcanzables; cambia el **orden**.

### La pieza común: el conjunto de visitados

Como los grafos pueden tener ciclos (A→B→C→A), si caminas sin memoria te
quedas en un bucle infinito. La solución universal: un `Set` de nodos ya
visitados. Antes de procesar un nodo, pregunta si ya lo viste; márcalo al
verlo por primera vez.

### BFS — Breadth-First Search (búsqueda "a lo ancho")

Explora **por capas**: primero tus vecinos directos (distancia 1), luego los
vecinos de tus vecinos (distancia 2), y así. Como una onda expansiva.

- Estructura: una **cola** (queue — el primero que entra es el primero que
  sale, como la fila del súper).
- Superpoder: en grafos **sin pesos**, BFS encuentra el **camino más corto**
  (el mínimo número de saltos), porque explora por distancia creciente —
  la primera vez que llegas a un nodo, llegaste por el camino más corto.

```
BFS desde Alice:
  capa 0: Alice
  capa 1: Bob, Charlie        (amigos directos)
  capa 2: Diana               (amiga de Bob)
```

### DFS — Depth-First Search (búsqueda "en profundidad")

Explora **un camino hasta el fondo** antes de volver y probar otro. Como
recorrer un laberinto pegado a una pared.

- Estructura: **recursión** (o una pila explícita).
- Útil para: "¿existe algún camino?", detectar ciclos, recorrer todo un
  componente. NO garantiza el camino más corto.

### ¿Cuál uso?

| Pregunta del problema | Usa |
|---|---|
| "¿Cuál es el camino MÁS CORTO / mínimo de pasos?" (sin pesos) | **BFS** |
| "¿Existe conexión entre A y B?" | cualquiera (DFS es menos código) |
| "Visita/cuenta todo lo alcanzable" | cualquiera |
| Caminos más cortos CON pesos | Dijkstra (solo saber que existe; Karat no lo pide) |

Ambos cuestan O(nodos + aristas) en tiempo — visitas cada nodo y cada arista
una vez.

## 6. La lección Karat: lee la frase que "degrada" el grafo

Los problemas de Karat *parecen* de grafos y casi siempre se resuelven con
menos:

- **Ejercicio 08**: grafo no dirigido de verdad, pero solo pide grados →
  construir el Map de Sets bien (los dos lados, nodos que persisten) ES la
  solución. Cero recorridos.
- **Ejercicio 11**: "cada ubicación lleva a exactamente UNA siguiente" → el
  grafo es una **cadena** (lista ligada). Se camina con un `while` y un Map,
  sin BFS ni Dijkstra, sumando los minutos al pasar.
- **Ejercicio 05 (teleporters)**: un solo turno de dado → simulación directa.
  *Pero* si preguntaran "¿mínimo número de tiradas para llegar al final?",
  eso sí es BFS (cada casilla = nodo, cada tirada = arista). Decir ese pivote
  en voz alta suma puntos.

Regla práctica: primero busca en el enunciado la frase que simplifica
("symmetrical", "exactly one next location", "one roll"); si no existe y
piden "mínimo de pasos", saca BFS.

## 7. Errores comunes (checklist para repasar)

- Actualizar solo un lado de una arista no dirigida.
- Borrar el nodo cuando borras su última arista (los usuarios con 0
  conexiones desaparecen del resultado).
- Recorrer sin `visitados` → bucle infinito con ciclos.
- Marcar como visitado al *sacar* de la cola en vez de al *encolar* → en BFS
  puedes encolar el mismo nodo varias veces (funciona, pero es lento y se ve
  mal; márcalo al encolar).
- Usar DFS cuando piden camino más corto.
- Confundir "grados" con "número de eventos": el grado es vecinos *actuales*
  (los DISCONNECT restan).

## Siguiente paso

Abre `grafos.js` y córrelo (`node grafos.js`). Está dividido en 6 partes que
siguen este documento: construir el grafo, conectar/desconectar, grados
(ejercicio 08), BFS con traza impresa, DFS, y camino más corto con BFS.
Después re-resuelve el ejercicio `08-social-network` sin mirar la solución.
