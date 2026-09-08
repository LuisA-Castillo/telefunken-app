// Importar Bootstrap desde node_modules.
import 'bootstrap/dist/css/bootstrap.min.css';

// Importar JavaScript de Bootstrap.
import 'bootstrap';

// Importar estilos personalizados.
import './styles/main.css';

//Importar estado global temporal de la aplicación
import { appState } from './state/appState';

//Importar generador de código de partida
import { generateGameCode } from './utils/gameCode';

//Importar regla para gestionar jugadores
import { canAddPlayer, movePlayer, removePlayer } from './utils/gameRules';

//Importar inicialización del juego
import { initializeGame } from './utils/gameSetup';

//Pantallas de la aplicación.
import { renderHome } from './pages/home';
import { renderCreateGame } from './pages/createGame';
import { renderLobby } from './pages/lobby';
import { renderGame } from './pages/game';

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
      host: nombre,
      //el host es el primer jugador de  la partida
      players: [
        {
          name: nombre,
          isHost: true
        },
      ],
    };

    //Una vez creada la partida, direccionar al Lobby.
    showLobby();
  });

  //Evento para regresar a Inicio.
  btnVolverInicio.addEventListener('click', () => {

    showHome();

  });
}

function showLobby() {
  //Obtener la partida guardada en nuestro estado local
  const game = appState.currentGame;

  //Si no existe una partida activa, regresar al Home
  if (!game) {
    showHome();
    return;
  }

  //Renderizar el lobby usando los datos de la partida
  app.innerHTML = renderLobby(game);

  //Elementos TEMPORALES usados para simular que otro jugador se une a la partida.
  const nombreNuevoJugador = document.querySelector('#nombreNuevoJugador');
  const btnAgregarJugador = document.querySelector('#btnAgregarJugador');
  const errorNuevoJugador = document.querySelector('#errorNuevoJugador');

  //Evento que permite simular la incorporación de un nuevo jugador.
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
    if (!canAddPlayer(game.players.length)) {
      errorNuevoJugador.textContent = 'La partida ya tiene el máximo de 6 jugadores.';
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
      name: nombre,
      isHost: false,
    });

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
      const removed = removePlayer(game.players, index);

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

  //Evento para comprobar que el botón haga algo cuando esté habilitado
  btnIniciarPartida.addEventListener('click', () => {
    //Inicializar la partida
    initializeGame(game);

    //Mostrar mesa
    showGame();
  });
}

/*
  Función que muestra la pantalla 
  principal de la partida.
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

  //Obtener el botón para cerrar la mano
  const btnFinalizarMano = document.querySelector('#btnFinalizarMano');

  //Evento para finalizar la mano y registrar los resultados
  btnFinalizarMano.addEventListener('click', () => {
    alert('Aquí registraremos los resultados de la mano');
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