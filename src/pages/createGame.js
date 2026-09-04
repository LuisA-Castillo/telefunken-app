/*
  Esta función genera la pantalla para crear una nueva partida.
*/
export function renderCreateGame() {
    /*
      Retornamos el HTML completo de la pantalla.
    */
   return `
   <main class="container py-4">
        <!-- Contenedor central -->
        <section class="mx-auto" style="max-width: 520px;">
            <!-- Boton para regresar al inicio -->
            <button type="button" class="btn btn-link text-decoration-none px-0 mb-3" id="btnVolverInicio">
                ← Volver
            </button>

            <!-- Encabezado -->
            <div class="mb-4">
                <h1 class="h2 fw-bold">
                    Crear partida
                </h1>

                <p class="text-secondary mb-0">
                    Configura la modalidad antes a los demas jugadores
                </p>
            </div>

            <!-- Nombre del Anfitrión -->
            <div class="mb-4">
                <label for="nombreAnfitrion" class="form-label fw-bold">
                    Tu nombre
                </label>

                <input type="text" class="form-control form-control-lg" id="nombreAnfitrion" placeholder="Ej. Beto" maxlength="20">
                
            </div>

            <!-- Selección de la modalidad -->
            <div class="mb-4">
                <label for="form-label fw-semibold">
                    Modalidad
                </label>

                <!-- Juego ordenado -->
                <div class="form-check border rounded p-3 mb-3">
                    <input type="radio" class="form-check-input" name="modalidad" id="modoOrdenado" value="ordenado">

                    <label for="modoOrdenado" class="form-check-label w-100">
                        <span class="d-block fw-semibold">
                            Juego ordenado
                        </span>

                        <small class="text-secondary">
                            Los 7 juegos se realizan en orden.
                            Cada jugador dispone de 12 compras y en 1/3 no se puede comprar.
                        </small>
                    </label>
                </div>

                <!-- Juego libre -->
                <div class="form-check border rounded p-3">
                    <input type="radio" class="form-check-input" name="modalidad" id="modoLibre" value="libre">

                    <label for="modoLibre" class="form-check-label w-100">
                        <span class="d-block fw-semibold">
                            Juego libre
                        </span>

                        <small class="text-secondary">
                            Cada jugador completa los 7 juegos en el orden que prefiera
                            y dispone de 7 compras para toda la partida
                        </small>
                    </label>
                </div>
            </div>

            <!-- Mensaje de validación -->
            <div class="alert alert-danger d-none" id="mensajeError" role="alert">

            </div>

            <!-- Botón principal -->
            <button type="button" class="btn btn-primary btn-lg w-100" id="btnCrear">
                Crear partida
            </button>
        </section>
    </main>
   `;
}