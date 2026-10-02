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
import { createPlayerResult, validatePlayerResult, saveHandResults, validateHandResults, advanceToNextHand, isGameFinished, getGameWinners } from './utils/handResults';

//Importar la generación de Ids
import { generatePlayerId } from './utils/playerId';

//Importar la creación de una nueva partida
import { createNextGame } from './utils/newGameFlow';

//DATOS DE PRUEBA
//import { createFinishedTestGame } from './utils/testData';

//Importar las funciones de finalización de una partida
import { abortGame, finishGame } from './utils/gameLifecycle';

//Importar las funciones para validar si un jugador puede salir de un juego
import { canManageLobby, canJoinGame } from './utils/lobbyPermissions';

//Importar las funciones para salir de un juego
import { leaveLobby } from './utils/lobbyActions';

//Importar las funciones para gestionar una partida en firestore
import { addPlayerToGame, createGameInFirestore, createHandInFirestore, deleteGame, deletePlayerFromGame, findGameByCode, getGameById, getHandsFromGame, getPlayersFromGame, saveHandResultsToFirebase, subscribeToGame, subscribeToGamePlayers, updateGameHost, updateGameState, updatePlayersOrder } from './services/gameRepository';

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
  Mantener una referencia al listener
  del juego actualmente activo.
*/
let unsubscribeGameListener = null;
let listeningGameDocumentId = null;

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

    unsubscribeGameListener = subscribeToGame(appState.currentGameId, (updateGame) => {
      if(!updateGame) {
        stopGameListener();
        stopPlayersListener();
        
        clearSession();

        appState.currentGame = null;
        appState.currentGameId = null;
        appState.currentPlayerId = null;

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

/*
  Función que muestra la pantalla 
  principal de la partida, la tabla de anotaciones.
*/
function showGame() {
  //Recuperamos la partida actual
  const game = appState.currentGame;

  //Si no existe partida regresamos al inicio
  if(!game) {
    showHome(); 
    return;
  }

  //Comprobar si este dispositivo pertenece al anfitrión
  const playerIsHost = appState.currentPlayerId === game.hostPlayerId;

  //Rederizamos la mesa
  app.innerHTML = renderGame(game, playerIsHost);

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

  //Evento para ver resultados finales
  const btnVerResultadosFinales = document.querySelector('#btnVerResultadosFinales');

  if(btnVerResultadosFinales){
    btnVerResultadosFinales.addEventListener('click', () => {
      showFinalResults();
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

    btnConfirmarFinalizarPartida.addEventListener('click', () => {
      const aborted = abortGame(game, appState.currentPlayerId);

      if(!aborted){
        return;
      }

      finalizarPartidaModal.hide();

      showAbortedGame();
    });
  }

}

/*
  Función que perimte ingresar los  
  datos al finalizar la mano.
*/
function showHandResults() {
  const game = appState.currentGame;

  if(!game){
    showHome();
    return;
  }

  app.innerHTML = renderHandResults(game);

  //Configurar el comportamiento de los formularios del modo libre
  if(game.mode === 'libre'){
    game.players.forEach((player) => {
      const yesRadio = document.querySelector(`#completedYes-${player.name}`);
      const noRadio = document.querySelector(`#completedNo-${player.name}`);
      const gameSelect = document.querySelector(`#game-${player.name}`);

      //Al seleccionar "Sí" se habilita el selector
      yesRadio.addEventListener('change', () => {
        gameSelect.disabled = false;
      });

      //Al seleccionar "No" se deshabilita el selector y se elimina cualquier seleccion previa
      noRadio.addEventListener('change', () => {
        gameSelect.disabled = true;
        gameSelect.value = '';
      });
    });
  }

  const btnVolverJuego = document.querySelector('#btnVolverJuego');
  btnVolverJuego.addEventListener('click', () => {
    showGame();
  });

  const btnGuardarResultados = document.querySelector('#btnGuardarResultados');

  btnGuardarResultados.addEventListener('click', async () => {
    //Obtener motivo de la terminación de la mano
    const endReasonInput = document.querySelector('input[name="endReason"]:checked');

    if(!endReasonInput){
      alert('Selecciona cómo terminó la mano.');
      return;
    }

    const results = [];

    //Recorrer cada jugador para leer su formulario
    for(const player of game.players){
      const pointsInput = document.querySelector(`#points-${player.name}`);

      const purchasesInput = document.querySelector(`#purchases-${player.name}`);

      const points = pointsInput.value;

      //En la primera mano del modo ordenado no existe el input de compras. Se usa 0 cuando no se encuentra el campo
      const purchasesUsed = purchasesInput ? purchasesInput.value : '0';

      let completedGameCode = null;
      let gameCompleted = true;

      //En el modo libre debemos consultar si se completó un juego
      if(game.mode === 'libre'){
        const completedInput = document.querySelector(`input[name=completed-${player.name}]:checked`);

        //Obligatorio indicar Sí o No
        if(!completedInput){
          alert(`${player.name}: indica que sí completó un juego.`);
          return;
        }

        gameCompleted = completedInput.value === 'yes';

        if(gameCompleted) {
          const gameSelect = document.querySelector(`#game-${player.name}`);

          completedGameCode = gameSelect.value;
        }
      } else {
        //En el modo ordenado ya se tiene determinado el número de mano
        const orderedGame = getOrderedGame(game.currentHand);

        completedGameCode = orderedGame.code;
      }

      //Validar antes de construir el resultado definitivo
      const isValid = validatePlayerResult(completedGameCode, points, purchasesUsed, player.purchasesRemaining, gameCompleted);

      if(!isValid){
        alert(`${player.name}: revisa los datos ingresados`);
        return;
      }

      //Convertir puntos y compras a numeros
      const result = createPlayerResult(player.id, completedGameCode, Number(points), Number(purchasesUsed));

      results.push(result);
    }

    //Validar el arreglo completo
    const isHandValid = validateHandResults(endReasonInput.value, results);

    if(!isHandValid){
      alert('Los puntajes no coinciden con la forma en que terminó la mano.');
      return;
    }

    //Todos los jugadores tienen resultados válidos y podemos guardar la mano
    saveHandResults(game, endReasonInput.value, results);

    //Recuperar la mano que se agregó localmente
    const savedHand = game.hands[game.hands.length - 1];

    console.log(
      'Mano guardada localmente:',
      savedHand
    );

    try {
      //Crear el documento general de la mano
      const handId = await createHandInFirestore(appState.currentGameId, savedHand);

      //Guardar el resultado en la subcolección results
      await saveHandResultsToFirebase(appState.currentGameId, handId, results);
    } catch (error) {
      console.error('Error al guardar la mano en firestore: ', error);
    }

    //Verificar si el juego ha finalizado
    const gameFinished = isGameFinished(game);

    //Si terminó no se avanza de mano
    if(gameFinished){
      finishGame(game);

      showFinalResults();
      return;
    }

    //Si aún continua la partida, se prepara la siguiente mano
    advanceToNextHand(game);

    try {
      //Persistir en firestore el nuevo estado de la partida
      await updateGameState(appState.currentGameId, game);

      //Mostrar la tabla únicamente despues de guardar el avance de la mano
      showGame();
    } catch (error) {
      console.error('Error al avanzar a la siguiente mano: ', error);
    }
  });
}

/*
  Función que permite mostrar los  
  resultados finales y al o los ganadores.
*/
function showFinalResults() {
  const game = appState.currentGame;

  //Calcular el o los ganadores
  const winners = getGameWinners(game);

  //Renderizar la pantalla final
  app.innerHTML = renderFinalResults(game, winners);

  //Funcionalidad del botón para revisar los resultados
  const btnVolverTabla = document.querySelector('#btnVolverTabla');

  btnVolverTabla.addEventListener('click', () => {
    showGame();
  });

  //Funcionalidad del botón para crear una nueva partida
  const btnNuevaPartida = document.querySelector('#btnNuevaPartida');

  btnNuevaPartida.addEventListener('click', () => {
    const newGame = createNextGame(game, winners);

    appState.currentGame = newGame;

    showLobby();
  });
}

/*
  Función que permite abortar una partida.
*/
function showAbortedGame() {
  //Obtener el contexto actual
  const game = appState.currentGame;

  //Renderizar la pantalla para abortar la partida
  app.innerHTML = renderAbortedGame(game);

  //Funcionalidad del botón para abortar la partida
  const btnVerPartidaInterrumpida = document.querySelector('#btnVerPartidaInterrumpida');

  btnVerPartidaInterrumpida.addEventListener('click', () => {
    showGame();
  });
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