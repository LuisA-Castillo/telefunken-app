import { getPlayerTotal } from '../utils/gameTable';

/*
  Función que renderiza la pantalla 
  final de una partida terminada.
*/
export function renderFinalResults(game, winners) {
    //Crear copia de jugadores y ordenarlos de mayor a menor
    //Se usa [...game.players] para no modificar el orden original de juego
    const ranking = [...game.players].sort((playerA, playerB) => {
        const totalA = getPlayerTotal(game, playerA.name);
        const totalB = getPlayerTotal(game, playerB.name);

        //En modo libre se prioriza quien completó los juegos
        if(game.mode === 'libre'){
            const completedA = getCompletedGamesCount(game, playerA.name);
            const completedB = getCompletedGamesCount(game, playerB.name);

            //La mayor cantidad de juegos completados va primero
            if(completedA !== completedB){
                return completedB - completedA;
            }
        }

        return totalA - totalB;
    });

    //Extraer nombre de los ganadores.
    const winnerNames = winners.map((player) => player.name);

    //Si existe más de un ganador se muestra un mensaje de empate
    const winnerMessage = winners.length === 1 ? `Ganador: ${winners[0].name}` : `Empate: ${winnerNames.join(', ')}`;

    return `
    <div class="container py-4">
        <div class="text-center mb-4">
            <h1 class="fw-bold">
                TELEFUNKEN
            </h1>

            <p class="text-muted mb-0">
                Partida finalizada
            </p>
        </div>

        <div class="card shadow-sm mb-4">
            <div class="card-body text-center">
                <h2 class="h4 mb-2">
                    ${winnerMessage}
                </h2>

                <p class="text-muted mb-0">
                    ${game.mode === 'ordenado' ? 'Modo ordenado' : 'Modo libre'}
                </p>
            </div>
        </div>

        <div class="card shadow-sm">
            <div class="card-body">
                <h2 class="h5 mb-3">
                    Clasificación final
                </h2>

                <div class="table-responsive">
                    <table class="table align-middle mb-0">
                        <thead>
                            <tr>
                                <th>Posición</th>
                                <th>Jugador</th>
                                <th class="text-end">Puntos</th>
                            </tr>
                        </thead>

                        <tbody>
                            ${ranking.map((player, index) => {
                                const total = getPlayerTotal(game, player.name);

                                const isWinner = winnerNames.includes(player.name);

                                return `
                                <tr class="${isWinner ? 'table-success' : ''}">
                                    <td>${index + 1}</td>
                                    <td>
                                        ${player.name}
                                        ${isWinner ? `<span class="badge text-bg-success ms-2">Ganador</span>` : ''}
                                    </td>
                                    <td class="text-end fw-semibold">${total}</td>
                                </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <button type="button" class="btn btn-outline-secondary w-100 mt-4" id="btnVolverTabla">
            Ver tabla final
        </button>
    </div>
    `;
}

/*
  Función de ayuda que permite contar
  los juegos completados para poder 
  ordenar los resultados en modo libre.
*/
function getCompletedGamesCount(game, playerName) {
    const completedCodes = game.hands.flatMap((hand) => hand.results
    .filter((result) => result.playerName === playerName))
    .filter((result) => result.completedGameCode !== null)
    .map((result) => result.completedGameCode);

    return new Set(completedCodes).size;
}