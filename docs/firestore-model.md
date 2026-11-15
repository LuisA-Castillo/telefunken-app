# Modelo de datos en Firestore

## Propósito de este documento

Este documento describe cómo se almacena la información de Telefunken en Firebase Cloud Firestore.

Su objetivo es permitir que cualquier desarrollador pueda comprender:

- qué colecciones existen;
- qué representa cada documento;
- qué campos se almacenan;
- qué campos funcionan como identificadores;
- qué información pertenece a la partida;
- qué información pertenece a los jugadores;
- cómo se almacenan las manos;
- cómo se almacenan los resultados;
- qué información se obtiene mediante listeners;
- qué información se reconstruye localmente;
- qué datos no deben duplicarse innecesariamente;
- cómo se espera que evolucione el modelo multijugador.

Este documento describe el modelo persistente.

La arquitectura general de la aplicación se documenta en:

```text
docs/architecture.md
```

El estado actual del desarrollo se documenta en:

```text
docs/current-status.md
```

---

# Firestore como fuente persistente

Firestore funciona como la fuente persistente y compartida de la partida.

Esto significa que la información que debe ser conocida por varios dispositivos o recuperada después de una recarga debe almacenarse en Firestore.

Ejemplos:

```text
partida
jugadores
host
estado de la partida
mano actual
repartidor
manos registradas
resultados
```

Firestore no reemplaza el estado temporal de la aplicación.

La relación general es:

```text
Firestore
   ↓
consultas / listeners
   ↓
appState
   ↓
interfaz
```

Cuando un usuario realiza una acción:

```text
interfaz
   ↓
main.js
   ↓
lógica
   ↓
services/
   ↓
Firestore
```

---

# Estructura general

La estructura persistente esperada es:

```text
games
└── {gameId}
    ├── code
    ├── mode
    ├── hostPlayerId
    ├── status
    ├── currentHand
    ├── dealerIndex
    ├── createdAt
    │
    ├── players
    │   └── {playerId}
    │       ├── name
    │       ├── order
    │       └── joinedAt
    │
    └── hands
        └── hand-N
            ├── number
            ├── dealerIndex
            ├── endReason
            ├── status
            ├── createdAt
            │
            └── results
                └── {playerId}
                    ├── completedGameCode
                    ├── points
                    ├── purchasesUsed
                    └── createdAt
```

La colección principal es:

```text
games
```

Cada documento representa una partida independiente.

---

# Colección `games`

Ruta:

```text
games/{gameId}
```

Cada documento representa una partida.

El identificador:

```text
gameId
```

es generado por Firestore al crear la partida.

Este identificador es interno.

No es el código que los jugadores utilizan para ingresar.

---

# Diferencia entre `gameId` y `code`

La aplicación maneja dos identificadores distintos para una partida.

## `gameId`

Ejemplo conceptual:

```text
8GskA1pQx7...
```

Es el identificador interno del documento de Firestore.

Se utiliza para construir rutas como:

```text
games/{gameId}/players
games/{gameId}/hands
```

El usuario normalmente no necesita conocerlo.

---

## `code`

Ejemplo:

```text
TELE-4821
```

Es el código visible utilizado por los jugadores para encontrar y unirse a una partida.

El flujo es:

```text
Jugador ingresa TELE-4821
        ↓
consulta por campo code
        ↓
se obtiene gameId
        ↓
la aplicación trabaja con gameId
```

---

# Campos del documento de partida

El documento:

```text
games/{gameId}
```

contiene actualmente información general de la partida.

## `code`

Tipo:

```text
string
```

Ejemplo:

```text
TELE-4821
```

Responsabilidad:

- permitir que otros jugadores encuentren la partida;
- servir como código visible;
- no utilizarse como identificador interno de las relaciones.

---

## `mode`

Tipo:

```text
string
```

Valores:

```text
ordenado
libre
```

Determina las reglas generales de la partida.

---

## `hostPlayerId`

Tipo:

```text
string
```

Ejemplo:

```text
player-k3m9x2
```

Representa al jugador que actualmente funciona como anfitrión.

Es la única fuente de verdad persistente para determinar el host.

La aplicación no debe mantener campos alternativos como:

```text
host
isHost
```

La comprobación correcta es conceptualmente:

```javascript
currentPlayerId === hostPlayerId
```

---

## `status`

Tipo:

```text
string
```

Estados actuales:

```text
lobby
in_progress
finished
aborted
```

Significado:

```text
lobby
→ la partida todavía no ha comenzado

in_progress
→ la partida se está jugando

finished
→ la partida terminó normalmente

aborted
→ la partida fue interrumpida
```

El estado principal de la partida permite que cada dispositivo determine qué pantalla debería mostrar.

---

## `currentHand`

Tipo:

```text
number
```

Representa el número de la mano actualmente activa.

Ejemplo:

```text
1
2
3
...
```

Antes de iniciar la partida puede utilizarse:

```text
0
```

Cuando comienza:

```text
currentHand = 1
```

---

## `dealerIndex`

Tipo:

```text
number
```

Representa la posición del repartidor dentro del arreglo ordenado de jugadores.

Ejemplo:

```text
players[0]
players[1]
players[2]
```

No almacena directamente el nombre ni el identificador del repartidor.

El jugador se obtiene mediante:

```javascript
game.players[game.dealerIndex]
```

Después de cada mano el índice debe rotar hacia la derecha.

---

## `createdAt`

Tipo esperado:

```text
Firestore Timestamp
```

Debe ser generado con:

```javascript
serverTimestamp()
```

Se utiliza para registrar cuándo fue creada la partida.

### Observación de implementación actual

En una versión actual del Repository existe todavía el campo:

```text
createsAt
```

debido a un error tipográfico.

El nombre deseado y documentado es:

```text
createdAt
```

Este detalle deberá corregirse posteriormente de manera controlada para evitar mantener dos nombres diferentes.

---

# Subcolección `players`

Ruta:

```text
games/{gameId}/players/{playerId}
```

Cada jugador se almacena como un documento independiente.

La decisión de utilizar una subcolección permite:

- agregar jugadores individualmente;
- eliminarlos individualmente;
- escuchar cambios en tiempo real;
- modificar el orden;
- no tener que reemplazar un array completo dentro del documento principal.

---

# Identificador de jugador

El identificador del documento es:

```text
playerId
```

Ejemplo:

```text
player-k3m9x2
```

El mismo valor se utiliza dentro de la aplicación como:

```javascript
player.id
```

Por tanto:

```text
player.id
=
ID del documento Firestore
```

Esto evita mantener dos identificadores diferentes.

---

# Campos de `players/{playerId}`

## `name`

Tipo:

```text
string
```

Ejemplo:

```text
Beto
Mel
Techi
```

Se utiliza únicamente para presentación.

No debe utilizarse para establecer relaciones internas.

---

## `order`

Tipo:

```text
number
```

Representa la posición del jugador dentro de la mesa.

Ejemplo:

```text
0
1
2
3
```

Los jugadores se recuperan utilizando:

```text
orderBy("order")
```

para conservar el orden definido en el lobby.

Este orden también determina inicialmente quién reparte.

---

## `joinedAt`

Tipo:

```text
Firestore Timestamp
```

Se genera mediante:

```javascript
serverTimestamp()
```

Representa el momento en que el jugador ingresó a la partida.

No determina necesariamente el orden físico.

El orden físico se controla mediante:

```text
order
```

---

# Información que no se almacena actualmente en `players`

Algunas propiedades existen en memoria pero no necesitan almacenarse directamente como campos persistentes.

Ejemplos:

```text
purchasesRemaining
totalScore
completedGames
penalties
```

Estas propiedades pueden reconstruirse a partir de:

- modalidad de juego;
- manos registradas;
- resultados.

Esto evita almacenar información redundante que podría quedar desincronizada.

---

# Reconstrucción de compras

Las compras restantes se obtienen conceptualmente mediante:

```text
compras iniciales
-
sumatoria de purchasesUsed
=
compras restantes
```

Ejemplo en modo libre:

```text
7 compras iniciales
-
3 utilizadas
=
4 restantes
```

No es obligatorio mantener un campo persistente:

```text
purchasesRemaining
```

dentro de cada jugador si puede reconstruirse correctamente.

---

# Reconstrucción de puntaje total

El total de un jugador también puede calcularse a partir de los resultados registrados.

Conceptualmente:

```text
results
   ↓
sumatoria de points
   ↓
totalScore
```

Por tanto:

```text
totalScore
```

puede funcionar como propiedad derivada.

---

# Subcolección `hands`

Ruta:

```text
games/{gameId}/hands/{handId}
```

Cada documento representa una mano física ya cerrada o en proceso de recopilación de resultados.

---

# Identificador de las manos

Actualmente se utilizan identificadores determinísticos.

Formato:

```text
hand-N
```

Ejemplos:

```text
hand-1
hand-2
hand-3
hand-14
```

El identificador se genera utilizando:

```javascript
`hand-${hand.number}`
```

---

# Por qué no se utilizan IDs automáticos para las manos

Anteriormente podía utilizarse:

```javascript
addDoc()
```

lo que generaba identificadores aleatorios.

En el flujo multijugador esto podía producir duplicados si ocurría:

- doble clic;
- reintento;
- retraso de red;
- recarga;
- ejecución repetida de la misma operación.

Con un identificador determinístico:

```text
hand-1
```

la misma mano siempre apunta al mismo documento.

Por esta razón se utiliza:

```javascript
setDoc()
```

sobre una referencia conocida.

---

# Campos de una mano

Ejemplo:

```text
games/{gameId}/hands/hand-1
```

puede almacenar:

```text
number: 1
dealerIndex: 0
endReason: "player_out"
status: "collecting_results"
createdAt: Timestamp
```

---

## `number`

Tipo:

```text
number
```

Representa el número de la mano dentro de la partida.

Ejemplo:

```text
1
```

Debe coincidir con el identificador:

```text
hand-1
```

---

## `dealerIndex`

Tipo:

```text
number
```

Representa quién repartió esa mano.

Es importante guardar este valor en la propia mano porque posteriormente:

```text
game.dealerIndex
```

continuará avanzando.

La mano debe conservar quién repartió históricamente.

---

## `endReason`

Tipo:

```text
string
```

Valores actuales:

```text
player_out
draw_pile_exhausted
```

Significado:

```text
player_out
→ un jugador se quedó sin cartas

draw_pile_exhausted
→ la pila se agotó según las reglas de la partida
```

El motivo pertenece a la mano completa.

No debe repetirse dentro del resultado de cada jugador.

---

## `status`

Tipo:

```text
string
```

En el nuevo flujo multijugador se utilizan inicialmente:

```text
collecting_results
completed
```

---

# Estado `collecting_results`

Significa:

```text
La mano física ya terminó,
pero todavía faltan resultados
de uno o más jugadores.
```

Mientras una mano tenga este estado:

- no debe avanzar `currentHand`;
- no debe cambiar `dealerIndex`;
- los jugadores deben registrar sus resultados;
- el host debe esperar a que todos terminen;
- los dispositivos deben permanecer sincronizados con esa mano.

---

# Estado `completed`

Significa:

```text
todos los resultados fueron registrados,
validados y confirmados
```

Después de esto puede avanzarse a la siguiente mano.

---

# Ciclo esperado de una mano

```text
Partida jugando
      ↓
Host pulsa Finalizar mano
      ↓
selecciona endReason
      ↓
se crea hand-N
      ↓
status = collecting_results
      ↓
cada jugador registra
      ↓
todos los resultados presentes
      ↓
host confirma
      ↓
validación
      ↓
status = completed
      ↓
currentHand aumenta
      ↓
dealerIndex cambia
```

---

# Subcolección `results`

Ruta:

```text
games/{gameId}/hands/hand-N/results/{playerId}
```

Cada documento representa el resultado de un jugador específico durante una mano específica.

---

# Por qué cada resultado utiliza `playerId` como ID

Ejemplo:

```text
results/player-k3m9x2
```

Esto garantiza conceptualmente:

```text
una mano
+
un jugador
=
un resultado
```

Si el mismo jugador vuelve a guardar su resultado antes de confirmar, el mismo documento puede actualizarse en lugar de crear un duplicado.

---

# Campos de un resultado

Un documento contiene:

```text
completedGameCode
points
purchasesUsed
createdAt
```

El `playerId` no necesita almacenarse adicionalmente como campo porque ya está contenido en:

```text
document.id
```

Al recuperar información, la aplicación puede reconstruir:

```javascript
{
    playerId: document.id,
    ...
}
```

---

## `completedGameCode`

Tipo:

```text
string | null
```

Ejemplos:

```text
1/3
2/3
1/4
2/4
1/5
2/5
ESC
null
```

En modo ordenado representa el juego correspondiente a la mano.

En modo libre:

```text
null
```

significa:

```text
el jugador no completó un juego
y los puntos corresponden a una penalización
```

---

## `points`

Tipo:

```text
number
```

Rango actualmente aceptado:

```text
0 - 999
```

Ejemplos:

```text
0
15
78
250
```

El valor:

```text
0
```

es válido.

Visualmente puede representarse como:

```text
—
```

cuando corresponde a un juego completado con cero puntos.

---

# Diferencia entre `null`, `0` y campo vacío

Estos valores no representan lo mismo.

## Juego pendiente

Visualmente:

```text
celda vacía
```

No existe todavía un resultado asociado a ese juego.

---

## Juego completado con cero puntos

Persistencia:

```text
completedGameCode = "1/3"
points = 0
```

Visualmente:

```text
—
```

---

## Penalización en modo libre

Persistencia:

```text
completedGameCode = null
points = número
```

Ejemplo:

```text
completedGameCode = null
points = 45
```

Esto representa una penalización independiente.

---

# `purchasesUsed`

Tipo:

```text
number
```

Representa cuántas compras utilizó ese jugador durante esa mano.

Ejemplos:

```text
0
1
2
```

Este dato permite reconstruir posteriormente:

```text
purchasesRemaining
```

---

## Primera mano del modo ordenado

En:

```text
1/3
```

no se permiten compras.

Por tanto:

```text
purchasesUsed = 0
```

aunque visualmente el campo de compras no aparezca.

---

# `createdAt` del resultado

Tipo:

```text
Firestore Timestamp
```

Se genera mediante:

```javascript
serverTimestamp()
```

Permite conocer cuándo fue registrado el resultado.

No determina el orden de jugadores.

---

# Escritura individual de resultados

En el flujo multijugador cada dispositivo debe escribir únicamente:

```text
results/{currentPlayerId}
```

Ejemplo:

```text
Teléfono de Beto

currentPlayerId = player-beto
        ↓
escribe únicamente
results/player-beto
```

Mientras:

```text
Teléfono de Mel

currentPlayerId = player-mel
        ↓
escribe únicamente
results/player-mel
```

Un jugador normal no debe registrar todos los resultados desde su dispositivo.

---

# Resultado esperado con tres jugadores

```text
hands/hand-1
│
└── results
    ├── player-beto
    │   ├── completedGameCode: "1/3"
    │   ├── points: 0
    │   └── purchasesUsed: 0
    │
    ├── player-mel
    │   ├── completedGameCode: "1/3"
    │   ├── points: 25
    │   └── purchasesUsed: 0
    │
    └── player-techi
        ├── completedGameCode: "1/3"
        ├── points: 70
        └── purchasesUsed: 0
```

---

# Determinar si todos registraron

La aplicación puede comparar:

```text
cantidad de jugadores
```

con:

```text
cantidad de documentos en results
```

Ejemplo:

```text
3 jugadores
3 resultados
→ todos registraron
```

Mientras:

```text
3 jugadores
2 resultados
→ falta un jugador
```

El host no debe poder avanzar mientras falten resultados.

---

# Validación grupal

Los resultados registrados deben poder mostrarse en tiempo real.

Ejemplo:

```text
Beto   ✓ Registrado
Mel    ✓ Registrado
Techi  ⏳ Pendiente
```

Para esto será necesario escuchar la subcolección:

```text
games/{gameId}/hands/hand-N/results
```

mediante un listener.

---

# Listeners actuales y futuros

Actualmente existen listeners relacionados con:

```text
games/{gameId}
```

y:

```text
games/{gameId}/players
```

El flujo multijugador requiere además:

```text
games/{gameId}/hands/hand-N
```

y:

```text
games/{gameId}/hands/hand-N/results
```

---

# Listener del documento de partida

Ruta:

```text
games/{gameId}
```

Debe permitir detectar cambios como:

```text
hostPlayerId
status
currentHand
dealerIndex
```

Ejemplo:

```text
host inicia partida
      ↓
status cambia a in_progress
      ↓
otros dispositivos detectan
      ↓
muestran la mesa
```

---

# Listener de jugadores

Ruta:

```text
games/{gameId}/players
```

Permite detectar:

- ingreso;
- eliminación;
- cambio de orden.

Los documentos se consultan utilizando:

```text
orderBy("order")
```

---

# Listener de la mano actual

Pendiente de implementar.

Ruta:

```text
games/{gameId}/hands/hand-N
```

Su primera responsabilidad será detectar:

```text
status = collecting_results
```

Cuando esto ocurra:

```text
todos los dispositivos
→ deben abrir el flujo de registro individual
```

---

# Listener de resultados

Pendiente de implementar.

Ruta:

```text
games/{gameId}/hands/hand-N/results
```

Su responsabilidad será detectar:

- nuevos resultados;
- correcciones;
- cantidad de jugadores registrados;
- jugadores pendientes.

---

# Recuperación después de recargar

Al recargar la aplicación se recupera:

```text
localStorage
      ↓
currentGameId
currentPlayerId
      ↓
Firestore
```

Luego se consultan:

```text
games/{gameId}
players
hands
results
```

La información se transforma nuevamente en el modelo utilizado por la aplicación.

---

# Reconstrucción de manos

Al recuperar una partida:

```text
getHandsFromGame()
```

consulta:

```text
games/{gameId}/hands
```

ordenando por:

```text
number
```

Después, por cada mano, recupera:

```text
results
```

para reconstruir una estructura similar a:

```javascript
{
    number: 1,
    dealerIndex: 0,
    endReason: 'player_out',
    results: [
        ...
    ]
}
```

---

# Estado persistente y propiedades derivadas

No toda información utilizada por la aplicación debe convertirse automáticamente en un campo Firestore.

Antes de persistir algo debe preguntarse:

```text
¿este valor puede reconstruirse de forma confiable?
```

Ejemplo:

```text
purchasesRemaining
```

puede reconstruirse.

Otro ejemplo:

```text
totalScore
```

también puede calcularse.

Mantener demasiados valores derivados puede provocar inconsistencias.

Ejemplo problemático:

```text
results dicen total = 120
pero campo totalScore = 105
```

La aplicación tendría entonces dos fuentes de verdad.

---

# Datos que actualmente conviene derivar

Actualmente pueden considerarse derivados:

```text
purchasesRemaining
totalScore
completedGames
penalties
```

Su información base está presente en los resultados.

---

# Datos que sí necesitan persistencia directa

Información como:

```text
status
currentHand
dealerIndex
hostPlayerId
endReason
points
purchasesUsed
```

representa hechos o estado compartido que no debería depender únicamente de la memoria de un dispositivo.

---

# Modelo local de una partida

Firestore no necesariamente replica exactamente el objeto utilizado en JavaScript.

Localmente puede existir:

```javascript
game = {
    code,
    mode,
    hostPlayerId,
    status,
    currentHand,
    dealerIndex,
    players: [],
    hands: []
}
```

Firestore distribuye esa información en:

```text
documento principal
+
subcolecciones
```

Esto evita documentos grandes y facilita sincronización independiente.

---

# Diferencia entre modelo local y modelo persistente

Modelo local:

```text
game.players
game.hands
```

Modelo Firestore:

```text
games/{gameId}/players
games/{gameId}/hands
```

Cuando se recupera una partida:

```text
Firestore
   ↓
consultas
   ↓
reconstrucción
   ↓
game
```

---

# Estado de una partida frente al estado de una mano

Estos dos estados no representan lo mismo.

## Estado de partida

Ejemplo:

```text
in_progress
```

significa que la partida completa continúa activa.

## Estado de mano

Ejemplo:

```text
collecting_results
```

significa que una mano específica terminó físicamente pero está esperando resultados.

Por tanto puede existir:

```text
game.status = in_progress
```

al mismo tiempo que:

```text
hand.status = collecting_results
```

Esto es correcto.

---

# Ejemplo completo durante registro de resultados

Documento principal:

```text
games/ABC123

status: "in_progress"
currentHand: 1
dealerIndex: 0
```

Mano:

```text
games/ABC123/hands/hand-1

number: 1
dealerIndex: 0
endReason: "player_out"
status: "collecting_results"
```

Resultados:

```text
games/ABC123/hands/hand-1/results/player-beto

completedGameCode: "1/3"
points: 0
purchasesUsed: 0
```

Si Mel todavía no ha enviado:

```text
results/player-mel
```

todavía no existe.

---

# Avance después de completar resultados

Cuando todos los resultados estén presentes y sean válidos:

```text
hand-1.status
collecting_results
        ↓
completed
```

Luego:

```text
game.currentHand
1
↓
2
```

y:

```text
game.dealerIndex
0
↓
1
```

Esto permite que todos los dispositivos detecten el nuevo estado de la partida.

---

# Partida finalizada

Cuando se cumplan las condiciones de finalización:

```text
game.status = finished
```

La persistencia completa de este flujo todavía está pendiente de integración.

Posteriormente deberá quedar almacenada suficiente información para:

- mostrar resultados finales;
- consultar historial;
- determinar ganadores;
- impedir modificaciones no autorizadas.

---

# Partida abortada

Cuando el host interrumpe una partida:

```text
game.status = aborted
```

El modelo lógico ya contempla este estado.

La persistencia completa del flujo de aborto todavía debe integrarse.

La partida abortada debe conservarse y no debe eliminarse como si nunca hubiera existido.

---

# Eliminación de partidas

Actualmente una partida puede eliminarse completamente cuando:

```text
todavía está en lobby
+
el último jugador abandona
```

En ese caso:

```text
deleteGame()
```

elimina el documento principal.

Esto ocurre porque la partida nunca llegó a comenzar.

Una partida iniciada no debe eliminarse simplemente porque alguien abandone.

---

# Consistencia de identificadores

El proyecto sigue estas reglas:

```text
gameId
→ documento interno de partida

code
→ código visible TELE-XXXX

playerId
→ identidad lógica del jugador

hand-N
→ identidad determinística de mano
```

Estas responsabilidades no deben mezclarse.

---

# Regla de nombres

Los nombres visibles:

```text
Beto
Mel
Techi
```

no deben utilizarse en rutas Firestore como identificadores.

No debería existir una ruta lógica dependiente de:

```text
results/Beto
```

Debe utilizarse:

```text
results/player-k3m9x2
```

Esto evita problemas por:

- nombres repetidos;
- cambios de nombre;
- espacios;
- caracteres especiales.

---

# Operaciones actuales del Repository

Actualmente `gameRepository.js` contiene funciones relacionadas con:

```text
Partidas
├── createGameInFirestore()
├── findGameByCode()
├── getGameById()
├── subscribeToGame()
├── updateGameHost()
├── updateGameState()
├── deleteGame()
└── gameCodeExists()

Jugadores
├── addPlayerToGame()
├── getPlayersFromGame()
├── updatePlayerOrder()
├── updatePlayersOrder()
├── deletePlayerFromGame()
└── subscribeToGamePlayers()

Manos
├── createHandInFirestore()
└── getHandsFromGame()

Resultados
├── saveHandResult()
├── saveHandResultsToFirebase()
└── getHandResults()
```

A medida que se implemente el flujo multijugador probablemente deberán añadirse funciones específicas para:

```text
escuchar mano actual
escuchar resultados
actualizar estado de mano
```

Antes de crear nuevas funciones debe revisarse si ya existe una operación equivalente que pueda reutilizarse.

---

# Operaciones pendientes del modelo multijugador

El siguiente bloque necesitará operaciones equivalentes a:

```text
subscribeToCurrentHand()
subscribeToHandResults()
updateHandStatus()
```

Los nombres definitivos deberán decidirse durante la implementación.

No deben agregarse funciones únicamente por adelantado si todavía no son necesarias.

---

# Correcciones del anfitrión

El diseño funcional establece que el anfitrión debe poder corregir errores.

Esto implica que el modelo:

```text
results/{playerId}
```

debe permitir actualizar el documento correspondiente.

Utilizar IDs determinísticos facilita esta operación.

Ejemplo:

```text
resultado incorrecto de Mel
        ↓
host corrige
        ↓
setDoc/updateDoc
        ↓
results/player-mel
```

La interfaz y los permisos concretos todavía deberán implementarse.

---

# Concurrencia

Al existir múltiples dispositivos pueden ocurrir acciones simultáneas.

El modelo intenta reducir problemas mediante:

- IDs determinísticos;
- un único host;
- un resultado por jugador;
- estados explícitos;
- listeners en tiempo real.

Ejemplos:

```text
hand-1
```

evita duplicar la primera mano.

```text
results/{playerId}
```

evita crear múltiples documentos para el mismo jugador en la misma mano.

---

# Seguridad

Actualmente la aplicación utiliza una identidad propia basada en:

```text
playerId
```

y no un sistema tradicional de autenticación Firebase.

Esto simplifica la experiencia familiar, pero hace que las reglas de seguridad de Firestore requieran especial atención.

Antes de considerar la aplicación lista para exposición pública deben revisarse:

- permisos de lectura;
- permisos de escritura;
- quién puede modificar una partida;
- quién puede modificar jugadores;
- quién puede cerrar manos;
- quién puede escribir resultados;
- quién puede cambiar el host;
- quién puede marcar una partida como terminada.

La protección visual de botones no reemplaza las reglas de seguridad del backend.

---

# Estado actual frente a modelo objetivo

Parte del modelo ya está implementada y funcionando.

Actualmente funciona:

```text
games
players
hostPlayerId
status
currentHand
dealerIndex
hands/hand-N
```

También existe soporte para persistencia de resultados.

El nuevo flujo todavía debe integrar completamente:

```text
listener de hand-N
listener de results
registro individual
confirmación grupal
estado completed
avance sincronizado
```

---

# Próxima evolución del modelo

El siguiente cambio esperado es:

```text
games/{gameId}/hands/hand-N
```

será escuchado en tiempo real.

Cuando:

```text
status = collecting_results
```

cada dispositivo deberá abrir el formulario correspondiente a:

```text
currentPlayerId
```

Después:

```text
results/{playerId}
```

será escuchado en tiempo real para conocer qué jugadores ya registraron.

---

# Principios del modelo de datos

## 1. Evitar duplicar fuentes de verdad

Si un valor puede derivarse de forma confiable, no debe almacenarse innecesariamente.

---

## 2. Utilizar identificadores estables

```text
playerId
hand-N
gameId
```

deben utilizarse para relaciones internas.

---

## 3. Los nombres son presentación

```text
player.name
```

no es una clave primaria.

---

## 4. Firestore contiene información compartida

Todo dato necesario para varios dispositivos debe poder recuperarse desde Firestore.

---

## 5. Cada resultado pertenece a un jugador

```text
results/{playerId}
```

garantiza una relación clara.

---

## 6. La mano tiene su propio estado

Una partida activa puede contener una mano que esté recopilando resultados.

---

## 7. El historial debe conservar los hechos

Datos como:

```text
dealerIndex
endReason
points
purchasesUsed
```

deben quedar asociados a la mano donde ocurrieron.

---

# Mantenimiento de este documento

Este documento debe actualizarse cuando cambie:

- la estructura de colecciones;
- el nombre de campos persistentes;
- el significado de un estado;
- la estrategia de identificadores;
- la forma de almacenar resultados;
- la forma de reconstruir información;
- la estrategia de sincronización;
- una decisión importante sobre Firestore.

Los avances diarios o tareas pendientes generales deben registrarse en:

```text
docs/current-status.md
```

La organización de responsabilidades del código debe actualizarse en:

```text
docs/architecture.md
```

---

# Documentación relacionada

```text
docs/current-status.md
→ estado actual y siguiente paso

docs/architecture.md
→ arquitectura general

docs/game-rules.md
→ reglas del juego

docs/requirements.md
→ requisitos funcionales

docs/git-workflow.md
→ estrategia Git/GitHub

docs/ux-flow.md
→ navegación e interacción
```