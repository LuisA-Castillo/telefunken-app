import { getOrderedGame, arePurchasesAllowed } from '../utils/gameRules';
import { getPendingGames } from "../utils/gameTable";
/*
  Función que renderiza los campos de resultado
  para un jugador en modo ordenado.
*/
function renderOrderedPlayerResult(player, currentGame, purchasesAllowed) {
    return `
    <p class="text-secondary mb-3">
        Juego:
        <strong>
            ${currentGame.code}. ${currentGame.name}
        </strong>
    </p>

    <div class="row g-3">
        <!-- Puntos -->
        <div class="col-6">
            <label for="points-${player.name}" class="form-label">
                Puntos
            </label>

            <input type="number" id="points-${player.name}" class="form-control" min="0" step="1" inputmode="numeric">
        </div>

        <!-- Compras utilizadas -->
        ${purchasesAllowed ? `
            <div class="col-6">
                <label for="purchases-${player.name}" class="form-label">
                    Compras
                </label>

                <input type="number" class="form-control" id="purchases-${player.name}" min="0" step="1" max="${player.purchasesRemaining}" inputmode="numeric" value="0">

                <div class="form-text">
                    Disponibles: ${player.purchasesRemaining}
                </div>
            </div> 
        ` : `
            <div class="col-6">
                <label class="form-label">
                    Compras
                </label>
                
                <div class="form-text mt-2">
                    En esta mano no se permiten compras.
                </div>
            </div>
        `
        }  
    </div>
    `;
}

/*
  Función que renderiza los campos de resultado
  para un jugador en modo libre.
*/
function renderFreePlayerResult(game, player) {
    const pendingGames = getPendingGames(game, player.name);
    
    return `
    <!-- ¿Completó un juego? -->
    <div class="d-flex gap-3 mb-3">
        <label class="form-label">
            ¿Completó un juego?
        </label>

        <div class="form-check">
            <input type="radio" name="completed-${player.name}" id="completedYes-${player.name}" value="yes" class="form-check-input">

            <label for="completedYes-${player.name}" class="form-check-label">
                Sí
            </label>
        </div>

        <div class="form-check">
            <input type="radio" name="completed-${player.name}" id="completedNo-${player.name}" value="no" class="form-check-input">

            <label for="completedNo-${player.name}" class="form-check-label">
                No
            </label>
        </div>
    </div>

    <div class="row g-3">
        <!-- Juego completado -->
        <div class="col-4">
            <label for="game-${player.name}" class="form-label">
                Juego
            </label>

            <select id="game-${player.name}" class="form-select" disabled>
                <option value="">
                    Selecciona un juego
                </option>

                ${pendingGames.map((gameItem) => `
                    <option value="${gameItem.code}">
                        ${gameItem.code}
                    </option>
                `).join('')}
            </select>
        </div>
    
        <!-- Puntos -->
        <div class="col-4">
            <label for="points-${player.name}" class="form-label">
                Puntos
            </label>

            <input type="number" class="form-control" id="points-${player.name}" min="0" step="1" inputmode="numeric">
        </div>

        <!-- Compras utiizadas -->
        <div class="col-4">
            <label for="purchases-${player.name}">
                Compras
            </label>

            <input type="number" class="form-control" id="purchases-${player.name}" min="0" step="1" inputmode="numeric" value="0">

            <div class="form-text">
                Disponibles: ${player.purchasesRemaining}
            </div>
        </div>
    </div>
    `;
}

/*
  Función que renderiza la pantalla donde se 
  registrarán los resultados de una mano.
*/
export function renderHandResults(game) {
    const dealer = game.players[game.dealerIndex];

    //Obtener el juego correspondiente a esta mano, en modo ordenado
    const currentOrderedGame = game.mode === 'ordenado' ? getOrderedGame(game.currentHand) : null;

    //Determinar si esta mano permite registrar compras
    const purchasesAllowed = arePurchasesAllowed(game.mode, game.currentHand);

    return `
    <main class="container py-3">
        <!-- Encabezado -->
        <section class="mb-4">
            <h1 class="h3 fw-bold mb-1">
                Finalizar mano
            </h1>

            <p class="text-secondary mb-0">
                Mano ${game.currentHand}
            </p>

            <small class="text-secondary">
                Repartió: ${dealer.name}
            </small>
        </section>

        <!-- Motivo de finalización -->
        <section class="card mb-4">
            <div class="card-body">
                <h2 class="h5 mb-3">
                    ¿Cómo terminó la mano?
                </h2>

                <div class="form-check mb-2">
                    <input type="radio" name="endReason" id="endReasonPlayerOut" value="player_out" class="form-check-input">

                    <label for="endReasonPlayerOut" class="form-check-label">
                        Un jugador ganó la mano
                    </label>
                </div>

                <div class="form-check">
                    <input type="radio" name="endReason" id="endReasonDeckExhausted" value="draw_pile_exhausted" class="form-check-input">

                    <label for="endReasonDeckExhausted" class="form-check-label">
                        Se agotó el mazo después de dos barajadas
                    </label>
                </div>
            </div>
        </section>

        <!-- Resultados por jugador -->
        <section>
            <h2 class="h5 mb-3">
                Resultados
            </h2>

            ${game.players.map((player) => `
                <div class="card mb-3">
                    <div class="card-body">
                        <h3 class="h6 fw-bold">
                            ${player.name}
                        </h3>

                        ${game.mode === 'ordenado' ? renderOrderedPlayerResult(player, currentOrderedGame, purchasesAllowed) : renderFreePlayerResult(game, player)}
                    </div>
                </div>
            `).join('')}
        </section>

        <!-- Acciones -->
        <section class="mt-4">
            <button type="button" id="btnVolverJuego" class="btn btn-outline-secondary w-100 mb-2">
                Volver
            </button>
        
            <button type="button" id="btnGuardarResultados" class="btn btn-primary w-100">
                Guardar resultados
            </button>
        </section>
    </main>
    `;
}