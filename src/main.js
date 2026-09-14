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
import { GAME_STATUS, getOrderedGame, movePlayer, removePlayer } from './utils/gameRules';

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

//Pantallas de la aplicación.
import { renderHome } from './pages/home';
import { renderCreateGame } from './pages/createGame';
import { renderLobby } from './pages/lobby';
import { renderGame } from './pages/game';
import { renderHandResults } from './pages/handResults';
import { renderFinalResults } from './pages/finalResults';
import { renderAbortedGame } from './pages/abortedGame';

/*
  Busco en index.html el elemento cuyo id es "app".
  Este elemento será el contenedor principal de nuestra aplicación.
*/
const app = document.querySelector('#app');

/*
  Función para mostrar la pantalla de Inicio.
*/
function showHome() {
  
  //Insertar el HTML generado por renderHome().
  app.innerHTML = renderHome();

  // Obtener referencia al botón "Crear partida".
  const btnCrearPartida = document.querySelector('#btnCrearPartida');

  // Obtener referencia al botón "Unirme".
  const btnUnirse = document.querySelector('#btnUnirse');

  // Obtener referencia al campo donde se escribe el código.
  const codigoPartida = document.querySelector('#codigoPartida');


  // Escuchar evento click del botón Crear partida.
  btnCrearPartida.addEventListener('click', () => {

    // Al pulsar Crear partida, mostramos la pantalla correspondiente.
    showCreateGame();

  });


  // Escuchar evento click del botón Unirme.
  btnUnirse.addEventListener('click', () => {

    // Obtener el texto escrito por el usuario.
    const codigo = codigoPartida.value;

    // Mostrar temporalmente el código.
    alert(`Código ingresado: ${codigo}`);

  });
}

/*
  Función para mostrar la pantalla Crear partida.
*/
function showCreateGame() {

  //Insertar el HTML generado por renderCreateGame().
  app.innerHTML = renderCreateGame();

  
  //Obtener los elementos de la pantalla.
  const btnVolverInicio = document.querySelector('#btnVolverInicio');

  const btnCrear = document.querySelector('#btnCrear');

  const nombreAnfitrion = document.querySelector('#nombreAnfitrion');

  const mensajeError = document.querySelector('#mensajeError');


  //Evento para Crear partida.
  btnCrear.addEventListener('click', () => {
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
    /*
      Crear el objeto que representa
      la nueva partida.
    */
    appState.currentGame = {
      //codigo identificador
      code: generateGameCode(),
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

    appState.currentPlayerId = hostPlayerId;

    //Una vez creada la partida, direccionar al Lobby.
    showLobby();
  });

  //Evento para regresar a Inicio.
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

  //Comprobamos si el jugador puede administrar el lobby
  const playerCanManageLobby = canManageLobby(game, appState.currentPlayerId);

  //Renderizar el lobby usando los datos de la partida
  app.innerHTML = renderLobby(game, playerCanManageLobby);

  //Elementos TEMPORALES usados para simular que otro jugador se une a la partida.
  const nombreNuevoJugador = document.querySelector('#nombreNuevoJugador');
  const btnAgregarJugador = document.querySelector('#btnAgregarJugador');
  const errorNuevoJugador = document.querySelector('#errorNuevoJugador');

  //Evento que permite simular la incorporación de un nuevo jugador.
  if(btnAgregarJugador){
    btnAgregarJugador.addEventListener('click', () => {
      //Obtenemos y limpiamos el nombre.
      const nombre = nombreNuevoJugador.value.trim();

      //Validamos que el nombre no esté vacío.
      if (nombre === '') {
        errorNuevoJugador.textContent = 'Ingresa el nombre del jugador.';
        errorNuevoJugador.classList.remove('d-none');
        return;
      }

      //Comprobamos que todavía exista espacio para otro jugador.
      if (!canJoinGame(game)) {
        errorNuevoJugador.textContent = 'No es posible unirse a esta partida.';
        errorNuevoJugador.classList.remove('d-none');
        return;
      }

      //Ocultamos cualquier error anterior.
      errorNuevoJugador.classList.add('d-none')

      //Comprobamos si ya existe un jugador con el mismo nombre.
      //Convertimos ambos nombres a minúsculas para que "Beto" y "beto" se consideren iguales.
      const playerAlreadyExists =
        game.players.some((player) => {
          return (
            player.name.toLowerCase() === nombre.toLowerCase()
          );
        });

      if (playerAlreadyExists) {
        errorNuevoJugador.textContent = 'Ya existe un jugador con ese nombre.';
        errorNuevoJugador.classList.remove('d-none');
        return;
      }

      //Añadimos el nuevo jugador al estado de la partida.
      game.players.push({
        id: generatePlayerId(),
        name: nombre,
      });

      //TEMPORAL
      //appState.currentPlayerId = game.players[1].id;

      /*
        Volvemos a renderizar el Lobby.
        Esto actualizará:
        - la lista;
        - el contador;
        - el estado del botón Iniciar;
        - el botón Agregar.
      */
      showLobby()
    });
  }

  //Obtener los botones de subir, bajar y eliminar para el orden de los jugadores
  const botonesSubir = document.querySelectorAll('.btn-subir');
  const botonesBajar = document.querySelectorAll('.btn-bajar');
  const botonesEliminar = document.querySelectorAll('.btn-eliminar')
  
  //Se añade eventos a cada botón de subir
  botonesSubir.forEach((button) => {
    button.addEventListener('click', () => {
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

      //Volvemos a cargar le lobby con el nuevo orden
      showLobby();
    });
  });

  //Se añade eventos a cada botón de bajar
  botonesBajar.forEach((button) => {
    button.addEventListener('click', () => {
      const currentIndex = Number(button.dataset.index);

      //Bajar significa avanzar una posición en el arreglo.
      const newIndex = currentIndex + 1;

      movePlayer(game.players, currentIndex, newIndex);

      showLobby();
    });
  });

  //Se añade eventos a cada botón de eliminar
  botonesEliminar.forEach((button) => {
    button.addEventListener('click', () => {
      //Obtenemos la posición del jugador
      const index = Number(button.dataset.index);

      //Intentamos eliminarlo
      const removed = removePlayer(game.players, index, game.hostPlayerId);

      //Si no lo pudo eliminar no hacemos nada
      if(!removed){
        return;
      }

      //Volvemos a renderizar el lobby
      showLobby();
    });
  });

  //Obtener el botón Iniciar partida
  const btnIniciarPartida = document.querySelector('#btnIniciarPartida');

  if(btnIniciarPartida){
    //Evento para comprobar que el botón haga algo cuando esté habilitado
    btnIniciarPartida.addEventListener('click', () => {
      //Inicializar la partida
      initializeGame(game);

      //Mostrar mesa
      showGame();
    });
  }

  //Evento que permite salir del juego a un jugador mientras está en el lobby.
  const btnSalirLobby = document.querySelector('#btnSalirLobby');

  if(btnSalirLobby){
    btnSalirLobby.addEventListener('click', () => {
      const left = leaveLobby(game, appState.currentPlayerId);

      if(!left){
        return;
      }

      //Si ya no hay jugadores en la partida deja de existir la partida
      if(game.players.length === 0){
        appState.currentGame = null;
        appState.currentPlayerId = null;

        showHome();
        return;
      }

      //El jugador ya abandonó la partida
      appState.currentGame = null;
      appState.currentPlayerId = null;

      showHome();
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

  //Rederizamos la mesa
  app.innerHTML = renderGame(game);

  //Evento para finalizar la mano y registrar los resultados
  const btnFinalizarMano = document.querySelector('#btnFinalizarMano');

  if(btnFinalizarMano){
    btnFinalizarMano.addEventListener('click', () => {
      showHandResults();
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

  btnGuardarResultados.addEventListener('click', () => {
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

    //Regresar a la tabla para visualizar resultados
    showGame();
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
  const game = appState.currentGame;

  app.innerHTML = renderAbortedGame(game);

  const btnVerPartidaInterrumpida = document.querySelector('#btnVerPartidaInterrumpida');

  btnVerPartidaInterrumpida.addEventListener('click', () => {
    showGame();
  });
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
  -- IMPORTANTE --
  Punto de entrada visual de la aplicación.
  Cuando el navegador carga el proyecto, se muestra Home.
*/
showHome();

//appState.currentGame = createFinishedTestGame();
//showFinalResults();