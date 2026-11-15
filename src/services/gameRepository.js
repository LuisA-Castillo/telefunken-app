/*
  Importar las funciones de Firestore
  necesarias para guardar documentos.

  addDoc():
  Crea un nuevo documento y genera
  automáticamente su identificador.

  collection():
  Permite obtener una referencia a una colección.

  deleteDoc():
  Permite eliminar un documento específico
  existente dentro de Firestore.

  doc():
  Permite construir una referencia a un documento específico.

  getDoc():
  Permite recuperar un documento
  específico utilizando su referencia.

  getDocs():
  Permite obtener todos los documentos
  existentes dentro de una colección.

  limit():
  Permite limitar la cantidad
  de resultados recuperados.

  onSnapshot():
  Permite escuchar una colección en tiempo real.
  Cada vez que se agrega, modifica o elimina
  un documento, Firestore ejecutará nuevamente
  la función que proporcionemos como callback.

  orderBy():
  Permite definir el campo por el cual
  Firestore debe ordenar los documentos.

  query():
  Permite construir una consulta
  personalizada sobre una colección.

  serverTimestamp():
  Permite guardar la fecha y hora
  utilizando el servidor de Firebase,
  en lugar del reloj del dispositivo.

  setDoc():
  Permite crear o reemplazar un documento usando
  un identificador que nosotros definimos.

  updateDoc():
  Permite modificar únicamente campos
  específicos de un documento existente,
  sin reemplazar todo su contenido.

  where():
  Permite establecer una condición
  para filtrar documentos.
*/
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';

//Importar la instancia de Firestore configurada
import { db } from '../firebase/firebaseConfig';

/*
  Función para guardar una nueva partida en Firestore.

  Recibe el objeto game que actualmente
  manejamos dentro de appState.
*/

export async function createGameInFirestore(game) {
    //Obtener una referencia a la colección principal "games"
    const gameCollection = collection(db, 'games');

    //Crear el documento de la partida dentro de la colección
    const gameDocument = await addDoc(gameCollection, {
        //Código visible que los jugadores usarán para unirse
        code: game.code,
        //Modalidad: ordenado o libre
        mode: game.mode,
        //Id del jugador que actualmente es host de la partida
        hostPlayerId: game.hostPlayerId,
        //estado actual: lobby, in_progress, finished, aborted
        status: game.status,
        //Número de mano actual
        currentHand: game.currentHand ?? 0,
        //Posición del repartidor actual
        dealerIndex: game.dealerIndex ?? 0,
        //Fecha de creación registrada
        createsAt: serverTimestamp(), 
    });

    //Devolver el id generado por firebase
    return gameDocument.id;
}

/*
  Función para guardar un jugador dentro de una partida.

  El jugador se almacenará en la subcolección:

  games/{gameId}/players/{playerId}

  Usamos el mismo playerId que ya maneja
  nuestra aplicación para evitar tener
  dos identificadores distintos.
*/
export async function addPlayerToGame(gameId, player, order) {
  //Crear una referencia directa al documento del jugador dentro de la subcolección
  const playerDocument = doc(db, 'games', gameId, 'players', player.id);

  //Crear el documento del jugador
  await setDoc(playerDocument, {
    //Nombre visible del jugador
    name: player.name,
    //Posición del jugador dentro del lobby
    order: order,
    //Fecha en la que el jugador ingresa a la partida
    joinedAt: serverTimestamp(),
  });
}

/*
  Función para obtener todos los jugadores
  asociados a una partida.

  Los jugadores están almacenados en:

  games/{gameId}/players
*/
export async function getPlayersFromGame(gameId) {
  //Crear una referencia a la subcolección players de la partida indicada
  const playersCollection = collection(db, 'games', gameId, 'players');

  //Crear una consulta para recuperar los jugadores respetando el orden definido en el lobby
  const playersQuery = query(playersCollection, orderBy('order'));

  //Consultar todos los documentos
  const snapshot = await getDocs(playersQuery);

  //Convertir los documentos recuperados en objetos que pueda usar la aplicación
  const players = snapshot.docs.map((document) => ({
    //Usar id de documento como id del jugador
    id: document.id,
    //Recuperar el nombre guardado en el documento
    name: document.data().name,
    //Orden en el lobby
    order: document.data().order,
  }));

  return players;
}

/*
  Función para actualizar la posición  
  de un jugador dentro del lobby.

  La posición se almacena en el campo "order"
  del documento del jugador.
*/
export async function updatePlayerOrder(gameId, playerId, order) {
  //Crear una referencia al documento específico del jugador
  const playerDocument = doc(db, 'games', gameId, 'players', playerId);

  //Actualizar únicamente el campo order
  await updateDoc(playerDocument, {
    order: order,
  });
}

/*
  Función para actualizar en Firestore el orden 
  completo de los jugadores de una partida.

  Recibe el arreglo ya ordenado
  exactamente como está en game.players.
*/
export async function updatePlayersOrder(gameId, players) {
  //Recorrer todos los jugadores y actualizar su posición según el índice actual
  for(let index = 0; index < players.length; index ++){
    const player = players[index];

    await updatePlayerOrder(gameId, player.id, index);
  }
}

/*
  Función para eliminar un jugador de una partida.

  El documento eliminado corresponde a:

  games/{gameId}/players/{playerId}
*/
export async function deletePlayerFromGame(gameId, playerId) {
  //Crear una referencia al documento específico del jugador
  const playerDocument = doc(db, 'games', gameId, 'players', playerId);

  //Eliminar el documento
  await deleteDoc(playerDocument);
}

/*
  Función para escuchar en tiempo real los jugadores
  pertenecientes a una partida.

  Cada cambio realizado en la subcolección:

  games/{gameId}/players

  provocará que Firestore nos entregue
  nuevamente la lista actualizada.
*/
export function subscribeToGamePlayers(gameId, onPlayersChanged, onError) {
  //Obtener una referencia a la subcolección players de la partida indicada
  const playersCollection = collection(db, 'games', gameId, 'players');

  //Crear una consulta ordenada utilizando el campo order
  const playersQuery = query(playersCollection, orderBy('order'));

  //Iniciar escucha en tiempo real
  const unsubscribe = onSnapshot(playersQuery, (snapshot) => {
    //Convertir los documentos de firestore nuevamente a formato utilizado por la app
    const players = snapshot.docs.map((document) => ({
      id: document.id,
      name: document.data().name,
      order: document.data().order,
    }));

    //Entregar los jugadores actualizados al código que inició la suscripción
    onPlayersChanged(players);
  },
  (error) => {
    if(onError){
      onError(error);
    }
  });

   /*
    Firestore devuelve una función que permite
    detener la escucha.

    Es importante conservarla para no dejar
    listeners activos cuando el usuario
    abandone el lobby.
  */
  return unsubscribe;
}

/*
  Función para buscar una partida utilizando
  el código visible TELE-XXXX.

  Esta función permitirá que otro dispositivo
  encuentre una partida creada previamente.
*/
export async function findGameByCode(gameCode) {
  //Obtener una referencia a la colección principal
  const gamesCollection = collection(db, 'games');

  //Crear una consulta que busque los documentos que coincidan con el "code" ingresado
  const gameQuery = query(gamesCollection, where('code', '==', gameCode), limit(1));

  //Ejecutar consulta
  const snapshot = await getDocs(gameQuery);

  //Si no existe algún documento, devolver null
  if(snapshot.empty){
    return null;
  }

  //Recuperar el documento encontrado
  const gameDocument = snapshot.docs[0];

  //Devolver el indentificador interno y los datos de la partida
  return {
    id: gameDocument.id,
    ...gameDocument.data(),
  };
}

/*
  Función para recuperar una partida utilizando
  directamente su identificador interno
  de firestore.
*/
export async function getGameById(gameId) {
  //Crear referencia al documento
  const gameDocument = doc(db, 'games', gameId);

  //Recuperar el documento
  const snapshot = await getDoc(gameDocument);

  //Si no existe la partida devolver null
  if(!snapshot.exists()){
    return null;
  }

  //Devolver el objeto partida
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

/*
  Función para escuchar en tiempo real los cambios
  del documento principal de una partida.

  Esto permitirá detectar cambios como:
  - nuevo host;
  - cambio de estado;
  - mano actual;
  - repartidor actual.
*/
export function subscribeToGame(gameId, onGameChanged, onError) {
  //Crear referencia al documento
  const gameDocument = doc(db, 'games', gameId);

  //Iniciar escucha en tiempo real
  const unsubscribe = onSnapshot(gameDocument, (snapshot) => {
    //Si la partida deja de existir devolver null
    if(!snapshot.exists()){
      onGameChanged(null);
      return;
    }

    //Reconstruir los datos principales de la partida
    const gameData = {
      id: snapshot.id,
      ...snapshot.data(),
    };

    //Entregar los datos actualizados
    onGameChanged(gameData);
  }, (error) => {
    if(onError){
      onError(error);
    }
  });

  //Devolver la función que detiene la escucha
  return unsubscribe;
}

/*
  Función para actualizar el jugador que 
  actualmente actúa como host de la partida.
*/
export async function updateGameHost(gameId, hostPlayerId) {
  //Crear referencia al documento
  const gameDocument = doc(db, 'games', gameId);

  //Actualizar el host
  await updateDoc(gameDocument, {
    hostPlayerId: hostPlayerId,
  });
}

/*
  Función para eliminar completamente una partida.

  Esta operación se utilizará cuando
  el último jugador abandone el lobby
  antes de que la partida haya comenzado.
*/
export async function deleteGame(gameId) {
  //Crear referencia al documento
  const gameDocument = doc(db, 'games', gameId);

  //Eliminar documento principal
  await deleteDoc(gameDocument);
}

/*
  Función para comprobar si ya existe una 
  partida utilizando un código específico.
*/
export async function gameCodeExists(gameCode) {
  //Obtener una referencia a la colección principal
  const gamesCollection = collection(db, 'games');

  //Crear una consulta que busque los documentos que coincidan con el "code" ingresado
  const gameQuery = query(gamesCollection, where('code', '==', gameCode), limit(1));

  const snapshot = await getDocs(gameQuery);

  return !snapshot.empty;
}

/*
  Función para crear o actualizar la 
  mano actual dentro de Firestore.

  Utilizamos un identificador determinístico:

  hand-1
  hand-2
  hand-3

  Esto evita crear duplicados si existe
  un doble clic, una recarga o un reintento.
*/
export async function createHandInFirestore(gameId, hand) {
  //Construir el identificador que corresponde a la mano
  const handId = `hand-${hand.number}`;

  //Crear referencia a: games/{gameId}/hands/{handId}
  const handDocument = doc(db, 'games', gameId, 'hands', handId)

  //Guardar la información general de la mano. La mano pasa a estado de espera 
  await setDoc(handDocument, {
    number: hand.number,
    dealerIndex: hand.dealerIndex,
    endReason: hand.endReason,
    //Estado que indica la finalización de la mano pero esta esperando los resultados
    status: 'collecting_results',
    createdAt: serverTimestamp(),
  });

  //Devolver el id generado por firestore
  return handId;
}

/*
  Función para actualizar el estado
  de una mano existente.

  Los estados que utilizaremos son:

  - collecting_results
  - completed
*/
export async function updateHandStatus(gameId, handId, status) {
  //Crear referencia directa al documento de la mano
  const handDocument = doc(db, 'games', gameId, 'hands', handId);

  //Actualizar solo su estado
  await updateDoc(handDocument, {
    status: status,
  });
}

/*
  Función para escuchar en tiempo real
  una mano específica de la partida.

  La mano se encuentra en:

  games/{gameId}/hands/{handId}

  Esta escucha permitirá que todos los
  dispositivos detecten cuando el host
  haya finalizado físicamente la mano.
*/
export function subscribeToHand(gameId, handId, onHandChanged, onError){
  //Crear una referencia a la mano que se quiere escuchar
  const handDocument = doc(db, 'games', gameId, 'hands', handId);

  //Iniciar la escucha en tiempo real 
  const unsubscribe = onSnapshot(handDocument, (snapshot) => {
    //Al iniciar la escucha pueda que la mano aun no exista
    if(!snapshot.exists()){
      //Informar al código que inició la suscripción, que todavía no existe la mano
      onHandChanged(null);
      return;
    }

    //Reconstruir la mano utilizando el formato que necesita la aplicación
    const handData = {
      id: snapshot.id,
      ...snapshot.data(),
    };

    //Entregar los datos actualizados al código que inció la escucha
    onHandChanged(handData);
  },
    //Manejar posibles errores
    (error) => {
      if(onError){
        onError(error);
      }
    }
  );

  //Devolver la función creada por Firestore para después poder detener el listener
  return unsubscribe;
}

/*
  Función para guardar el resultado individual
  de un jugador dentro de una mano.

  Se almacenará en:

  games/{gameId}/hands/{handId}/results/{playerId}
*/
export async function saveHandResult(gameId, handId, result) {
  //Obtener referencia al documento del resultado del jugador
  const resultDocument = doc(db, 'games', gameId, 'hands', handId, 'results',result.playerId);

  //Comprobar si este jugador ya registró un resultado para esta mano
  const existingResult = await getDoc(resultDocument);

  //Si ya existe, no permitir que guarde otra vez y sobreescriba
  if(existingResult.exists()){
    throw new Error('RESULT_ALREADY_EXISTS');
  }

  //Si aún no existe, guardar el resultado usando player Id
  await setDoc(resultDocument, {
    //Código del juego completado
    completedGameCode: result.completedGameCode,
    //Puntaje registrado al finalizar la mano
    points: result.points,
    //Compras utilizadas
    purchasesUsed: result.purchasesUsed,
    //Fecha del registro
    createdAt: serverTimestamp(),
  });
}

/*
  Función que permite al anfitrión corregir
  un resultado ya registrado.

  Solo modifica:
  - puntos;
  - compras utilizadas.

  No crea un nuevo resultado.
*/
export async function updateHandResult(gameId, handId, playerId, completedGameCode, points, purchasesUsed) {
  //Referencia al resultado específico del jugador 
  const resultDocument = doc(db, 'games', gameId, 'hands', handId, 'results', playerId);

  //Actualizar únicamente los valores corregibles
  await updateDoc(resultDocument, {
    completedGameCode: completedGameCode,
    points: points,
    purchasesUsed: purchasesUsed,
  });
}

/*
  Función para guardar todos los resultados
  correspondientes a una mano.

  Esta función reutiliza saveHandResult()
  para cada jugador.
*/
export async function saveHandResultsToFirebase(gameId, handId, results) {
  //Recorrer los resultados uno por uno
  for(const result of results){
    await saveHandResult(gameId, handId, result);
  }
}

/*
  Función para actualizar los datos 
  generales de una partida en Firestore.

  Esta función permitirá mantener
  sincronizados datos como:

  - status
  - currentHand
  - dealerIndex
*/
export async function updateGameState(gameId, game) {
  //Crear referencia al documento
  const gameDocument = doc(db, 'games', gameId);

  //Actualizar los campos relacionados con el estado de la partida
  await updateDoc(gameDocument, {
    status: game.status,
    currentHand: game.currentHand,
    dealerIndex: game.dealerIndex,
  });
}

/*
  Función para recuperar todos los resultados
  pertenecientes a una mano.

  Los resultados se encuentran en:

  games/{gameId}/hands/{handId}/results
*/
export async function getHandResults(gameId, handId) {
  //Obtener referencia a la subcolección de resultados de la mano
  const resultsCollection = collection(db, 'games', gameId, 'hands', handId, 'results');

  //Recuperar todos los resultados
  const snapshot = await getDocs(resultsCollection);

  //Devolver el formato usado por la app
  return snapshot.docs.map((document) => ({
    playerId: document.id,
    completedGameCode: document.data().completedGameCode,
    points: document.data().points,
    purchasesUsed: document.data().purchasesUsed,
  }));
}

/*
  Función para escuchar en tiempo real
  los resultados de una mano.

  Cada vez que un jugador registre
  su resultado, todos los dispositivos
  recibirán nuevamente la lista completa.
*/
export function subscribeToHandResults(gameId, handId, onResultsChanged, onError) {
  //Obtener referencia a: games/{gameId}/hands/{handId}/results
  const resultsCollection = collection(db, 'games', gameId, 'hands', handId, 'results');

  //Escuchar los cambios de la subcolección
  const unsubscribe = onSnapshot(resultsCollection, (snapShot) => {
    //Convertir los documentos de firebase al formato usado por la aplicación
    const results = snapShot.docs.map((document) => ({
      playerId: document.id,
      completedGameCode: document.data().completedGameCode,
      points: document.data().points,
      purchasesUsed: document.data().purchasesUsed,
    }));

    //Entregar la lista actualizada
    onResultsChanged(results);
  },
    (error) => {
      if(onError){
        onError(error);
      }
    }
  );

  //Firestore devuelve la función utilizada para cancelar la escucha
  return unsubscribe;
}

/*
  Función para recuperar todas las manos guardadas
  de una partida respetando su número.
*/
export async function getHandsFromGame(gameId) {
  //Obtener referencia a la colección de las manos del juego
  const handsCollection = collection(db, 'games', gameId, 'hands');

  //Las manos se recuperan en orden cronológico
  const handsQuery = query(handsCollection, orderBy('number'));

  const snapshot = await getDocs(handsQuery);

  const hands = [];

  //Por cada mano se recupera sus resultados
  for(const document of snapshot.docs){
    const handData = document.data();

    //Solo las manos completamente cerradas forman parte del historial de puntuación
    if(handData.status !== 'completed'){
      continue;
    }

    const results = await getHandResults(gameId, document.id);

    //Reconstruir la estructura de la lógica local
    hands.push({
      number: handData.number,
      dealerIndex: handData.dealerIndex,
      endReason: handData.endReason,
      results: results
    });
  }
  
  return hands;
}

/*
  Vincula una partida finalizada con la
  siguiente partida creada por el host.
*/
export async function updateNextGameId(gameId, nextGameId) {
  const gameDocument = doc(db, 'games', gameId);

  await updateDoc(gameDocument, {
    nextGameId: nextGameId,
  });
}