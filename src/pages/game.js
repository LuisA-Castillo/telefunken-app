//Importar funciones de las reglas del juego
import { GAMES, getOrderedGame, arePurchasesAllowed } from '../utils/gameRules';

//Importar funciones del calculo de puntajes
import { getGameScore, getPenaltyScores, getMaxPenaltyCount, getPlayerTotal } from '../utils/gameTable';

//Importar función de finalización del juego
import { isGameFinished } from '../utils/handResults';

//Renderizar la pantalla principal
export function renderGame(game) {
    //Obtenemos al repartidor actual usando dealerIndex
    const dealer = game.players[game.dealerIndex];

    //En modo ordenado se obtiene cuál es el juego correspondiente a la mano actual
    const currentOrderedGame = game.mode === 'ordenado' ? getOrderedGame(game.currentHand) : null;

    //Determinar si en esta mano están permitidas las compras
    const purchasesAllowed = arePurchasesAllowed(game.mode, game.currentHand);

    //Calcular cuántas filas adicionales necesitamos para mostrar las penalizaciones.
    const maxPenaltyCount = getMaxPenaltyCount(game);

    //Verificamos si el juego ha finalizado
    const gameFinished = isGameFinished(game);

    return `
    <main class="container-fluid py-3">
        <!-- Encabezado -->
        <section class="mb-4">
            <div class="d-flex justify-content-between align-content-start flex-wrap gap-2">
                <div>
                    <h1 class="h3 fw-bold mb-1">
                        Telefunken
                    </h1>

                    <p class="text-secondary mb-0">
                        ${game.mode === 'ordenado' ? 'Juego ordenado' : 'Juego libre'}. Mano ${game.currentHand}
                    </p>
                </div>

                <div class="text-end">
                    <small class="text-secondary d-block">
                        Reparte
                    </small>
                    <span class="fw-semibold">
                        ${dealer.name}
                    </span>
                </div>
            </div>
        </section>

        <!-- Compras restantes -->
        <section class="mb-4">
            <h2 class="h6 text-secondary">
                Compras restantes
            </h2>

            ${!purchasesAllowed ? `
                <div class="alert alert-secondary py-2 mb-3" role="alert">
                    En esta mano no se permiten compras.
                </div>    
            ` : ''}

            <div class="d-flex flex-wrap gap-2">
                ${game.players.map((player) => `
                    <span class="badge text-bg-light border">
                        ${player.name}: ${player.purchasesRemaining}
                    </span>    
                `).join('')}
            </div>
        </section>

        <!-- Aquí construimos la tabla -->
        <section>
            <div class="table-responsive">
                <table class="table table-bordered align-middle mb-0 game-table">
                    
                    <thead>
                        <tr>
                            <th class="sticky-game-column game-column">
                                Juego
                            </th>
                            ${game.players.map((player) => `
                                <th class="text-center player-column">
                                    ${player.name}
                                </th>
                            `).join('')}
                        </tr>
                    </thead>

                    <tbody>
                        ${GAMES.map((gameItem) => `
                            <tr class="${currentOrderedGame?.code === gameItem.code ? 'current-game-row' : ''}">
                                <th class="sticky-game-column game-column">
                                    <span class="d-block">
                                        ${gameItem.code}
                                    </span>

                                    <small class="text-secondary">
                                        ${gameItem.name}
                                    </small>
                                </th>
                                ${game.players.map((player) => {
                                    /*
                                        Obtenemos el puntaje que tiene
                                        este jugador para este juego.
                                    */
                                    const score = getGameScore(game, player.name, gameItem.code);

                                    let displayedScore = '';

                                    if(score === 0){
                                        displayedScore = '—';
                                    }
                                    else if(score !== null){
                                        displayedScore = score
                                    }

                                    return `
                                        <td class="text-center score-cell">
                                            ${displayedScore}
                                        </td>    
                                    `
                                }).join('')}
                            </tr>    
                        `).join('')}

                        <!-- Penalizaciones para el modo libre -->
                        ${game.mode === 'libre' 
                            ? Array.from({length: maxPenaltyCount}).map((_, penaltyIndex) => `
                            <tr>
                                <th class="sticky-game-column">
                                </th>

                                ${game.players.map((player) => {
                                    /*Obtener todas las penalizaciones del jugador*/
                                    const penalties = getPenaltyScores(game, player.name);

                                    /*Buscar la penalización de esa fila*/
                                    const penalty = penalties[penaltyIndex];

                                    /*Si no tiene penalización en esa posición la celda queda vacía*/
                                    const displayedPenalty = penalty === undefined ? '' : penalty

                                    return `
                                        <td class="text-center score-cell">
                                            ${displayedPenalty}
                                        </td>    
                                    `;
                                }).join('')}
                            </tr>
                        `).join('') : ''}
                        
                        <!-- Total acumulado -->
                        <tr class="fw-bold">
                            <th class="sticky-game-column game-column">
                                TOTAL
                            </th>
                            ${game.players.map((player) => `
                                <td class="text-center score-cell">
                                    ${getPlayerTotal(game, player.name)}
                                </td>    
                            `).join('')}
                        </tr>
                    </tbody>
                </table>
            </div>
        </section>

        <!-- Finalizar la mano -->
        <section class="mt-4">
            ${!gameFinished ? `
                <button type="button" class="btn btn-primary btn-lg w-100" id="btnFinalizarMano">
                    Finalizar mano
                </button>
            ` : `
                <div class="alert alert-success text-center mb-0">
                    Partida finalizada
                </div>

                <button type="button" class="btn btn-primary w-100" id="btnVerResultadosFinales">
                    Ver resultados finales 
                </button>
            `}
        </section>
    </main>
    `;
}