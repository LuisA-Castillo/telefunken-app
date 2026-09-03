/*
  Esta función representa la pantalla de inicio.
*/
export function renderHome() {

    /*
    Retornar el String que contiene el HTML
    correspondiente a la pantalla de inicio.
  */

    return `
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
}