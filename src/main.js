// Importar Bootstrap desde node_modules.
import 'bootstrap/dist/css/bootstrap.min.css';

// Importar el JavaScript de Bootstrap.
import 'bootstrap';

// Importar nuestros estilos personalizados.
import './styles/main.css';

/*
  Importar la función que representa
  la pantalla de inicio.
*/
import { renderHome } from './pages/home'

/*
  Busco en index.html el elemento cuyo id es "app".
  Este elemento será el contenedor principal de nuestra aplicación.
*/
const app = document.querySelector('#app');

// Insertar el HTML inicial de nuestra aplicación dentro del div #app.
app.innerHTML = renderHome();

// Obtener referencia al botón "Crear partida".
const btnCrearPartida = document.querySelector('#btnCrearPartida')

// Obtener referencia al botón "Unirme".
const btnUnirse = document.querySelector('#btnUnirse')

// Obtener referencia al campo donde se escribe el código.
const codigoPartida = document.querySelector('#codigoPartida')


// Escuchar evento click del botón Crear partida.
btnCrearPartida.addEventListener('click', () => {

  // Por ahora solamente mostramos un mensaje.
  // Después reemplazaremos esto por navegación real.
  alert('Aquí crearemos una nueva partida.')

})


// Escuchar evento click del botón Unirme.
btnUnirse.addEventListener('click', () => {

  // Obtener el texto escrito por el usuario.
  const codigo = codigoPartida.value

  // Mostrar temporalmente el código.
  alert(`Código ingresado: ${codigo}`)

})