// Importar Bootstrap desde node_modules.
import 'bootstrap/dist/css/bootstrap.min.css';

// Importar el JavaScript de Bootstrap.
import 'bootstrap';

// Importar nuestros estilos personalizados.
import './styles/main.css';

//Pantallas de la aplicación.
import { renderHome } from './pages/home';
import { renderCreateGame } from './pages/createGame'

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

  
  //Obtenemos los elementos de la pantalla.
  const btnVolverInicio = document.querySelector('#btnVolverInicio');

  const btnCrear = document.querySelector('#btnCrear');

  const nombreAnfitrion = document.querySelector('#nombreAnfitrion');

  const mensajeError = document.querySelector('#mensajeError');


  //Evento para Crear partida.
  btnCrear.addEventListener('click', () => {
    //Obtenemos el nombre del anfitrión desde el input y le quitamos todos los espacios al inicio y al final
    const nombre = nombreAnfitrion.value.trim();

    //Buscamos el radio que está seleccionado. :checked significa: "dame únicamente el input que esté marcado".
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

    //Almacenamos la modalidad para redireccionar a la vista correspondiente
    const modalidad = modalidadSeleccionada.value;

    /*
      Por ahora solamente comprobamos
      que los datos se obtuvieron correctamente.

      Más adelante aquí crearemos realmente
      una partida.
    */
    alert(`Nombre: ${nombre}\nModalidad: ${modalidad}`);
  });


  //Evento para regresar a Inicio.
  btnVolverInicio.addEventListener('click', () => {

    showHome();

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