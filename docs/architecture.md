# Arquitectura del proyecto

## Propósito de este documento

Este documento describe cómo está organizada técnicamente la aplicación Telefunken.

Su objetivo es permitir que cualquier desarrollador que se incorpore al proyecto pueda comprender:

- cómo está estructurado el código;
- qué responsabilidad tiene cada carpeta;
- dónde se encuentra la lógica del juego;
- dónde se genera la interfaz;
- dónde se realizan las operaciones con Firestore;
- cómo se administra el estado temporal;
- cómo se mantiene la sesión de cada dispositivo;
- cómo se sincronizan los diferentes jugadores;
- cómo circulan los datos dentro de la aplicación;
- dónde debería implementarse una nueva funcionalidad.

Este documento describe la arquitectura actual del sistema.

El estado concreto del desarrollo y el siguiente paso se encuentran en:

```text
docs/current-status.md
```

Las reglas del juego se documentarán en:

```text
docs/game-rules.md
```

---

# Tecnologías utilizadas

La aplicación utiliza actualmente:

- Vite
- Vanilla JavaScript
- HTML
- Bootstrap 5
- CSS personalizado mínimo
- Firebase
- Cloud Firestore
- Vitest
- Git
- GitHub
- GitHub Actions
- Netlify

No se utiliza actualmente un framework frontend como:

- React
- Angular
- Vue

La aplicación genera directamente sus interfaces mediante funciones JavaScript que retornan HTML.

---

# Visión general de la arquitectura

La arquitectura actual puede entenderse de forma simplificada de la siguiente manera:

```text
Usuario
   ↓
Interfaz
pages/
   ↓
Coordinación
main.js
   ↓
Lógica de negocio
utils/
   ↓
Persistencia y servicios
services/
   ↓
Configuración
firebase/
   ↓
Cloud Firestore
```

Además existe:

```text
state/
```

para mantener el contexto temporal de la aplicación mientras está ejecutándose.

La aplicación también utiliza:

```text
localStorage
```

para recordar únicamente la identidad del jugador y de la partida correspondiente al dispositivo.

---

# Estructura general del proyecto

La estructura conceptual actual es:

```text
telefunken-app/
│
├── src/
│   ├── components/
│   ├── firebase/
│   ├── pages/
│   ├── services/
│   ├── state/
│   ├── styles/
│   ├── utils/
│   └── main.js
│
├── tests/
│
├── docs/
│
├── .github/
│   └── workflows/
│
├── index.html
├── package.json
└── vite.config.js
```

Cada directorio tiene una responsabilidad distinta.

---

# Principio de separación de responsabilidades

El proyecto intenta mantener separadas las siguientes responsabilidades:

```text
pages/
→ presentación

utils/
→ lógica del juego

services/
→ persistencia y servicios externos

firebase/
→ configuración de Firebase

state/
→ estado temporal en memoria

main.js
→ coordinación entre las capas
```

La separación todavía está evolucionando y algunas partes del proyecto necesitarán refactorización a medida que aumente la funcionalidad multijugador.

---

# `src/main.js`

`main.js` funciona actualmente como el coordinador principal de la aplicación.

Es el punto donde se conectan:

- las pantallas;
- los eventos del usuario;
- la lógica del juego;
- el estado temporal;
- los servicios;
- Firestore;
- los listeners en tiempo real.

Entre sus responsabilidades actuales se encuentran:

- cambiar de pantalla;
- escuchar eventos de botones;
- recuperar el estado actual;
- ejecutar funciones de lógica;
- llamar servicios de persistencia;
- iniciar listeners;
- detener listeners;
- reaccionar a cambios de Firestore;
- actualizar `appState`;
- decidir qué pantalla mostrar según el estado de la partida.

---

## Navegación controlada desde `main.js`

Actualmente existen funciones como:

```javascript
showHome()
showCreateGame()
showJoinGame()
showLobby()
showGame()
showHandResults()
showFinalResults()
showAbortedGame()
```

Estas funciones:

1. consultan el estado necesario;
2. solicitan a una función de `pages/` que genere la interfaz;
3. insertan el HTML dentro del contenedor principal;
4. conectan eventos;
5. llaman lógica o servicios cuando el usuario interactúa.

Ejemplo conceptual:

```text
showGame()
    ↓
renderGame()
    ↓
HTML
    ↓
usuario pulsa botón
    ↓
evento en main.js
    ↓
función lógica o servicio
```

---

# Responsabilidad esperada de `main.js`

`main.js` debe actuar principalmente como coordinador.

No debería convertirse en el lugar donde se implementen todas las responsabilidades del sistema.

La intención arquitectónica es:

```text
main.js
→ coordina

pages/
→ presenta

utils/
→ resuelve reglas

services/
→ persiste y comunica

state/
→ mantiene contexto temporal
```

Por ejemplo, `main.js` puede decidir que debe guardarse una mano:

```text
main.js
    ↓
createHandInFirestore()
```

pero no debería contener internamente todo el código específico de Firestore necesario para escribir el documento.

Ese detalle pertenece al servicio correspondiente.

---

# `src/pages/`

La carpeta `pages/` contiene las funciones responsables de generar las diferentes pantallas de la aplicación.

Actualmente incluye archivos como:

```text
home.js
createGame.js
joinGame.js
lobby.js
game.js
handResults.js
finalResults.js
abortedGame.js
```

Cada archivo representa principalmente una vista o pantalla.

---

## Responsabilidad de `pages/`

Los archivos de `pages/` deben encargarse principalmente de:

- generar HTML;
- estructurar la pantalla;
- utilizar clases Bootstrap;
- mostrar información recibida;
- crear controles visibles;
- mostrar botones según permisos recibidos;
- preparar elementos que posteriormente serán utilizados por `main.js`.

Ejemplo:

```javascript
renderGame(game, playerIsHost)
```

puede recibir información y decidir si debe mostrar:

```text
Finalizar mano
```

o:

```text
Esperando a que el anfitrión finalice la mano.
```

---

## Lo que `pages/` no debería hacer

Idealmente, los archivos de `pages/` no deberían:

- escribir directamente en Firestore;
- administrar `localStorage`;
- calcular reglas complejas;
- modificar directamente el estado persistente;
- decidir cómo se guarda una partida;
- manejar listeners de Firebase.

Por ejemplo:

```text
game.js
```

puede mostrar quién reparte.

Pero la lógica que determina quién debe repartir la siguiente mano no debería implementarse dentro del HTML.

---

# `src/utils/`

La carpeta `utils/` contiene principalmente lógica independiente de la interfaz y de Firebase.

Aquí se encuentran:

- reglas del juego;
- validaciones;
- cálculos;
- transformaciones;
- lógica de ciclo de vida;
- operaciones sobre jugadores;
- construcción de resultados.

Entre los archivos actuales se encuentran:

```text
gameRules.js
gameSetup.js
gameTable.js
handResults.js
playerId.js
newGameFlow.js
gameLifecycle.js
lobbyPermissions.js
lobbyActions.js
gameCode.js
```

---

# `gameRules.js`

Este archivo contiene reglas generales y constantes del juego.

Entre ellas:

```javascript
MIN_PLAYERS
MAX_PLAYERS
ORDERED_PURCHASES
FREE_PURCHASES
GAME_STATUS
GAMES
```

También incluye funciones relacionadas con reglas como:

```javascript
isValidPlayerCount()
getInitialPurchases()
canAddPlayer()
movePlayer()
removePlayer()
getOrderedGame()
arePurchasesAllowed()
```

Este archivo debe mantenerse independiente de Firestore.

Una regla del juego debería poder probarse sin conexión a Firebase.

---

# `gameSetup.js`

Este archivo contiene la lógica necesaria para inicializar una partida.

Actualmente configura valores como:

```text
started
status
currentHand
dealerIndex
hands
purchasesRemaining
totalScore
completedGames
penalties
```

Ejemplo conceptual:

```text
Partida en lobby
      ↓
initializeGame()
      ↓
Partida preparada para jugar
```

La función modifica el modelo lógico de la partida.

Posteriormente `main.js` decide cuándo persistir los cambios mediante los servicios.

---

# `gameTable.js`

Este archivo contiene funciones relacionadas con la construcción lógica de la tabla de resultados.

Entre sus funciones se encuentran:

```javascript
getPlayerResults()
getGameScore()
getPenaltyScores()
getMaxPenaltyCount()
getPlayerTotal()
getPendingGames()
```

Estas funciones permiten transformar el historial de manos en información que posteriormente será presentada.

Ejemplo:

```text
game.hands
    ↓
getGameScore()
    ↓
puntaje correspondiente a 1/3
    ↓
renderGame()
```

---

# `handResults.js`

Este archivo contiene lógica relacionada con los resultados de las manos.

Entre las funciones existentes se encuentran:

```javascript
createPlayerResult()
validatePlayerResult()
validateHandResults()
saveHandResults()
advanceToNextHand()
isGameFinished()
getGameWinners()
```

Este archivo fue creado originalmente cuando un único dispositivo ingresaba los resultados de todos los jugadores.

El flujo multijugador está modificando esta responsabilidad.

El modelo anterior era:

```text
un dispositivo
      ↓
ingresa todos los resultados
      ↓
guarda la mano completa
```

El nuevo modelo es:

```text
cada dispositivo
      ↓
registra su propio resultado
      ↓
Firestore reúne todos los resultados
      ↓
el host confirma
```

Por esta razón algunas funciones de `handResults.js` seguirán siendo utilizadas y otras deberán adaptarse progresivamente.

---

# `playerId.js`

Este archivo genera identificadores internos para los jugadores.

Ejemplo:

```text
player-k3m9x2
```

El identificador es independiente del nombre visible.

La regla arquitectónica es:

```text
player.id
→ identidad lógica

player.name
→ presentación
```

Esto evita depender del nombre para establecer relaciones internas.

---

# `gameLifecycle.js`

Este archivo contiene lógica relacionada con el ciclo de vida general de una partida.

Entre sus responsabilidades están:

- finalizar una partida;
- abortar una partida;
- establecer estados finales;
- determinar información relacionada con la terminación.

Los estados principales son:

```text
lobby
in_progress
finished
aborted
```

---

# `lobbyPermissions.js`

Este archivo centraliza las reglas que determinan qué operaciones puede realizar un jugador dentro del lobby.

Ejemplos:

```text
¿Puede administrar el lobby?
¿Puede ingresar a la partida?
¿Puede abandonar?
```

Esto evita repetir condiciones como:

```javascript
playerId === game.hostPlayerId
```

en múltiples lugares de la interfaz.

---

# `lobbyActions.js`

Contiene operaciones lógicas relacionadas con cambios dentro del lobby.

Un ejemplo importante ocurre cuando el anfitrión abandona.

El flujo lógico es:

```text
host abandona
      ↓
se elimina de jugadores
      ↓
se determina el siguiente jugador
      ↓
ese jugador se convierte en host
```

La lógica de quién debe convertirse en host pertenece aquí.

La actualización del documento en Firestore pertenece a `services/`.

---

# `newGameFlow.js`

Este archivo contiene lógica relacionada con la creación de una nueva partida después de finalizar otra.

Entre sus responsabilidades lógicas pueden encontrarse:

- conservar jugadores;
- calcular el nuevo orden;
- determinar el nuevo primer repartidor;
- crear una nueva estructura de partida.

La persistencia completa de este flujo en Firestore todavía está pendiente.

---

# `gameCode.js`

Contiene la función base utilizada para generar códigos de partida.

El código visible utiliza el formato:

```text
TELE-XXXX
```

La comprobación de unicidad no pertenece directamente a este archivo porque requiere consultar Firestore.

Esa responsabilidad está actualmente en:

```text
services/gameCodeService.js
```

---

# `src/services/`

La carpeta `services/` contiene código relacionado con:

- persistencia;
- almacenamiento;
- servicios externos;
- interacción con Firebase;
- interacción con el almacenamiento del navegador.

Actualmente incluye principalmente:

```text
gameRepository.js
gameCodeService.js
sessionStorage.js
```

---

# `gameRepository.js`

`gameRepository.js` centraliza las operaciones de acceso a Cloud Firestore.

Funciona como una capa Repository.

En lugar de escribir directamente operaciones Firestore desde distintas pantallas, se utilizan funciones con significado para la aplicación.

Ejemplos actuales:

```javascript
createGameInFirestore()
addPlayerToGame()
getPlayersFromGame()
updatePlayerOrder()
updatePlayersOrder()
deletePlayerFromGame()
subscribeToGamePlayers()
findGameByCode()
getGameById()
subscribeToGame()
updateGameHost()
deleteGame()
gameCodeExists()
createHandInFirestore()
saveHandResult()
saveHandResultsToFirebase()
updateGameState()
getHandResults()
getHandsFromGame()
```

---

## Ventaja del Repository

Sin Repository podría ocurrir algo como:

```text
main.js
→ código Firestore

game.js
→ código Firestore

lobby.js
→ código Firestore

handResults.js
→ código Firestore
```

Eso dispersaría la persistencia por todo el proyecto.

La estructura deseada es:

```text
main.js
      ↓
gameRepository.js
      ↓
Firestore
```

Esto permite:

- centralizar operaciones;
- reducir duplicación;
- facilitar cambios;
- simplificar pruebas;
- mantener separada la persistencia de la interfaz.

---

# Operaciones de partida en Firestore

El Repository permite crear y recuperar partidas.

Ejemplo:

```text
createGameInFirestore()
        ↓
games/{gameId}
```

También puede buscar una partida utilizando el código visible:

```text
TELE-4821
       ↓
findGameByCode()
       ↓
consulta Firestore
       ↓
games/{gameId}
```

El usuario conoce el código:

```text
TELE-XXXX
```

pero internamente Firestore utiliza otro identificador para el documento.

---

# Operaciones de jugadores

Los jugadores se guardan como documentos dentro de:

```text
games/{gameId}/players/{playerId}
```

El `playerId` utilizado por la aplicación es también el identificador del documento.

Esto evita mantener dos identificadores distintos.

Ejemplo:

```text
player-k3m9x2
```

puede ser simultáneamente:

```text
player.id
```

y:

```text
ID del documento en Firestore
```

---

# Listeners en tiempo real

Firestore permite escuchar cambios mediante:

```javascript
onSnapshot()
```

Actualmente el sistema utiliza listeners para:

- jugadores del lobby;
- documento principal de la partida.

Estos listeners permiten que distintos dispositivos reaccionen sin necesidad de recargar.

---

## Listener de jugadores

El listener de jugadores permite detectar:

- nuevos jugadores;
- eliminación;
- cambio de orden.

Flujo:

```text
Dispositivo A
agrega jugador
      ↓
Firestore
      ↓
onSnapshot
      ↓
Dispositivo B
      ↓
actualiza jugadores
      ↓
renderiza nuevamente
```

---

## Listener de partida

El listener del documento principal permite detectar cambios como:

```text
hostPlayerId
status
currentHand
dealerIndex
```

Esto permite, por ejemplo, que cuando el host inicia la partida:

```text
status = in_progress
```

los demás dispositivos lo detecten automáticamente.

---

# Próximos listeners

La arquitectura multijugador necesita incorporar posteriormente:

```text
listener de la mano actual
listener de resultados de la mano
```

El primero permitirá detectar:

```text
status = collecting_results
```

El segundo permitirá detectar qué jugadores ya registraron su resultado.

---

# `gameCodeService.js`

Este servicio se encarga de obtener un código de partida que no esté siendo utilizado.

El proceso es:

```text
generar TELE-XXXX
      ↓
gameCodeExists()
      ↓
¿ya existe?
   ↙       ↘
 sí         no
 ↓           ↓
repetir       devolver código
```

La función debe ser asíncrona porque necesita consultar Firestore.

Por eso:

```javascript
const gameCode =
  await generateUniqueGameCode();
```

y no:

```javascript
const gameCode =
  generateUniqueGameCode();
```

Sin `await` se obtendría una Promise en lugar del código.

---

# `sessionStorage.js`

Este servicio administra la sesión mínima almacenada localmente en el dispositivo.

Utiliza:

```text
localStorage
```

Actualmente conserva:

```text
currentGameId
currentPlayerId
```

Las funciones principales son:

```javascript
saveSession()
loadSession()
clearSession()
```

---

## Qué significa la sesión local

Cada navegador necesita recordar qué jugador representa.

Por ejemplo:

```text
Teléfono de Beto
currentPlayerId = player-a1b2c3

Teléfono de Mel
currentPlayerId = player-x9y8z7
```

Ambos dispositivos pueden estar conectados a:

```text
currentGameId = misma partida
```

pero cada uno representa un jugador distinto.

---

## Qué no se guarda en `localStorage`

No se almacena toda la partida.

No se persisten allí:

- jugadores completos;
- manos;
- puntajes;
- compras;
- host;
- resultados.

Estos datos pertenecen a Firestore.

`localStorage` solo permite recordar:

```text
¿qué partida utilizaba este navegador?
¿qué jugador representa este navegador?
```

---

# `src/firebase/`

Esta carpeta contiene la configuración de Firebase.

Actualmente incluye:

```text
firebaseConfig.js
```

Su responsabilidad es:

- configurar la aplicación Firebase;
- inicializar Firebase;
- inicializar Firestore;
- exportar la instancia `db`.

Ejemplo conceptual:

```text
firebaseConfig.js
       ↓
      db
       ↓
gameRepository.js
```

No debería contener reglas del juego.

---

# `src/state/`

Esta carpeta contiene el estado temporal de la aplicación.

Actualmente incluye:

```text
appState.js
```

Su estructura es:

```javascript
export const appState = {
    currentGame: null,
    currentPlayerId: null,
    currentGameId: null,
}
```

---

# `appState.currentGame`

Contiene la representación de la partida cargada actualmente en memoria.

Puede contener información como:

```text
code
mode
hostPlayerId
status
currentHand
dealerIndex
players
hands
```

Esta información es utilizada por la interfaz y por la lógica.

---

# `appState.currentPlayerId`

Identifica al jugador que corresponde al dispositivo actual.

Es fundamental para el funcionamiento multijugador.

Ejemplo:

```text
Dispositivo 1
currentPlayerId
→ Beto

Dispositivo 2
currentPlayerId
→ Mel
```

Gracias a esto, cuando se implemente el registro individual:

```text
cada dispositivo
→ sabrá qué resultado debe permitir registrar
```

---

# `appState.currentGameId`

Contiene el identificador interno de Firestore de la partida actual.

Ejemplo conceptual:

```text
games/abc123FirebaseId
```

Este identificador no es el mismo que:

```text
TELE-4821
```

`TELE-4821` es el código visible para los jugadores.

El identificador de Firestore se utiliza internamente.

---

# Relación entre Firestore, `appState` y `localStorage`

Estas tres piezas tienen responsabilidades diferentes.

## Firestore

Es la fuente persistente y compartida.

Guarda información de la partida que debe existir entre:

- dispositivos;
- recargas;
- sesiones.

---

## `appState`

Es el estado temporal en memoria.

Existe mientras la página se encuentra ejecutándose.

Facilita el acceso a la información desde JavaScript.

---

## `localStorage`

Conserva únicamente la identidad mínima necesaria para recuperar una sesión.

---

## Relación completa

```text
localStorage
    │
    │ currentGameId
    │ currentPlayerId
    ↓
initializeApp()
    ↓
Firestore
    ↓
recuperar partida
jugadores
manos
    ↓
appState
    ↓
interfaz
```

---

# Recuperación de una partida

Cuando el usuario recarga la página:

```text
Página inicia
      ↓
loadSession()
      ↓
¿existe gameId/playerId?
      ↓
sí
      ↓
getGameById()
      ↓
getPlayersFromGame()
      ↓
getHandsFromGame()
      ↓
reconstruir estado
      ↓
appState
      ↓
mostrar pantalla correspondiente
```

La pantalla se selecciona según:

```text
game.status
```

---

# Reconstrucción de compras

Las compras restantes no necesitan depender únicamente de un valor temporal.

Pueden reconstruirse a partir del historial.

Conceptualmente:

```text
compras iniciales
       -
suma de purchasesUsed
       =
compras restantes
```

Esto permite que después de recargar la aplicación se vuelva a calcular correctamente la cantidad disponible.

---

# `src/styles/`

Esta carpeta contiene estilos personalizados.

La regla de diseño actual es:

```text
Bootstrap primero
CSS propio solo cuando sea necesario
```

Esto permite aprovechar:

- grid;
- formularios;
- botones;
- modales;
- tablas;
- badges;
- espaciado;
- responsividad.

El CSS propio se reserva para aspectos que Bootstrap no resuelve directamente.

Ejemplos:

- columna fija de la tabla;
- dimensiones específicas;
- código `TELE-`;
- ajustes concretos para móvil.

---

# `src/components/`

La carpeta `components/` existe para posibles elementos reutilizables.

Actualmente no es una parte central del sistema.

No se debe crear un archivo en esta carpeta únicamente para cumplir una estructura.

Se utilizará cuando exista una necesidad real de reutilización.

Ejemplos futuros posibles:

```text
PlayerBadge
GameCode
LoadingState
ErrorMessage
```

---

# Arquitectura de Firestore

A nivel general, la información persistente utiliza:

```text
games
└── {gameId}
    │
    ├── datos generales
    │
    ├── players
    │   └── {playerId}
    │
    └── hands
        └── hand-N
            └── results
                └── {playerId}
```

El detalle completo se documentará en:

```text
docs/firestore-model.md
```

---

# Documento principal de partida

Cada partida se almacena en:

```text
games/{gameId}
```

Contiene información general como:

```text
code
mode
hostPlayerId
status
currentHand
dealerIndex
createdAt
```

No se almacenan todos los jugadores dentro de un array del documento.

Los jugadores utilizan una subcolección independiente.

---

# Subcolección de jugadores

Los jugadores se almacenan en:

```text
games/{gameId}/players/{playerId}
```

Cada documento contiene principalmente:

```text
name
order
joinedAt
```

El identificador del documento es el mismo `playerId` utilizado por la aplicación.

---

# Subcolección de manos

Las manos se almacenan en:

```text
games/{gameId}/hands/hand-N
```

Ejemplos:

```text
hand-1
hand-2
hand-3
```

Los IDs son determinísticos.

No se utilizan IDs automáticos para las manos.

---

# Razón para utilizar `hand-N`

Anteriormente las manos podían crearse mediante IDs aleatorios de Firestore.

Para el flujo multijugador se decidió utilizar:

```text
hand-1
hand-2
hand-3
```

Esto evita duplicar una mano por situaciones como:

- doble clic;
- reintento;
- recarga;
- retraso de red.

El mismo número de mano siempre apunta al mismo documento.

---

# Estado de una mano

Durante el nuevo flujo multijugador, una mano puede encontrarse inicialmente en:

```text
collecting_results
```

Esto significa:

```text
La mano física terminó,
pero todavía faltan resultados
de uno o más jugadores.
```

Una vez confirmada deberá pasar a:

```text
completed
```

---

# Resultados de una mano

Cada resultado se almacenará en:

```text
games/{gameId}/hands/hand-N/results/{playerId}
```

Esto permite que cada dispositivo escriba únicamente su propio resultado.

Ejemplo:

```text
hand-1
└── results
    ├── player-beto
    ├── player-mel
    └── player-techi
```

---

# Flujo de datos: creación de partida

```text
Usuario
  ↓
showCreateGame()
  ↓
generateUniqueGameCode()
  ↓
createGameInFirestore()
  ↓
games/{gameId}
  ↓
addPlayerToGame()
  ↓
players/{hostPlayerId}
  ↓
saveSession()
  ↓
showLobby()
```

---

# Flujo de datos: unión a partida

```text
Jugador ingresa 4 dígitos
        ↓
TELE-XXXX
        ↓
findGameByCode()
        ↓
Firestore
        ↓
showJoinGame()
        ↓
jugador escribe nombre
        ↓
generatePlayerId()
        ↓
addPlayerToGame()
        ↓
saveSession()
        ↓
showLobby()
```

---

# Flujo de datos: lobby en tiempo real

```text
Dispositivo A
      ↓
cambio en jugadores
      ↓
Firestore
      ↓
subscribeToGamePlayers()
      ↓
Dispositivo B
      ↓
actualiza game.players
      ↓
renderLobby()
```

---

# Flujo de datos: inicio de partida

```text
Host
 ↓
Iniciar partida
 ↓
initializeGame()
 ↓
updateGameState()
 ↓
Firestore
 ↓
subscribeToGame()
 ↓
otros dispositivos
 ↓
detectan status = in_progress
 ↓
showGame()
```

---

# Flujo de datos: cierre de mano

Actualmente:

```text
Host
 ↓
Finalizar mano
 ↓
selecciona endReason
 ↓
createHandInFirestore()
 ↓
Firestore
 ↓
hands/hand-N
 ↓
status = collecting_results
```

Ejemplo:

```text
hands/hand-1

number: 1
dealerIndex: 0
endReason: "player_out"
status: "collecting_results"
```

---

# Flujo multijugador de resultados

Este es el flujo que se está construyendo actualmente.

```text
hand-N
status = collecting_results
        ↓
listener de mano
        ↓
todos los dispositivos
        ↓
identifican currentPlayerId
        ↓
muestran formulario individual
        ↓
jugador registra resultado
        ↓
saveHandResult()
        ↓
results/{playerId}
```

Después:

```text
results/
   ↓
listener de resultados
   ↓
todos los dispositivos
   ↓
mostrar registrados / pendientes
```

Cuando estén todos:

```text
todos registrados
      ↓
host habilitado para confirmar
      ↓
validación de resultados
      ↓
hand.status = completed
      ↓
advanceToNextHand()
      ↓
updateGameState()
      ↓
todos regresan a la tabla
```

---

# Permisos dentro de la arquitectura

La interfaz no debe confiar únicamente en ocultar botones.

Las reglas de permisos también deben existir en la lógica correspondiente.

Ejemplo:

```text
Host
→ puede finalizar mano

Jugador normal
→ no puede finalizar mano
```

La interfaz puede ocultar el botón, pero la lógica también debe validar el permiso cuando sea necesario.

---

# Fuente de verdad del anfitrión

La única fuente de verdad es:

```javascript
game.hostPlayerId
```

No se debe volver a utilizar:

```javascript
game.host
```

ni:

```javascript
player.isHost
```

La relación correcta es:

```javascript
appState.currentPlayerId === game.hostPlayerId
```

---

# Identidad lógica de jugadores

Las relaciones internas siempre deben utilizar:

```javascript
player.id
```

Ejemplos:

```text
result.playerId
hostPlayerId
currentPlayerId
results/{playerId}
```

No debe utilizarse:

```javascript
player.name
```

como identificador interno.

El nombre puede cambiar y además no es una garantía técnica de unicidad.

---

# Modelo de resultados

El modelo lógico de una mano es:

```javascript
{
  number,
  dealerIndex,
  endReason,
  results: [
    {
      playerId,
      completedGameCode,
      points,
      purchasesUsed
    }
  ]
}
```

En Firestore los resultados se distribuyen como documentos separados.

---

# Estado local frente a estado persistente

No toda propiedad utilizada durante ejecución necesariamente tiene que almacenarse directamente como campo en Firestore.

Existen valores que pueden reconstruirse.

Ejemplo:

```text
purchasesRemaining
```

puede calcularse utilizando:

```text
modo
+
resultados anteriores
```

Esto evita mantener información redundante cuando puede obtenerse con seguridad de otras fuentes.

---

# Pruebas automatizadas

El proyecto utiliza:

```text
Vitest
```

principalmente para probar lógica independiente de la interfaz.

Ejemplos:

- validaciones;
- cantidad de jugadores;
- compras;
- resultados;
- orden;
- permisos;
- finalización;
- cálculo de ganadores.

---

# Flujo de desarrollo y pruebas

El flujo utilizado actualmente es:

```text
Implementación
      ↓
Prueba manual
      ↓
Corrección
      ↓
Pruebas automatizadas
      ↓
Commit
```

No se está utilizando TDD estricto.

---

# Integración continua

GitHub Actions ejecuta el pipeline de CI.

El flujo actual ejecuta:

```text
npm ci
npm test -- --run
npm run build
```

sobre cambios importantes en:

```text
develop
main
```

y sus Pull Requests.

Esto permite detectar:

- pruebas fallidas;
- errores de compilación;
- problemas de dependencias.

---

# Despliegue

Netlify está conectado al repositorio GitHub.

La rama utilizada para producción es:

```text
main
```

Por tanto:

```text
feature/*
    ↓
Pull Request
    ↓
develop
    ↓
Pull Request
    ↓
main
    ↓
Netlify
```

---

# Relación entre Git y la arquitectura

Las ramas Git no forman parte de la arquitectura de ejecución de la aplicación, pero sí de la arquitectura de desarrollo.

El proyecto mantiene:

```text
main
→ producción

develop
→ integración

feature/*
→ desarrollo aislado
```

El detalle de este flujo se documentará en:

```text
docs/git-workflow.md
```

---

# Principios arquitectónicos actuales

## 1. Separar presentación de lógica

```text
pages/
→ muestra

utils/
→ decide
```

---

## 2. Separar lógica de persistencia

```text
utils/
→ reglas

services/
→ almacenamiento
```

---

## 3. Firestore es la fuente persistente

La información que debe compartirse entre dispositivos debe existir en Firestore.

---

## 4. `appState` es temporal

`appState` facilita el trabajo de la aplicación durante la ejecución.

No sustituye a Firestore.

---

## 5. `localStorage` solo conserva identidad

No se utilizará como base de datos de la partida.

---

## 6. `player.id` es la identidad interna

```text
player.id
→ lógica

player.name
→ interfaz
```

---

## 7. `hostPlayerId` es la única fuente de verdad del host

No deben mantenerse múltiples indicadores paralelos.

---

## 8. Las manos utilizan identificadores determinísticos

```text
hand-N
```

evita duplicados.

---

## 9. Cada jugador registra su propio resultado

En el flujo multijugador:

```text
un dispositivo
→ un jugador
→ un resultado
```

---

## 10. El host coordina el avance

El host:

- termina físicamente la mano en la aplicación;
- determina la causa;
- confirma cuando todos han registrado;
- permite avanzar.

---

# Áreas que todavía deberán evolucionar

La arquitectura actual es funcional, pero todavía existen puntos pendientes de mejora.

Entre ellos:

- `main.js` contiene muchas responsabilidades;
- `showHandResults()` pertenece al flujo anterior;
- los listeners de manos todavía no existen;
- los listeners de resultados todavía no existen;
- la finalización normal debe persistirse completamente;
- el aborto debe persistirse completamente;
- la creación de una nueva partida debe integrarse con Firestore;
- el manejo de errores puede centralizarse;
- algunos `alert()` deberán reemplazarse;
- pueden existir funciones antiguas que queden redundantes;
- las reglas de seguridad de Firestore deberán revisarse antes de considerar el sistema listo para uso público.

Estas mejoras deben realizarse cuando exista una necesidad funcional concreta.

No se deben crear capas adicionales únicamente por estética.

---

# Regla para decidir dónde agregar código

Antes de implementar algo nuevo se debe identificar qué tipo de responsabilidad representa.

Si es:

```text
HTML o presentación
→ pages/
```

Si es:

```text
regla del juego
→ utils/
```

Si es:

```text
acceso a Firestore
→ services/
```

Si es:

```text
configuración Firebase
→ firebase/
```

Si es:

```text
estado temporal
→ state/
```

Si es:

```text
coordinación entre varias capas
→ main.js
```

---

# Ejemplo de una funcionalidad nueva

Supongamos que se desea implementar:

```text
Mostrar qué jugadores ya registraron
su resultado de la mano.
```

La responsabilidad podría dividirse así:

```text
services/gameRepository.js
→ escuchar results/

main.js
→ recibir los resultados y coordinar

pages/handResults.js
→ mostrar:
   Beto ✓
   Mel ⏳
```

Si se necesita validar:

```text
¿ya registraron todos?
```

esa regla debería pertenecer a una función de lógica, no al HTML.

---

# Documentos relacionados

La documentación completa del proyecto se distribuirá en:

```text
docs/
├── current-status.md
├── requirements.md
├── game-rules.md
├── architecture.md
├── firestore-model.md
├── git-workflow.md
└── ux-flow.md
```

Responsabilidades:

```text
current-status.md
→ estado actual del desarrollo

requirements.md
→ requisitos del sistema

game-rules.md
→ reglas del Telefunken

architecture.md
→ organización técnica de la aplicación

firestore-model.md
→ estructura persistente de Firestore

git-workflow.md
→ forma de trabajo con Git y GitHub

ux-flow.md
→ pantallas y navegación
```

---

# Mantenimiento de este documento

Este archivo debe actualizarse cuando cambie de forma importante:

- la estructura de carpetas;
- la responsabilidad de una capa;
- la estrategia de persistencia;
- el manejo del estado;
- la arquitectura multijugador;
- el flujo de sincronización;
- una decisión técnica fundamental.

Los detalles del avance diario no deben registrarse aquí.

Para eso se utiliza:

```text
docs/current-status.md
```