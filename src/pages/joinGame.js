/*
  Renderizar la pantalla que permite
  a un jugador ingresar a una partida
  que ya fue encontrada en Firestore.
*/
export function renderJoinGame(game){
    //Buscar al anfitrión
    const hostPlayer = game.players.find((player) => player.id === game.hostPlayerId);

    //Establecer el texto de la modalidad de la partida
    const modeName = game.mode === 'ordenado' ? 'Juego ordenado' : 'Juego libre';

    //Contruir el HTML de la pantalla
    return `
    <div class="container py-4">
        <button type="button" class="btn btn-link px-0 mb-3" id="btnVolverInicio">
            ← Volver
        </button>

        <h1 class="h4 mb-2">
            Unirse a la partida
        </h1>

        <p class="text-secondary">
            Ingresa tu nombre para entrar al lobby.
        </p>

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

                    ${modeName}
                </p>

                <p class="mb-2">
                    <strong>
                        Anfitrión:
                    </strong>

                    ${hostPlayer?.name ?? ''}
                </p>

                <p class="mb-0">
                    <strong>
                        Jugadores:
                    </strong>

                    ${game.players.length}/6
                </p>
            </div>
        </div>

        <div class="mb-3">
            <label for="nombreJugador" class="form-label mb-1">
                Tu nombre
            </label>

            <input type="text" class="form-control" id="nombreJugador" placeholder="Ingresa tu nombre" autocomplete="off">
        </div>

        <div class="alert alert-danger d-none mt-3" id="mensajeErrorJoin" role="alert">

        </div>

        <button type="button" class="btn btn-primary w-100 mt-4" id="btnConfirmarUnion">
            Unirme a la partida
        </button>
    </div>
    `;
}