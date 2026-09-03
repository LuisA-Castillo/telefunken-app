// Importamos Bootstrap desde node_modules.
// Esto carga los estilos CSS del framework.
import 'bootstrap/dist/css/bootstrap.min.css';

// Importamos el JavaScript de Bootstrap.
// Lo necesitaremos más adelante para componentes como modales,
// dropdowns, offcanvas, etc.
import 'bootstrap';

// Importamos nuestros estilos personalizados.
// Este archivo tendrá solamente los estilos que Bootstrap no resuelva.
import './style.css';

// Buscamos en index.html el elemento cuyo id es "app".
// Ese elemento será el contenedor principal de nuestra aplicación.
const app = document.querySelector('#app');

// Insertamos el HTML inicial de nuestra aplicación dentro del div #app.
app.innerHTML = `
  <main class="container py-5">
    <!-- Encabezado principal -->
     <section class="text-center mb-5">
        <!-- Nombre de la aplicación -->
         <h1 class="display-4 fw-bold">
            Telefunken
         </h1>

         <!-- Texto secundario -->
         <p class="lead text-secondary">
            Lleva la cuenta. Tú concéntrate en jugar.
         </p>
     </section>

     <!-- Contenedor de las acciones principales -->
      <section class="mx-auto" style="max-width: 420px;">
        <!-- Botón para una nueva partida -->
         <button type="button" class="btn btn-primary btn-lg w-100 mb-4" id="btnCrearPartida">
            Crear partida
         </button>

        <!-- Separador visual -->
         <div class="text-center text-secondary mb-3">
            o únete a una existente
         </div>
        
        <!-- Campo para ingresar el código de la partida -->
         <div class="mb-3">
            <label for="codigoPartida" class="form-label">
                Código de partida
            </label>
            <input type="text" class="form-control form-control-lg text-uppercase" id="codigoPartida" placeholder="Ej. TELE-4821">
         </div>

        <!-- Botón para unirse -->
         <button type="button" class="btn btn-outline-primary btn-lg w-100" id="btnUnirse">
            Unirme
         </button>

        <!-- Acceso al historial -->
         <div class="text-center mt-4">
            <button type="button" class="btn btn-link text-decoration-none" id="btnHistorial">
                Ver historial de partidas
            </button>
         </div>
      </section>
  </main>
`;

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