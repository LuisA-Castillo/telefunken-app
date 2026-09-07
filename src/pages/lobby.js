/*
  Esta función genera la pantalla Lobby.

  Recibe un objeto game con los datos
  de la partida actual.
*/
export function renderLobby(game) {
    return `
    <main class="container py-4">
        <section class="mx-auto" style="max-width: 600px;">
            <!-- Encabezado -->
            <div class="text-center mb-4">
                <p class="text-secondary mb-1">
                    Código de partida
                </p>

                <h1 class="display-6 fw-bold">
                    ${game.code}
                </h1>

                <p class="text-secondary">
                    Comparte este código con los demás jugadores.
                </p>
            </div>

            <!-- Información de la partida -->
            <div class="card mb-4">
                <div class="card-body">
                    <p class="mb-2">
                        <strong>
                            Modalidad:
                        </strong>

                        ${game.mode === 'ordenado' ? 'Juego ordenado' : 'Juego libre'}
                    </p>

                    <p class="mb-0">
                        <strong>
                            Anfitrión:
                        </strong>

                        ${game.host}
                    </p>
                </div>
            </div>

            <!-- Jugadores -->
            <div class="mb-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h2 class="h5 mb-0">
                        Jugadores
                    </h2>

                    <span class="badge text-bg-secondary" id="contadorJugadores">
                        ${game.players.length}/6
                    </span>
                </div>

                <div class="list-group" id="listaJugadores">
                    ${game.players.map((player, index) => `
                        <div class="list-group-item">
                            <div class="d-flex justify-content-between align-items-center gap-2">
                                <!-- Información del jugador -->
                                <span>
                                    ${index + 1}. ${player.name}

                                    ${index === 0 ? '<small class="text-secondary ms-2">Primer repartidor</small>' : ''}
                                </span>

                                ${player.isHost ? '<span class="badge text-bg-primary">Anfitrión</span>' : ''} 

                                <!-- Controles de orden -->
                                <div class="btn-group btn-group-sm">
                                    <button type="button" class="btn btn-outline-secondary btn-subir" data-index="${index}" ${index === 0 ? 'disabled' : ''} aria-label="Subir ${player.name}">
                                        ↑
                                    </button>

                                    <button type="button" class="btn btn-outline-secondary btn-bajar" data-index="${index}" ${index === game.players.length - 1 ? 'disabled' : ''} aria-label="Bajar ${player.name}">
                                        ↓
                                    </button>

                                    <button type="button" class="btn btn-outline-danger btn-eliminar" data-index="${index}" ${player.isHost ? 'disabled' : ''} aria-label="Eliminar ${player.name}">
                                        ×
                                    </button>
                                </div>
                            </div>
                        </div>
                        `).join('')}
                </div>
            </div>

            <!-- Información sobre el orden -->
            <div class="alert alert-light border">
                El primer jugador de la lista será el primer repartidor.
            </div>

            <!-- Simulación temporal para añadir jugadores -->
            <div class="card mb-4">

            <div class="card-body">

                <h2 class="h5">
                Simular ingreso de jugador
                </h2>

                <p class="text-secondary">
                Esta sección es temporal.
                Más adelante cada jugador ingresará desde su propio dispositivo.
                </p>

                <div class="input-group">

                <input
                    type="text"
                    class="form-control"
                    id="nombreNuevoJugador"
                    placeholder="Nombre del jugador"
                    maxlength="20"
                >

                <button
                    type="button"
                    class="btn btn-outline-primary"
                    id="btnAgregarJugador"
                    ${game.players.length >= 6 ? 'disabled' : ''}
                >
                    Agregar
                </button>

                </div>

                <div
                class="text-danger small mt-2 d-none"
                id="errorNuevoJugador"
                >
                </div>

            </div>

            </div>

            <!-- Botón iniciar -->
            <button type="button" class="btn btn-primary btn-lg w-100" id="btnIniciarPartida" ${game.players.length < 2 ? 'disabled' : ''}>
                Iniciar partida
            </button>

            <!-- Mensaje mientras faltan jugadores -->
            ${game.players.length < 2 ? `
                <p class="text-center text-secondary mt-3 mb-0" id="mensajeJugadores">
                    Se necesita al menos 2 jugadores.
                </p>
                ` : ''}
        </section>
    </main>
    `;
}