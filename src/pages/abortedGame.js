//Renderizar la pantalla principal
export function renderAbortedGame(game) {
    return `
    <div class="container py-4">
        <div class="text-center">
            <h1 class="h3 mb-3">
                Partida finalizada
            </h1>

            <p class="text-secondary">
                Esta partida fue finalizada antes de completartodos los juegos.
            </p>

            <div class="alert alert-warning mt-4">
                Esta partida no será tomada en cuenta para las estadísticas.
            </div>
        </div>

        <div class="card mt-4">
            <div class="card-body">
                <p class="mb-2">
                    <strong>
                        Código:
                    </strong>
                    ${game.code}
                </p>

                <p class="mb-2">
                    <strong>
                        Modalidad:
                    </strong>
                    ${game.mode === 'ordenado' ? 'Juego ordenado' : 'Juego libre'}
                </p>

                <p class="mb-0">
                    <strong>
                        Manos registradas:
                    </strong>
                    ${game.hands.length}
                </p>
            </div>
        </div>

        <button type="button" class="btn btn-outline-secondary w-100 mt-4" id="btnVerPartidaInterrumpida">
            Ver tabla
        </button>
    </div>
    `;
}