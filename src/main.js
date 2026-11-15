// Importar Bootstrap desde node_modules.
import 'bootstrap/dist/css/bootstrap.min.css';

// Importar JavaScript de Bootstrap.
import { Modal } from 'bootstrap';

// Importar estilos personalizados.
import './styles/main.css';

//Importar estado global temporal de la aplicación
import { appState } from './state/appState';

//Importar funión de generador de código de partida
import { generateGameCode } from './utils/gameCode';

//Importar funciones de regla para gestionar jugadores
import { GAME_STATUS, getInitialPurchases, getOrderedGame, movePlayer, removePlayer } from './utils/gameRules';

//Importar funciones para la inicialización del juego
import { initializeGame } from './utils/gameSetup';

//Importar funiones para manejar los resultados de la mano
import { advanceToNextHand, createPlayerResult, getGameWinners, isGameFinished, rebuildRemainingPurchases, saveHandResults, validateHandResults, validatePlayerResult } from './utils/handResults';

//Importar la generación de Ids
import { generatePlayerId } from './utils/playerId';

//Importar la creación de una nueva partida
import { createNextGame } from './utils/newGameFlow';

//Importar validación de juegos pendientes
import { getPendingGames } from './utils/gameTable';

//Importar las funciones de finalización de una partida
import { abortGame, finishGame } from './utils/gameLifecycle';

//Importar las funciones para validar si un jugador puede salir de un juego
import { canManageLobby, canJoinGame } from './utils/lobbyPermissions';

//Importar las funciones para salir de un juego
import { leaveLobby } from './utils/lobbyActions';

//Importar las funciones para gestionar una partida en firestore
import { addPlayerToGame, createGameInFirestore, createHandInFirestore, deleteGame, deletePlayerFromGame, findGameByCode, getGameById, getHandResults, getHandsFromGame, getPlayersFromGame, subscribeToGame, subscribeToGamePlayers, saveHandResult, subscribeToHandResults, subscribeToHand, updateGameHost, updateGameState, updateHandResult, updateHandStatus, updateNextGameId, updatePlayersOrder } from './services/gameRepository';

//Importar las funciones para manejar la sesión local
import { clearSession, loadSession, saveSession } from './services/sessionStorage';

//Importar la generación de un código único
import { generateUniqueGameCode } from './services/gameCodeService';

//Pantallas de la aplicación.
import { renderHome } from './pages/home';
import { renderCreateGame } from './pages/createGame';
import { renderLobby } from './pages/lobby';
import { renderGame } from './pages/game';
import { renderHandResults } from './pages/handResults';
import { renderFinalResults } from './pages/finalResults';
import { renderAbortedGame } from './pages/abortedGame';
import { renderJoinGame } from './pages/joinGame';
import { doc } from 'firebase/firestore';

/*
  Buscar en index.html el elemento cuyo id es "app".
  Este elemento será el contenedor principal de nuestra aplicación.
*/
const app = document.querySelector('#app');

/*
  Mantener una referencia al listener
  de jugadores actualmente activo.

  Esto permite evitar crear múltiples
  listeners para la misma partida.
*/
let unsubscribePlayersListener = null;

//Guardar el id de la partida cuyo lobby estamos escuchando actualmente
let listeningGameId = null;

/*
  Mantener una referencia al listener
  del juego actualmente activo.
*/
let unsubscribeGameListener = null;
let listeningGameDocumentId = null;

//Para mantener una referencia al listener de la mano actualmente activa
let unsubscribeHandListener = null;

//Para guardar qué mano estamos escuchando
let listeningHandId = null;

//Mantener la referencia al listener de resultados de la mano actual
let unsubscribeResultsListener = null

//Guardar la mano cuyos resultados estamos escuchando
let listeningResultsHandId = null;

//Escucha para esperar nuevo juego
let unsubscribeNextGameListener = null;

function stopNextGameListener() {
  if(unsubscribeNextGameListener){
    unsubscribeNextGameListener();
    unsubscribeNextGameListener = null;
  }
}

/*
  Función para detener la escucha en tiempo 
  real de los jugadores del lobby.

  Esta función se utilizará cuando:
  - abandonemos el lobby;
  - iniciemos la partida;
  - cambiemos a otra partida.
*/
function stopPlayersListener() {
  //Comprobar si existe actualmente una suscripción activa
  if(unsubscribePlayersListener) {
    //Ejecutar la función de firestore para detener onSnapshot()
    unsubscribePlayersListener();
    
    //Limpiar las referencias locales
    unsubscribePlayersListener = null;
    listeningGameId = null;
  }
}

/*
  Funcion para detener la escucha en tiempo real
  del documento principal de la partida.
*/
function stopGameListener() {
  if(unsubscribeGameListener){
    unsubscribeGameListener();

    unsubscribeGameListener = null;
    listeningGameDocumentId = null;
  }
}

/*
  Función para detener la escucha en tiempo real
  de la mano actualmente activa.

  Será importante cuando:

  - avancemos a otra mano;
  - termine la partida;
  - abandonemos la sesión;
  - cambiemos de partida.
*/
function stopHandListener() {
  //Comprobar si existe un listener activo
  if(unsubscribeHandListener){
    //Ejecutar la función que Firestore devuelve para detener OnSnapshot()
    unsubscribeHandListener();

    //Limpiar referencias locales
    unsubscribeHandListener = null;
    listeningHandId = null;
  }
}

/*
  Función para detener la escucha
  en tiempo real de los resultados.
*/
function stopResultsListener() {
  //Si existe una suscripción, detenerla
  if(unsubscribeResultsListener){
    unsubscribeResultsListener();

    //Limpiar referencias locales
    unsubscribeResultsListener = null;
    listeningResultsHandId = null;
  }
}

/*
  Función para mostrar la pantalla de Inicio.
*/
function showHome() {
  
  //Insertar el HTML generado por renderHome().
  app.innerHTML = renderHome();

  // Obtener referencia al botón "Unirme".
  const btnUnirse = document.querySelector('#btnUnirse');

  // Obtener referencia al campo donde se escribe el código.
  const codigoPartida = document.querySelector('#codigoPartida');

  //Evento para evitar que se ingrese caracteres no numéricos
  codigoPartida.addEventListener('input', () => {
      codigoPartida.value = codigoPartida.value.replace(/\D/g, '').slice(0, 4);
    }
  );

  // Evento para redirigir a la pantalla de creación de una partida.
  const btnCrearPartida = document.querySelector('#btnCrearPartida');

  btnCrearPartida.addEventListener('click', () => {

    // Al pulsar Crear partida, mostramos la pantalla correspondiente.
    showCreateGame();

  });


  //Escuchar evento click del botón Unirme.
  btnUnirse.addEventListener('click', async () => {

    //Obtener únicamente los digitos ingresados
    const digits = codigoPartida.value.trim();

    //Validar que sean exactamente 4 números
    if(!/^\d{4}$/.test(digits)){
      alert('Ingresa los 4 dígitos del código de partida.');

      return;
    }
    
    //Obtener el texto escrito por el usuario.
    const codigo = `TELE-${digits}`;

    //Validar que se haya ingresado un código.
    if(codigo === ''){
      alert('Ingresa el código de la partida');
      return;
    }

    try {
      //Buscar la partida en firestore
      const foundGame = await findGameByCode(codigo);

      //Si no existe, informar al usuario
      if(!foundGame){
        alert('No existe una partida con ese código');
        return;
      }

      //Solo se puede ingresar a una partida mientras esté en estado LOBBY
      if(foundGame.status !== GAME_STATUS.LOBBY){
        alert('Esta partida ya comenzó y no acepta nuevos jugadores.');
        return;
      }

      //Recuperar los jugadores de la partida
      //Los jugadores están almacenados en la subcolección: games/{gameId}/players
      const players = await getPlayersFromGame(foundGame.id);

      //Agregar temporalemnte los jugadores al objeto recuperado
      foundGame.players = players;

      //Mostrar pantalla en la que el jugador ingresa su nombre
      showJoinGame(foundGame);
    } catch (error) {
      //Informar al jugador de manera técnica sobre el error
      console.error('Error al buscar partida', error);

      //Mensaje para el usuario
      alert('No fue posible buscar la partida');
    }
  });
}

/*
  Función para mostrar la pantalla Crear partida.
*/
function showCreateGame() {
  //Insertar el HTML generado por renderCreateGame().
  app.innerHTML = renderCreateGame();

  //Obtener los elementos para la interacción
  const nombreAnfitrion = document.querySelector('#nombreAnfitrion');
  const mensajeError = document.querySelector('#mensajeError'); 

  //Evento para Crear partida.
  const btnCrear = document.querySelector('#btnCrear');

  btnCrear.addEventListener('click', async () => {
    //Obtener el nombre del anfitrión desde el input y le quitamos todos los espacios al inicio y al final
    const nombre = nombreAnfitrion.value.trim();

    //Buscar el radio que está seleccionado. :checked significa: "dame únicamente el input que esté marcado".
    const modalidadSeleccionada = document.querySelector('input[name=modalidad]:checked')

    //Primera validación: el nombre no puede estar vacío
    if(nombre == '') {
      mostrarError(mensajeError, 'Ingresa tu nombre para continuar');
      return;
    }

    //Segunda validación: debe seleccionar una modalidad
    if(!modalidadSeleccionada) {
      mostrarError(mensajeError, 'Selecciona una modalidad de juego');
      return;
    }

    //Si ambos datos son válidos debemos ocultar los mensajes que se hayan quedado de interacciones anteriores
    ocultarError(mensajeError);

    //Almacenar la modalidad para redireccionar a la vista correspondiente
    const modalidad = modalidadSeleccionada.value;

    //Generar una sola vez el id del anfitrión 
    const hostPlayerId = generatePlayerId();

    //Generar un código único
    const gameCode = await generateUniqueGameCode();
    /*
      Crear el objeto que representa
      la nueva partida.
    */
    appState.currentGame = {
      //codigo identificador
      code: gameCode,
      //modalidad seleccionada
      mode: modalidad,
      //nombre del anfitrión
      hostPlayerId: hostPlayerId,
      //estado de la partida
      status: GAME_STATUS.LOBBY,
      //el host es el primer jugador de  la partida
      players: [
        {
          id: hostPlayerId,
          name: nombre,
        },
      ],
    };

    //Intentar guardar la nueva partida dentro de firebase
    try{
      //Deshabilitar temporalmente el botón para evitar crear varias partidas mientras Firebase está procesando la solicitud.
      btnCrear.disabled = true;
      btnCrear.textContent = 'Creando partida...';

      //Enviar la partida al repositorio
      const gameId = await createGameInFirestore(appState.currentGame);

      //Guardar el identificador interno de Firestore dentro del estado temporal de la aplicación.
      appState.currentGameId = gameId;
      appState.currentPlayerId = hostPlayerId;

      //Guarda la identidad del anfitrión en este dispositivo
      saveSession(gameId, hostPlayerId);

      //Obtener a jugador anfitrión
      const hostPlayer = appState.currentGame.players.find((player) => player.id === hostPlayerId);

      //Guardar al anfitrión dentro de la subcolección players.
      await addPlayerToGame(gameId, hostPlayer, 0);

      //Redirigir al lobby una vez que se ha guardado la partida y el anfitrión
      showLobby();
    } catch(error) {
      //Si ocurrió un error, volver a habilitar el botón para permitir otro intento.
      btnCrear.disabled = false;
      btnCrear.textContent = 'Crear partida';

      //Si ocurre un error mostrarlo en consola para poder solventarlo
      console.error('Error al crear partida', error);

      //Informar al usuario que no fue posible crear la partida
      mostrarError(mensajeError, 'No se pudo crear la partida. Intenta nuevamente.');
    }
  });

  //Evento para regresar a Inicio.
  const btnVolverInicio = document.querySelector('#btnVolverInicio');
  
  btnVolverInicio.addEventListener('click', () => {

    showHome();

  });
}

/*
  Función que muestra el lobby 
  esperando que se unan los jugadores.
*/
function showLobby() {
  //Obtener la partida guardada en nuestro estado local
  const game = appState.currentGame;

  //Si no existe una partida activa, regresar al Home
  if (!game) {
    showHome();
    return;
  }

  //Iniciar la escucha de jugadores solamente si todavía no existe listener para la partida
  if(appState.currentGameId && listeningGameId !== appState.currentGameId) {
    //Detener cauqluier listener de una partida anterior
    stopPlayersListener();

    //Registrar la partida que se va a escuchar
    listeningGameId = appState.currentGameId;

    //Escuchar los juegos en tiempo real
    unsubscribePlayersListener = subscribeToGamePlayers(appState.currentGameId, (players) => {
      //Comprobar si el jugador asociado a este dispositivo continúa perteneciendo a la partida
      const currentPlayerExists = players.some((player) => player.id === appState.currentPlayerId);

      //Si el jugador ya no existe se debe cerrar su sesión y sacarlo del lobby
      if(!currentPlayerExists){
        //Detener la escucha del lobby
        stopPlayersListener();

        //Eliminar la sesión
        clearSession();

        //Limpiar el estado actual
        appState.currentGame = null;
        appState.currentGameId = null;
        appState.currentPlayerId = null;

        //Regresar al inicio
        showHome();

        return;
      }
      
      //Si el jugador todavía existe, actualizar el arreglo local
      game.players = players.map((player) => {
        const existingPlayer = game.players.find((currentPlayer) => currentPlayer.id === player.id);

        return{
          ...existingPlayer,
          ...player,
        };
      });

      //Renderizar el lobby
      showLobby();
    }, (error) => {
      console.error('Error al sincronizar jugadores: ', error);
    });
  }

  //Escuchar cambios generales de la partida únicamente si todavía existe un listener activo para esta misma partida
  if(appState.currentGameId && listeningGameDocumentId !== appState.currentGameId){
    stopGameListener();

    listeningGameDocumentId = appState.currentGameId;

    //Escuchar cambios del documento principal de la partida
    unsubscribeGameListener = subscribeToGame(appState.currentGameId, async (updateGame) => {
      //Si la partida fue eliminada de firestore, limpia sesión y vuelve al inicio
      if(!updateGame) {
        //Detener listeners activos
        stopGameListener();
        stopPlayersListener();
        
        //Eliminar la sesión almacenada
        clearSession();

        //Limpiar el estado temporal
        appState.currentGame = null;
        appState.currentGameId = null;
        appState.currentPlayerId = null;

        //Regresar al inicio
        showHome();
        return;
      }

      //Guardar estado anterior antes de actualizar
      const previousStatus = game.status;

      //Actualizar únicamente los datos generales de la partida
      game.code = updateGame.code;
      game.mode = updateGame.mode;
      game.hostPlayerId = updateGame.hostPlayerId;
      game.status = updateGame.status;
      game.currentHand = updateGame.currentHand;
      game.dealerIndex = updateGame.dealerIndex;

      /*
        ------------------------------------------------
        PARTIDA ABORTADA
        ------------------------------------------------

        Si cualquier dispositivo detecta que
        Firestore cambió el estado a ABORTED,
        debe salir automáticamente de la mesa.
      */
      if(game.status === GAME_STATUS.ABORTED){
        //Ya no se necesita escuchar cambios de la partida activa
        stopPlayersListener();
        //Detener el listener de la mano
        stopHandListener();
        //Detener el listener principal porque la partida terminó
        stopGameListener();
        //Mostrar la pantalla de partida finalizada
        showAbortedGame();
        return; 
      }

      /*
        ------------------------------------------------
        NUEVA PARTIDA CREADA POR EL HOST
        ------------------------------------------------

        Si esta partida ya terminó y el host creó
        otra, todos los dispositivos deben saltar
        automáticamente al nuevo lobby.
      */
      if(updateGame.status === GAME_STATUS.FINISHED && updateGame.nextGameId){

        const nextGameId = updateGame.nextGameId;

        //Detener listeners de la partida anterior
        stopPlayersListener();
        stopHandListener();
        stopResultsListener();
        stopGameListener();

        try {
          //Recuperar la nueva partida
          const nextGame = await getGameById(nextGameId);

          if(!nextGame){
            console.error('No se encontró la nueva partida.');
            return;
          }

          //Recuperar los jugadores
          const nextPlayers = await getPlayersFromGame(nextGameId);

          nextGame.players = nextPlayers;

          nextGame.hands = [];

          //Cambiar este dispositivo a la nueva partida
          appState.currentGame = nextGame;

          appState.currentGameId = nextGameId;

          saveSession(nextGameId, appState.currentPlayerId);

          //Entrar al nuevo lobby
          showLobby();
        } catch(error){
          console.error('Error al cambiar a la nueva partida: ', error);
        }

        return;
      }

      /*
        ------------------------------------------------
        PARTIDA FINALIZADA NORMALMENTE
        ------------------------------------------------

        Dejamos preparado también este caso porque
        más adelante, cuando alguien gane, todos los
        dispositivos deben recibir el cambio.
      */
      if(game.status === GAME_STATUS.FINISHED){
        //Ya no se necesita escuchar cambios de la partida activa
        stopPlayersListener();
        //Comprobar si este dispositivo ya tiene cargada la última mano.

        const finalHandLoaded = game.hands.some((hand) => hand.number === game.currentHand);

        if(finalHandLoaded){
          //Detener el listener de la mano
          stopHandListener();
          //Detener el listener principal porque la partida terminó
          stopGameListener();
          //Mostrar la pantalla de resultados
          showFinalResults();
        }
        
        return;
      } 
      
      /*
        ------------------------------------------------
        LOBBY → PARTIDA
        ------------------------------------------------
      */
      //Si la partida acaba de pasar de lobby a in_progress, este dispositivo debe entrar a la mesa
      if(previousStatus === GAME_STATUS.LOBBY && game.status === GAME_STATUS.IN_PROGRESS){
        //Ya no se necesita escuchar cambios de lobby
        stopPlayersListener();

        //Inicializardatos locales
        initializeGame(game);

        //Mostrar mesa automáticamente
        showGame();

        return;
      }

      //Si continua siendo lobby
      if(game.status === GAME_STATUS.LOBBY){
        showLobby();
        return;
      }
    }, (error) => {
      console.error('Error al sincronizar la partida: ', error);
    });
  }

  //Comprobamos si el jugador puede administrar el lobby
  const playerCanManageLobby = canManageLobby(game, appState.currentPlayerId);

  //Renderizar el lobby usando los datos de la partida
  app.innerHTML = renderLobby(game, playerCanManageLobby);
  
  //Se añade eventos a cada botón de subir
  const botonesSubir = document.querySelectorAll('.btn-subir');
  
  botonesSubir.forEach((button) => {
    button.addEventListener('click', async () => {
      /*
        dataset.index obtiene el valor
        almacenado en data-index.

        Ese valor llega como String,
        por eso usamos Number().
      */
      const currentIndex = Number(button.dataset.index);

      //Subir significa mover una posición hacia atrás en el arreglo.
      const newIndex = currentIndex - 1;

      //Modificamos el orden
      movePlayer(game.players, currentIndex, newIndex);

      try {
        //Guardar en firestore el nuevo orden del lobby. Recarga el lobby.
        await updatePlayersOrder(appState.currentGameId, game.players);
      } catch (error) {
        console.error('Error al actualizar el orden: ', error);
      }
    });
  });

  //Se añade eventos a cada botón de bajar
  const botonesBajar = document.querySelectorAll('.btn-bajar');

  botonesBajar.forEach((button) => {
    button.addEventListener('click', async () => {
      const currentIndex = Number(button.dataset.index);

      //Bajar significa avanzar una posición en el arreglo.
      const newIndex = currentIndex + 1;

      movePlayer(game.players, currentIndex, newIndex);

      try {
        //Guardar en firestore el nuevo orden del lobby. Recarga el lobby.
        await updatePlayersOrder(appState.currentGameId, game.players);
      } catch (error) {
        console.error('Error al actualizar el orden: ', error);
      }
    });
  });

  //Se añade eventos a cada botón de eliminar
  const botonesEliminar = document.querySelectorAll('.btn-eliminar');

  botonesEliminar.forEach((button) => {
    button.addEventListener('click', async () => {
      //Obtenemos la posición del jugador
      const index = Number(button.dataset.index);

      //Guardar una copia del arreglo actual
      const previousPlayers = [...game.players];

      //Guardar el jugador que ocupa la posición seleccionada
      const playerToRemove = game.players[index];

      //Intentamos eliminarlo
      const removed = removePlayer(game.players, index, game.hostPlayerId);

      //Si no lo pudo eliminar no hacemos nada
      if(!removed){
        return;
      }

      try {
        //Eliminar al jugador de firestore
        await deletePlayerFromGame(appState.currentGameId, playerToRemove.id);

        //Al emiminar al jugador se deben cambiar las posiciones de los que estaban después. Recarga el lobby
        await updatePlayersOrder(appState.currentGameId, game.players);
      } catch (error) {
        //Si firebase falla, restaura el arreglo local anterior
        game.players = previousPlayers;

        console.error('Error al eliminar jugador', error);

        //Volvemos a renderizar el lobby
        showLobby();
      }
    });
  });

  //Obtener el botón Iniciar partida
  const btnIniciarPartida = document.querySelector('#btnIniciarPartida');

  if(btnIniciarPartida){
    //Evento para comprobar que el botón haga algo cuando esté habilitado
    btnIniciarPartida.addEventListener('click', async () => {
      //La unión al lobby queda cerrado cuando comienza la partida.
      stopPlayersListener();

      //Inicializar la partida localmente
      initializeGame(game);

      try {
        //Guardar en firestore el nuevo estado de la partida
        await updateGameState(appState.currentGameId, game);

        //Mostrar la mesa despúes de persistir el estado
        showGame();
      } catch (error) {
        console.error('Error al iniciar la partida: ', error);
      }
    });
  }

  //Evento que permite salir del juego a un jugador mientras está en el lobby.
  const btnSalirLobby = document.querySelector('#btnSalirLobby');

  if(btnSalirLobby){
    btnSalirLobby.addEventListener('click', async () => {
      //Guardar los identificadores antes de modificar o limpiar
      const leavingPlayerId = appState.currentPlayerId;
      const gameId = appState.currentGameId;
      
      //Salida local
      const left = leaveLobby(game, appState.currentPlayerId);

      if(!left){
        return;
      }

      //El dispositivo está abandonando voluntariamente la partida
      stopPlayersListener();
      stopGameListener();

      try {
        //Eliminar de firestore
        await deletePlayerFromGame(gameId, leavingPlayerId);

        //Si ya no hay jugadores en la partida deja de existir la partida
        if(game.players.length === 0){
          //Eliminar el documento 
          await deleteGame(gameId);
          
          //Limpiar sesión
          clearSession();

          //Limpiar el estado local
          appState.currentGame = null;
          appState.currentGameId = null;
          appState.currentPlayerId = null;

          showHome();
          return;
        }

        //Si aún hay jugadores apuntar al nuevo anfitrión
        await updateGameHost(gameId, game.hostPlayerId);

        //Actualizar el orden
        await updatePlayersOrder(gameId, game.players);

        //Limpiar sesión
        clearSession();

        //Limpiar el estado local
        appState.currentGame = null;
        appState.currentGameId = null;
        appState.currentPlayerId = null;

        showHome();
      } catch (error) {
        console.error('Error al salir del lobby: ', error);
      }
    });
  }
}

function startNextGameListener() {
  if(!appState.currentGameId || unsubscribeNextGameListener){
    return;
  }

  unsubscribeNextGameListener = subscribeToGame(appState.currentGameId, async (updateGame) => {
        //Mientras el host no haya creado una nueva partida, no hacemos nada
        if(!updateGame || !updateGame.nextGameId){
          return;
        }

        const nextGameId = updateGame.nextGameId;

        //Ya detectamos la nueva partida.
        stopNextGameListener();

        try {
          const nextGame = await getGameById(nextGameId);

          const nextPlayers = await getPlayersFromGame(nextGameId);

          nextGame.players = nextPlayers;

          nextGame.hands = [];

          appState.currentGame = nextGame;

          appState.currentGameId = nextGameId;

          //El playerId permanece igual, porque createNextGame conserva los mismos jugadores
          saveSession(nextGameId, appState.currentPlayerId);

          showLobby();
        } catch(error){
          console.error('Error al ingresar a la nueva partida: ', error);
        }
      },
      (error) => {
        console.error('Error al esperar nueva partida: ', error);
      }
    );
}

/*
  Función que inicia la escucha en tiempo real
  de la mano actual de la partida.
*/
function startCurrentHandListener() {
  //Recuperar al partida actual
  const game = appState.currentGame;

  //Si no existe una partida o no tenemos su identificador interno, no se crea el listener
  if(!game || !appState.currentGameId){
    return;
  }

  //Construir el identificador determinístico correspondiente a la mano actual
  const handId = `hand-${game.currentHand}`;

  //Si ya se escucha la mano, no se crea otro listener
  if(listeningHandId === handId && unsubscribeHandListener){
    return;
  }

  //Si existe un listener de otra mano, se debe detener antes de crear el otro
  stopHandListener();

  //Registrar la mano q se va a escuchar
  listeningHandId = handId;

  //Crear el listener de Firestore
  unsubscribeHandListener = subscribeToHand(appState.currentGameId, handId, async (hand) => {
    //Al inicio puede ser que la mano no exista 
    if(!hand){
      return;
    }

    //TEMPORAL: Ahora solo se quiere comprobar q TODOS los telefonos estan recibiendo correctamente el cierre de la mano
    console.log('Mano recibida en tiempo real: ', hand);

    //Detectar el estado creado por el host al finalizar la mano
    if(hand.status === 'collecting_results'){
      //TEMPORAL: Mostrar en consola para pruebas 
      console.log(`La ${hand.id} está esperando resultados.`);

      //Comenzar a escuchar los resultados de esta mano
      startResultsListener(hand);

      try {
        //Recuperar los resultados que ya existen en firestore
        const results = await getHandResults(appState.currentGameId, hand.id);

        //Buscar si este dispositivo ya registró un resultado
        const currentPlayerResult = results.find((result) => 
          result.playerId === appState.currentPlayerId
        );

        //Recuperar al jugador de este dispositivo
        const currentPlayer = game.players.find((player) => 
          player.id === appState.currentPlayerId
        );

        //Si no se encuentra al jugador, no continuar
        if(!currentPlayer){
          console.error('No se encontró al jugador actual.');
          return;
        }

        //Si el resultado existe, no volver a presentar el formulario de resultados
        if(currentPlayerResult){
          showResultsStatus(hand, results);
          return;
        }

        //Si todavía no existe resultado, mostrar el formulario de resultados
        showHandResults(hand);
      } catch (error) {
        console.error('Error al comprobar el resultado del jugador: ', error);
      }
      
      return;
    }

    //Si el host ya confirmó todos los resultados
    if(hand.status === 'completed'){
      //Ya no escuchamos resultados
      stopResultsListener();

      //Detener listener de la mesa
      stopHandListener();

      try {
        //Recuperar el documento principal actualizado
        const updateGame = await getGameById(appState.currentGameId);

        //Recuperar las manos ya completadas
        const completedHands = await getHandsFromGame(appState.currentGameId);

        //Actualizar solo los datos generales
        game.status = updateGame.status;
        game.currentHand = updateGame.currentHand;
        game.dealerIndex = updateGame.dealerIndex;
        game.hands = completedHands;

        //Reconstruir las compras restantes a partir del historial
        rebuildRemainingPurchases(game);

        //Si esta era la última mano y la partida ya fue marcada como finalizada, ahora sí tenemos todo el historial sincronizado.
        if(game.status === GAME_STATUS.FINISHED){

          stopResultsListener();
          stopHandListener();
          stopGameListener();

          showFinalResults();
          return;
        }

        //Mostrar la mesa actualizada
        showGame();
      } catch (error) {
        console.error('Error al cargar la siguiente mano: ', error);
      }
      
      return;
    }
  }, 
    //Manejar errores en la escucha
    (error) => {
      console.error('Error al sincronizar la mano: ', error);  
    }
  );
}

/*
  Función que muestra la pantalla 
  principal de la partida, la tabla de anotaciones.
*/
function showGame(readOnly = false) {
  //Recuperamos la partida actual
  const game = appState.currentGame;

  //Si no existe partida regresamos al inicio
  if(!game) {
    showHome(); 
    return;
  }

  //Comprobar si este dispositivo pertenece al anfitrión
  const currentplayerIsHost = appState.currentPlayerId === game.hostPlayerId;

  //El jugador solo tiene privilegios de host en la partida q es editable
  const playerIsHost = currentplayerIsHost && !readOnly;

  //Rederizamos la mesa indicando que estamos consultando una partida que ya no se puede modificar
  app.innerHTML = renderGame(game, playerIsHost, readOnly);

  /*
    ------------------------------------------------
    MODO SOLO LECTURA
    ------------------------------------------------

    Si estamos consultando una partida que ya
    terminó, solamente necesitamos permitir
    regresar a la pantalla correspondiente.

    No queremos conectar los eventos normales
    de una partida activa.
  */
  if(readOnly){
    //Funcionalidad del botón Volver a partida finalizada
    const btnVolverPartidaFinalizada = document.querySelector('#btnVolverPartidaFinalizada');

    if(btnVolverPartidaFinalizada){
      btnVolverPartidaFinalizada.addEventListener('click', () => {
        //Si la partida fue interrumpida, se regresa a la pantalla de partida interrumpida
        if(game.status === GAME_STATUS.ABORTED){
          showAbortedGame();
          return;
        }

        //Si la partida terminó, regreso a los resultados finales
        if(game.status === GAME_STATUS.FINISHED){
          showFinalResults();
          return;
        }
      });
    }
    /*
      MUY IMPORTANTE:

      Estamos viendo una tabla de solo lectura.

      No queremos continuar ejecutando el resto
      de showGame(), porque más abajo se conectan
      eventos como:

      - finalizar mano;
      - finalizar partida;
      - otros controles propios de una partida
        activa.
    */
    return;
  }

  //La mesa está activa. Se inicia la escucha de la mano
  startCurrentHandListener();

  //Evento para finalizar la mano y registrar los resultados
  const btnFinalizarMano = document.querySelector('#btnFinalizarMano');

  //Obtener los elementos del modal para finalizar la mano
  const modalFinalizarMano = document.querySelector('#modalFinalizarMano');

  const finalizarManoModal = modalFinalizarMano ? new Modal(modalFinalizarMano) : null;

  if(btnFinalizarMano){
    btnFinalizarMano.addEventListener('click', () => {
      //Mostrar el modal para que el host defina como finalizó la mano
      finalizarManoModal.show();
    });

    const btnConfirmarFinalizarMano = document.querySelector('#btnConfirmarFinalizarMano');

    const errorFinalizarMano = document.querySelector('#errorFinalizarMano');

    btnConfirmarFinalizarMano.addEventListener('click', async () => {
      //Obtener la causa seleccionada
      const endReasonInput = document.querySelector('input[name="endReason"]:checked');

      //Causa obligatoria
      if(!endReasonInput){
        errorFinalizarMano.textContent = 'Selecciona cómo terminó la partida';

        errorFinalizarMano.classList.remove('d-none');

        return;
      }

      //Ocultar errores anteriores
      errorFinalizarMano.classList.add('d-none');

      //Construir los datos generales de la mano
      const hand = {
        number: game.currentHand,
        dealerIndex: game.dealerIndex,
        endReason: endReasonInput.value,
      };

      //Intentar crear en Firestore: games/{gameId}/hands/hand-N con estado collecting_results.
      try {
        await createHandInFirestore(appState.currentGameId, hand);

        //Cerrar el modal
        finalizarManoModal.hide();
      } catch (error) {
        console.error('Error al finalizar la mano: ', error);
        errorFinalizarMano.textContent = 'No fue posible finalizar la mano.';

        errorFinalizarMano.classList.remove('d-none');
      }
    });
  }

  //Evento y modal para finalizar partida
  const btnFinalizarPartida = document.querySelector('#btnFinalizarPartida');
  const modalFinalizarPartida = document.querySelector('#modalFinalizarPartida');

  const finalizarPartidaModal = new Modal(modalFinalizarPartida);

  if(btnFinalizarPartida){
    btnFinalizarPartida.addEventListener('click', () => {
      finalizarPartidaModal.show();
    });

    //Confirmación del modal para finalizar partida
    const btnConfirmarFinalizarPartida = document.querySelector('#btnConfirmarFinalizarPartida');

    btnConfirmarFinalizarPartida.addEventListener('click', async () => {
      //Aplicar la lógica de finalización sobre el objeto local de la partida
      const aborted = abortGame(game, appState.currentPlayerId);

      //Si abortGame() devuelve false, la partida no pudo finalizarse
      if(!aborted) {
        return;
      }

      try {
        //Persistir en firebase el nuevo estado de la partida
        await updateGameState(appState.currentGameId, game);
        
        //Cerrar el modal únicamente después de guardar en Firestore
        finalizarPartidaModal.hide();

        //Mostrar la pantalla de una partida interrumpida
        showAbortedGame();
      } catch (error) {
        //Registrar el error técnico 
        console.error('Error al finalizar la partida: ', error);

        /*
          Por ahora utilizamos alert porque
          todavía no tenemos un contenedor
          de error específico en este modal.

          Más adelante podemos reemplazarlo
          por un alert de Bootstrap.
        */
        alert('No fue posible finalizar la partida.');
      }
    });
  }
}

/*
  Función que muestra el estado
  de recolección de resultados.

  Recibe:

  - hand:
    mano actual.

  - results:
    resultados ya registrados.
*/
function showResultsStatus(hand, results) {
  //Recuperar la partida actual
  const game = appState.currentGame;

  if(!game){
    return;
  }

  //Determinar si este dispositivo pertenece al host
  const playerIsHost = appState.currentPlayerId === game.hostPlayerId;

  //Comporbar si hay un resultado para cada jugador
  const allResultsSubmitted = results.length === game.players.length;

  //Construir el estado de cada jugador
  const playerStatus = game.players.map((player) => {
    //Buscar si existe resultado para ese jugador
    const result = results.find((item) => item.playerId === player.id);

    //Si existe resultado mostrarlo como registrado
    if(!result){
      return `
      <li class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
            <span>
                ${player.name}
            </span>

            <span class="badge text-bg-secondary">
                Pendiente
            </span>
          </div>
      </li>
      `;
    }

    //Si este dispositivo no es el host solo se indica que el resultado fue registrado
    if(!playerIsHost){
      return `
      <li class="list-group-item">
          <div class="d-flex justify-content-between align-items-center">
              <span>
                  ${player.name}
              </span>

              <span class="badge text-bg-success">
                  Registrado
              </span>
          </div>
      </li>
      `;
    }

    //Vista del host
    //Preparar el texto correspondiente al juego completado
    const completedGameText = result.completedGameCode ? result.completedGameCode 
    : 'No completó juego'; 
  
    return `
    <li class="list-group-item">
        <div class="d-flex justify-content-between align-items-start gap-3">
            <div>
                <div class="fw-bold mb-2">
                    ${player.name}
                </div>

                <div class="small">
                    Juego:
                    <strong>
                        ${completedGameText}
                    </strong>
                </div>

                <div class="small">
                    Puntos: 
                    <strong>
                        ${result.points}
                    </strong>
                </div>

                <div class="small">
                    Compras:
                    <strong>
                        ${result.purchasesUsed}
                    </strong>
                </div>

                <button type="button" class="btn btn-outline-secondary btn-sm mt-3 btnEditarResultado" data-player-id="${player.id}">
                    Editar
                </button>
            </div>

            <span class="badge text-bg-success">
                Registrado
            </span>
        </div>
    </li>
    `;
  }).join('');
  
  //Renderizar la pantalla
  app.innerHTML = `
  <main class="container py-4">
      <section class="mb-4">
          <h1 class="h3 fw-bold mb-1">
              Resultados de la mano
          </h1>

          <p class="text-secondary mb-0">
              Mano ${hand.number}
          </p>
      </section>

      <section class="card">
          <div class="card-body">
              <h2 class="h5 mb-3">
                  Estado de los jugadores
              </h2>

              <ul class="list-group">
                  ${playerStatus}
              </ul>
          </div>
      </section>

      ${
          allResultsSubmitted ? `
          <div class="alert alert-success mt-4">
              Todos los jugadores registraron sus resultados.
          </div>
          ` : `
          <div class="alert alert-secondary mt-4">
              Esperando los resultados restantes...
          </div>
          `
      }

      ${
          playerIsHost && allResultsSubmitted ? `
          <button type="button" class="btn btn-primary w-100 mt-3" id="btnConfirmarResultados">
              Confirmar resultados y continuar
          </button>
          `:''
      }
  </main>
  `;

  /*
    ------------------------------------------------
    EDICIÓN DE RESULTADOS POR EL HOST
    ------------------------------------------------
  */
  if(playerIsHost){
    //Obtener todos los botones Editar
    const editButtons = document.querySelectorAll('.btnEditarResultado');

    editButtons.forEach((button) => {
      button.addEventListener('click', async () => {
        //Recuperar el jugador asociado al botón seleccionado
        const playerId = button.dataset.playerId;
        const player = game.players.find((item) => item.id === playerId);

        //Recuperar su resultado actual
        const result = results.find((item) => item.playerId === playerId);

        if(!player || !result){
          return;
        }

        //Buscar el <li> que le corresponde al jugador
        const playerItem = button.closest('.list-group-item');

        //En modo libre se debe poder editar el juego completado
        const pendingGames = game.mode === 'libre' ? getPendingGames(game, player.id) : [];

        //Construir el campo correspondiente al juego
        const gameField = game.mode === 'libre' ? `
        <div class="mb-3">
            <label for="editGame-${player.id}" class="form-label">
                Juego completado
            </label>

            <select id="editGame-${player.id}" class="form-select">
                <option value="">
                    No completó juego
                </option>

                ${pendingGames.map((gameItem) => `
                    <option value="${gameItem.code}" 
                    ${result.completedGameCode === gameItem.code ? 'selected' : ''}>
                        ${gameItem.code}
                    </option>
                    `).join('')}
            </select>
        </div>
        `: `
        <div class="mb-3">
            <label class="form-label">
                Juego
            </label>

            <input type="text" class="form-control" value="${result.completedGameCode}" disabled>
        </div>
        `;

        //Reemplazar temporalmente la tarjeta del jugador por el formulario de edición
        playerItem.innerHTML = `
        <div class="fw-bold mb-3">
            ${player.name}
        </div>

        ${gameField}

        <div class="mb-3">
            <label for="editPoints-${player.id}" class="form-label">
                Puntos
            </label>

            <input type="number" class="form-control" id="editPoints-${player.id}" min="0" max="999" step="1" value="${result.points}">
        </div>

        <div class="mb-3">
            <label for="editPurchases-${player.id}" class="form-label">
                Compras utilizadas
            </label>

            <input type="number" class="form-control" id="editPurchases-${player.id}" min="0" max="${player.purchasesRemaining}" step="1" value="${result.purchasesUsed}">

            <div class="form-text">
                Disponibles:
                ${player.purchasesRemaining}
            </div>
        </div>

        <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-secondary flex-fill" id="btnCancelarEdicion-${player.id}">
                Cancelar
            </button>

            <button type="button" class="btn btn-outline-secondary flex-fill" id="btnGuardarEdicion-${player.id}">
                Guardar cambios
            </button>
        </div>
        `;

        /*
          ---------------------------------------------
          CANCELAR
          ---------------------------------------------
        */
        const btnCancelarEdicion = document.querySelector(`#btnCancelarEdicion-${player.id}`);

        btnCancelarEdicion.addEventListener('click', () => {
          //Renderizar los resultados que ya habían
          showResultsStatus(hand, results);
        });

        /*
          ---------------------------------------------
          GUARDAR CORRECCIÓN
          ---------------------------------------------
        */
        const btnGuardarEdicion = document.querySelector(`#btnGuardarEdicion-${player.id}`);

        btnGuardarEdicion.addEventListener('click', async () => {
          //Lee los nuevos valores
          const pointsInput = document.querySelector(`#editPoints-${player.id}`);
          const purchasesInput = document.querySelector(`#editPurchases-${player.id}`);

          const newPoints = Number(pointsInput.value);
          const newPurchases = Number(purchasesInput.value);

          //Validar puntos
          if(!Number.isInteger(newPoints) ||  newPoints < 0 || newPoints > 999){
            alert('Los puntos deben estar entre 0 y 999.');
            return;
          }

          //Validar compras
          if(!Number.isInteger(newPurchases) ||  newPurchases < 0 || newPurchases > player.purchasesRemaining){
            alert('Los puntos deben estar entre 0 y ${player.purchasesRemaining}.');
            return;
          }

          //Determinar el juego completado
          let newCompletedGameCode = result.completedGameCode;

          //En modo libre se obtiene del selector
          if(game.mode === 'libre'){
            const gameSelect = document.querySelector(`#editGame-${player.id}`);
            //Si está vacía significa que no completó ningún juego
            newCompletedGameCode = gameSelect.value === '' ? null : gameSelect.value;
          }

          try {
            //Evitar doble clic durante la actualización
            button.disabled = true;
            button.textContent = 'Guardando...';

            //Actualizar el docuemnto existente
            await updateHandResult(appState.currentGameId, hand.id, player.id, newCompletedGameCode, newPoints, newPurchases);

          } catch (error) {
            console.error('Error al corregir resultado: ', error);

            button.disabled = false;
            button.textContent = 'Editar';

            alert('No fue posible corregir el resultado');
          }
        });
      });
    });
  }

  /*
    ------------------------------------------------
    CONFIRMACIÓN DE RESULTADOS
    ------------------------------------------------
  */
  const btnConfirmarResultados = document.querySelector('#btnConfirmarResultados');

  //En dispositivos que no son host el botón no existe
  if(btnConfirmarResultados){
    btnConfirmarResultados.addEventListener('click', async () => {
      //Validar el comjunto Completo de resultados
      const handIsValid = validateHandResults(hand.endReason, results);

      if(!handIsValid){
        alert('Los puntajes no coinciden con la forma en que terminó la mano.');
        return;
      }

      //Evitar múltiples confirmaciones mientras firebase procesa
      btnConfirmarResultados.disabled = true;
      btnConfirmarResultados.textContent = 'Confirmando...';

      try {
        //Guardar la mano localmente
        saveHandResults(game, hand.endReason, results);

        //Determinar si terminó la partida
        const gameFinished = isGameFinished(game);

        //Si terminó la partida
        if(gameFinished){
          //Cambiar el estado local general de la partida a FINISHED
          finishGame(game);

          //Persistir el estado final de la partida
          await updateGameState(appState.currentGameId, game);

          //Marcar la mano como completamente cerrada
          await updateHandStatus(appState.currentGameId, hand.id, 'completed');

          //Los listeners reciben el cambio
          showFinalResults();
          return;
        }

        //Si la partida continúa
        //Preparar localemnte la siguiente mano
        advanceToNextHand(game);

        //Persistir en le documento principal
        await updateGameState(appState.currentGameId, game);
        
        //Marcar la mano actual como terminada
        await updateHandStatus(appState.currentGameId, hand.id, 'completed');

        //Ya no se necesita escuchar los resultados
        stopResultsListener();

        //Ya no se necesita escuchar la mano
        stopHandListener();

        //Mostrar la siguiente mano
        showGame();
      } catch (error) {
        console.error('Error al confirmar los resultados: ', error);

        //Permitir un nuevo intento
        btnConfirmarResultados.disabled = false;
        btnConfirmarResultados.textContent = 'Confirmar resultados y continuar';

        alert('No fue posible cerra la mano');
      }
    });
  }
}

/*
  Función que inicia la escucha en tiempo real
  de los resultados de una mano.
*/
function startResultsListener(hand) {
  //Comprobar que exista una partida
  const game = appState.currentGame;

  if(!game || !appState.currentGameId){
    return;
  }

  //Si ya estamos escuchando los resultados de esta mano, no crear otro listener
  if(listeningResultsHandId === hand.id && unsubscribeResultsListener){
    return;
  }

  //Detener cualquier listener anterior
  stopResultsListener();

  //Registrar la mano que va a escuchar
  listeningResultsHandId = hand.id;

  //Escuchar en tiempo real
  unsubscribeResultsListener = subscribeToHandResults(appState.currentGameId, hand.id,(results) => {
    //Buscar si el jugador ya registró su resultado
    const currentPlayerResult = results.find((result) => result.playerId === appState.currentPlayerId);

    //Si ya registró mostrar el estado general
    if(currentPlayerResult){
      showResultsStatus(hand, results);
      return;
    }
  }, (error) => {
    console.error('Error al sincronizar resultados: ', error);
  });
}

/*
  Función que muestra el formulario
  correspondiente únicamente al jugador
  asociado a este dispositivo.
*/
function showHandResults(hand) {
  //Recuperar la partida actual
  const game = appState.currentGame;

  //Si no existe partida regresar al inicio
  if(!game){
    showHome();
    return;
  }

  //Buscar al jugador asociado a este dispositivo
  const currentPlayer = game.players.find((player) => player.id === appState.currentPlayerId);

  //Si por alguna razón el jugador ya no pertenece a la partida, no se debe mostrar el formulario
  if(!currentPlayer){
    console.error('No se encontró el jugador actual.');
  }

  //Renderizar solamente el formulario correspondiente a este jugador
  app.innerHTML = renderHandResults(game, currentPlayer, hand);

  /*
    ------------------------------------------------
    MODO LIBRE
    ------------------------------------------------

    En modo libre necesitamos habilitar
    o deshabilitar el selector del juego
    dependiendo de si el jugador indica
    que completó uno.
  */
  if(game.mode === 'libre'){
    //Recuperar los controles del jugador actual
    const yesRadio = document.querySelector(`#completedYes-${currentPlayer.id}`);
    const noRadio = document.querySelector(`#completedNo-${currentPlayer.id}`);
    const gameSelect = document.querySelector(`#game-${currentPlayer.id}`);

    //Al seleccionar "Sí" se habilita el selector
    yesRadio.addEventListener('change', () => {
      gameSelect.disabled = false;
    });

    //Al seleccionar "No" se deshabilita el selector y se elimina cualquier seleccion previa
    noRadio.addEventListener('change', () => {
      gameSelect.disabled = true;
      gameSelect.value = '';
    }); 
  }

  /*
    ------------------------------------------------
    CONTROL DEL CAMPO PUNTOS
    ------------------------------------------------
  */
  const pointsInput = document.querySelector(`#points-${currentPlayer.id}`);

  if(pointsInput){
    pointsInput.addEventListener('input', () => {
      //Si el campo está vacío
      if(pointsInput.value === ''){
        return;
      }

      //Convertir el valor ingresado a número
      const points = Number(pointsInput.value);

      //No permitir valores negativos
      if(points < 0){
        pointsInput.value = 0;
        return;
      }

      //El puntaje máximo es 999
      if(points > 999){
        pointsInput.value = 999;
      }
    });
  }

 /*
    ------------------------------------------------
    CONTROL DEL CAMPO COMPRAS
    ------------------------------------------------
  */
  const purchasesInput = document.querySelector(`#purchases-${currentPlayer.id}`);

  //En la primera mano no se realizan compras, no está renderizado
  if(purchasesInput){
    purchasesInput.addEventListener('input', () => {
      //Si queda vacío temporalmente, no hacer nada
      if(purchasesInput.value === ''){
        return;
      }

      //Convertir a número
      const purchasesUsed = Number(purchasesInput.value);

      //No permitir negativos
      if(purchasesUsed < 0){
        purchasesInput.value = 0;
        return;
      }

      //No permitir utilizar más compras de las que tiene disponibles
      if(purchasesUsed > currentPlayer.purchasesRemaining){
        purchasesInput.value = currentPlayer.purchasesRemaining;
      }
    });
  }

  /*
    ------------------------------------------------
    GUARDAR RESULTADO INDIVIDUAL
    ------------------------------------------------

    Cada dispositivo guarda únicamente
    el resultado del jugador asociado
    a appState.currentPlayerId.
  */
  const btnGuardarResultado = document.querySelector('#btnGuardarResultado');
  const errorResultado = document.querySelector('#errorResultado');

  btnGuardarResultado.addEventListener('click', async () => {
    //Ocultar errores anteriores
    ocultarError(errorResultado);

    //Obtener el campo de puntos
    const pointsInput = document.querySelector(`#points-${currentPlayer.id}`);
    
    //Obtener el campo de compras
    const purchasesInput = document.querySelector(`#purchases-${currentPlayer.id}`);

    //Leer los valores ingresados
    const points = pointsInput.value;

    //Si el campo de compras no existe usar 0
    const purchasesUsed = purchasesInput ? purchasesInput.value : '0';

    //Por defecto ningún juego se considera completado hasta determinarlo segun la modalidad
    let completedGameCode = null;

    //En modo ordenado siempre existe un juego asociado a la mano.
    let gameCompleted = game.mode === 'ordenado';

    /*
      ------------------------------------------------
      MODO LIBRE
      ------------------------------------------------
    */
    if(game.mode === 'libre'){
      //Obtener el radio seleccionado
      const completedInput = document.querySelector(`input[name="completed-${currentPlayer.id}"]:checked`);

      //Es obligatorio indicar si se completó o no el juego
      if(!completedInput){
        mostrarError(errorResultado, 'Indica si completaste un juego.');
        return;
      }

      //Convertir la respuesta del radio en un boolean
      gameCompleted = completedInput.value === 'yes';

      //Solo si respondió sí, debemos recuperar el código del juego
      if(gameCompleted){
        const gameSelect = document.querySelector(`#game-${currentPlayer.id}`);
        completedGameCode = gameSelect.value;
      }
    }

    /*
      ------------------------------------------------
      MODO ORDENADO
      ------------------------------------------------

      En esta modalidad el juego correspondiente
      ya viene determinado por el número de mano.
    */
    if(game.mode === 'ordenado'){
      const orderedGame = getOrderedGame(hand.number);
      completedGameCode = orderedGame.code;
    }

    //Validar los datos individuales antes de construir el resultado
    const isValid = validatePlayerResult(completedGameCode, points, purchasesUsed, currentPlayer.purchasesRemaining, gameCompleted);

    //Si alguno de los valores no cumple las reglas, no se envía a Firestore
    if(!isValid){
      mostrarError(errorResultado, 'Revisa los datos ingresados');
      return;
    }

    //Construir el resultado usando la lógica que maneja el juego
    const result = createPlayerResult(currentPlayer.id, completedGameCode, Number(points), Number(purchasesUsed));

    try {
      //Evitar multiples clics mientras se guarda en Firebase
      btnGuardarResultado.disabled = true;
      btnGuardarResultado.textContent = 'Guardando...';

      //Guardar el resultado del jugador
      await saveHandResult(appState.currentGameId, hand.id, result);

    } catch (error) {
      //Si firestore informa que este jugador ya tiene un resultado registrado, llevamos al jugador a la pantalla de espera
      if(error.message === 'RESULT_ALREADY_EXISTS'){
        return;
      }

      //Registrar el error técnico
      console.error('Error al guardar el resultado: ', error);

      //Volver a habilitar el botón de guardado
      btnGuardarResultado.disabled = false;
      btnGuardarResultado.textContent = 'Guardar mi resultado';

      //Informar al usuario
      mostrarError(errorResultado, 'No fue posible guardar tu resultado.');
    }
  });
}

/*
  Función que permite mostrar los  
  resultados finales y al o los ganadores.
*/
function showFinalResults() {
  const game = appState.currentGame;

  //La partida terminó: detener listeners activos
  stopResultsListener();
  stopHandListener();
  
  //Escuchar si vamos a una partida de revancha
  startNextGameListener();

  //Calcular el o los ganadores
  const winners = getGameWinners(game);

  //Definirsi es Host o no
  const playerIsHost = appState.currentPlayerId === game.hostPlayerId;

  //Renderizar la pantalla final
  app.innerHTML = renderFinalResults(game, winners, playerIsHost);

  //Funcionalidad del botón para revisar los resultados
  const btnVolverTabla = document.querySelector('#btnVolverTabla');

  btnVolverTabla.addEventListener('click', () => {
    showGame(true);
  });

  //Funcionalidad del botón para crear una nueva partida
  const btnNuevaPartida = document.querySelector('#btnNuevaPartida');

  if(btnNuevaPartida){
    btnNuevaPartida.addEventListener('click', async () => {
      //Evitar múltiples clics mientras se crea la nueva partida
      btnNuevaPartida.disabled = true;
      btnNuevaPartida.textContent = 'Creando nueva partida...';

      try {
        //Detener cualquier escucha asociada a la partida finalizada
        stopGameListener();
        stopPlayersListener();
        stopHandListener();
        stopResultsListener();

        const previousGameId = appState.currentGameId;

        //Construir la nueva partida utilizando los jugadores y ganador de la anterior
        const newGame = createNextGame(game, winners);

        //Crear un nuevo documento de partida en Firestore
        const newGameId = await createGameInFirestore(newGame);

        //Guardar todos los jugadores de la nueva partida respetando el nuevo orden
        for (let index = 0; index < newGame.players.length; index++) {
          await addPlayerToGame(newGameId, newGame.players[index], index);
        }

        //Informar a todos los dispositivos cuál es la nueva partida.
        await updateNextGameId(previousGameId, newGameId);

        //Cambiar el estado local para que ahora apunte a la nueva partida
        appState.currentGame = newGame;
        appState.currentGameId = newGameId;

        //El jugador de este dispositivo conserva su mismo playerId
        saveSession(newGameId, appState.currentPlayerId);

        //Entrar al lobby de la nueva partida
        showLobby();
      } catch (error) {
        console.error('Error al crear la nueva partida: ', error);

        btnNuevaPartida.disabled = false;
        btnNuevaPartida.textContent = 'Nueva partida';

        alert('No fue posible crear la nueva partida.');
      }
    });
  }
}

/*
  Función que permite abortar una partida.
*/
function showAbortedGame() {
  //Obtener el contexto actual
  const game = appState.currentGame;

  //Si no existe una partida vuelve al inicio
  if(!game){
    showHome();
    return;
  }

  //Renderizar la pantalla de partida abortada
  app.innerHTML = renderAbortedGame(game);

  //Funcionalidad del botón para ver partida (tabla) abortada
  const btnVerPartidaInterrumpida = document.querySelector('#btnVerPartidaInterrumpida');

  btnVerPartidaInterrumpida.addEventListener('click', () => {
    showGame(true);
  });

  //Funcionalidad del botón para abandonar la sesión e ir al inicio
  const btnVolverInicio = document.querySelector('#btnVolverInicio');

  if(btnVolverInicio){
    btnVolverInicio.addEventListener('click', () => {
      //Detener listeners para abandonar la partida
      stopPlayersListener();
      stopHandListener();
      stopGameListener();

      //Eliminar gameId y playerId
      clearSession();

      //Limpiar el estado temporal
      appState.currentGame = null;
      appState.currentGameId = null;
      appState.currentPlayerId = null;

      //Regresar al inicio
      showHome();
    });
  }
}

/*
  Función que permite mostrar la pantalla 
  que permite al jugador ingresar su nombre
  antes de unirse a una partida.
*/
function showJoinGame(game) {
  //Renderizar la pantalla 
  app.innerHTML = renderJoinGame(game);

  //Obtener elementos para interacción
  const nombreJugador = document.querySelector('#nombreJugador');
  const mensajeErrorJoin = document.querySelector('#mensajeErrorJoin');

  //Funcionalidad del botón para volver al inicio sin hacer nada
  const btnVolverInicio = document.querySelector('#btnVolverInicio');

  btnVolverInicio.addEventListener('click', () => {
    showHome();
  });

  //Funcionalidad del botón para unirse a la partida
  const btnConfirmarUnion = document.querySelector('#btnConfirmarUnion');

  btnConfirmarUnion.addEventListener('click', async () => {
    const nombre = nombreJugador.value.trim();

    //Validar que se jhaya ingresado un nombre
    if(nombre === ''){
      mensajeErrorJoin.textContent = 'Ingresa tu nombre para continuar.';
      mensajeErrorJoin.classList.remove('d-none');
      return;
    }

    //Ocultar todos los mensajes de error si todo esta correcto
    mensajeErrorJoin.classList.add('d-none');

    try {
      //Deshabilitamos el botón mientras verificamos y registramos al jugador
      btnConfirmarUnion.disabled = true;
      btnConfirmarUnion.textContent = 'Uniéndote...';

      //Consultar nuevamente el estado de la partida
      const currentGame = await findGameByCode(game.code);

      //Si la aprtida ya no existe no se puede continuar
      if(!currentGame){
        mensajeErrorJoin.textContent = 'La partida ya no está disponible.';
        mensajeErrorJoin.classList.remove('d-none'); 
        
        return;
      }

      //Comprobar que la partida siga en estado lobby
      if(currentGame.status !== GAME_STATUS.LOBBY){
        mensajeErrorJoin.textContent = 'La partida ya comenzó y no acepta nuevos jugadores.';
        mensajeErrorJoin.classList.remove('d-none');

        btnConfirmarUnion.disabled = false;
        btnConfirmarUnion.textContent = 'Unirme a la partida';

        return;
      }

      //Recuperar nuevamente los jugadores
      const currentPlayers = await getPlayersFromGame(currentGame.id);

      //Verificar q todavía haya espacio en la partida
      if(currentPlayers.length >= 6){
        mensajeErrorJoin.textContent = 'La partida ya tiene el máximo de 6 jugadores.';
        mensajeErrorJoin.classList.remove('d-none');

        btnConfirmarUnion.disabled = false;
        btnConfirmarUnion.textContent = 'Unirme a la partida';

        return;
      }

      //Compribar si ya existe el jugador con ese nombre: Beto, beto, BETO, etc
      const playerAlreadyExists = currentPlayers.some((player) => player.name.toLowerCase() === nombre.toLowerCase());

      if(playerAlreadyExists){
        mensajeErrorJoin.textContent = 'Ya existe un jugador con ese nombre.';
        mensajeErrorJoin.classList.remove('d-none');

        btnConfirmarUnion.disabled = false;
        btnConfirmarUnion.textContent = 'Unirme a la partida';

        return;
      }

      //Generar el id del jugador nuevo
      const playerId = generatePlayerId();

      //Generar el objeto del jugador con el formato de la app
      const newPlayer = {
        id: playerId,
        name: nombre,
      }

      //Calcular la posición del nuevo jugador
      const playerOrder = currentPlayers.length;

      //Guardar al nuevo jugador en firestore
      await addPlayerToGame(currentGame.id, newPlayer, playerOrder);

      //Guardar el id de la partida q se creo en firestore
      appState.currentGameId = currentGame.id;

      //Asociar el dispositivo al jugador que ingresó
      appState.currentPlayerId = playerId;

      //Guardar la sesión del jugador que se acaba de unir
      saveSession(currentGame.id, playerId);

      //Añadir los jugadores al objeto de la partida
      currentGame.players = [
        ...currentPlayers,
        newPlayer,
      ];

      //Guardar la partida como actual para este dispositivo
      appState.currentGame = currentGame;

      //Entrar al lobby
      showLobby();
    } catch (error) {
      //Informar al jugador de manera técnica sobre el error
      console.error('Error al unirse a la partida', error);

      //Mostrar mensaje comprensible al jugador
      mensajeErrorJoin.textContent = 'Ya existe un jugador con ese nombre.';
      mensajeErrorJoin.classList.remove('d-none');

      //Permitir un nuevo intento
      btnConfirmarUnion.disabled = false;
      btnConfirmarUnion.textContent = 'Unirme a la partida';
    }
  });
}

/*
  Función para inicializar la aplicación.

  Antes de mostrar Home comprobamos
  si este navegador tenía una sesión
  activa previamente.
*/
async function initializeApp(params) {
  //Recuperar la sesión del localStorage
  const session = loadSession();

  //Si no existe, iniciar en el home
  if(!session){
    showHome();
    return;
  }

  try {
    //Recuperar la partida desde firebase
    const game = await getGameById(session.gameId);

    //Si la partida ya no existe limpiar la sesión
    if(!game){
      clearSession();
      showHome();
      return;
    }

    //Recuperar los jugadores actuales de la partida
    const players = await getPlayersFromGame(session.gameId);

    //Comporbar que el jugador de este dispositivo todavía se parte de la partida
    const currentPlayerExists = players.some((player) => player.id === session.playerId);

    //Si no pertenece, la sesión local dejó de ser válida
    if(!currentPlayerExists){
      clearSession();
      showHome();
      return;
    }

    //Recuperar las manos previamente registradas
    const hands = await getHandsFromGame(session.gameId);

    //Obtener la cantidad inicial de compras de la modalidad
    const initialPurchases = getInitialPurchases(game.mode);

    //Reconstruir las compras restantes de cada jugador
    players.forEach((player) => {
      //Obtener todos los resultados registrados
      const playerResults = hands.flatMap((hand) => hand.results).filter((result) => result.playerId === player.id);

      //Calcular cuántas compras ha utilizado
      const purchasesUsed = playerResults.reduce((total, result) => total + result.purchasesUsed, 0);

      //Reconstruir las compras restantes
      player.purchasesRemaining = initialPurchases - purchasesUsed;
    });

    //Reconstruir la partida local
    game.players = players;

    //Reconstruir las manos 
    game.hands = hands;

    //Restaurar el estado de la app
    appState.currentGame = game;
    appState.currentGameId = session.gameId;
    appState.currentPlayerId = session.playerId;

    //Decidir qué pantalla corresponde según el estado actual de la partida
    if(game.status === GAME_STATUS.LOBBY){
      showLobby();
      return;
    }
    if(game.status === GAME_STATUS.IN_PROGRESS){
      showGame();
      return;
    }
    if(game.status === GAME_STATUS.FINISHED){
      showFinalResults();
      return;
    }
    if(game.status === GAME_STATUS.ABORTED){
      showAbortedGame();
      return;
    }

    //Si se encuentra un estado unesperado, volver a home por seguridad
    clearSession();
    showHome();
  } catch (error) {
    console.error('Error al restaurar la sesión: ', error);

    //Si firestore falla temporalmente se regresa al home TEMPORALMENTE 
    showHome();
  }
}

/*
  Función auxiliar reutilizable para mostrar errores.

  Recibe:
  - elemento: dónde mostrar el error.
  - mensaje: texto que queremos mostrar.
*/
function mostrarError(elemento, mensaje) {
  //Colocamos el texto del error
  elemento.textContent = mensaje;

  //Bootstrap usa la clase d-none para ocultar elementos. Al quitarla, aparece el alert.
  elemento.classList.remove('d-none')
}

/*
  Función auxiliar para volver a ocultar
  el mensaje de error.
*/
function ocultarError(elemento) {
  elemento.classList.add('d-none');
}

/*
  Punto de entrada de la aplicación.

  Primero intentamos recuperar
  una sesión existente.
*/
initializeApp();

//appState.currentGame = createFinishedTestGame();
//showFinalResults();