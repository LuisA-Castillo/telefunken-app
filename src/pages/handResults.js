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
        <div class="col-6 d-flex flex-column">
            <label for="points-${player.id}" class="form-label">
                Puntos
            </label>

            <input type="number" id="points-${player.id}" class="form-control" min="0" step="1" inputmode="numeric" max="999">
        </div>

        <!-- Compras utilizadas -->
        ${purchasesAllowed ? `
            <div class="col-6 d-flex flex-column">
                <label for="purchases-${player.id}" class="form-label">
                    Compras
                </label>

                <input type="number" class="form-control" id="purchases-${player.id}" min="0" step="1" max="${player.purchasesRemaining}" inputmode="numeric">

                <div class="form-text">
                    Disponibles: 
                    <strong>
                        ${player.purchasesRemaining}.
                    </strong>
                    Ingresa 0 si no realizaste compras.
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
    const pendingGames = getPendingGames(game, player.id);
    
    return `
    <!-- ¿Completó un juego? -->
    <div class="d-flex gap-3 mb-3">
        <label class="form-label">
            ¿Completó un juego?
        </label>

        <div class="form-check">
            <input type="radio" name="completed-${player.id}" id="completedYes-${player.id}" value="yes" class="form-check-input">

            <label for="completedYes-${player.id}" class="form-check-label">
                Sí
            </label>
        </div>

        <div class="form-check">
            <input type="radio" name="completed-${player.id}" id="completedNo-${player.id}" value="no" class="form-check-input">

            <label for="completedNo-${player.id}" class="form-check-label">
                No
            </label>
        </div>
    </div>

    <div class="row g-3">
        <!-- Juego completado -->
        <div class="col-12 col-md-4 d-flex flex-column">
            <label for="game-${player.id}" class="form-label">
                Juego
            </label>

            <select id="game-${player.id}" class="form-select" disabled>
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
        <div class="col-12 col-md-4 d-flex flex-column">
            <label for="points-${player.id}" class="form-label">
                Puntos
            </label>

            <input type="number" class="form-control" id="points-${player.id}" min="0" step="1" inputmode="numeric" max="999">
        </div>

        <!-- Compras utiizadas -->
        <div class="col-12 col-md-4 d-flex flex-column">
            <label for="purchases-${player.id}" class="form-label">
                Compras
            </label>

            <input type="number" class="form-control" id="purchases-${player.id}" min="0" max="${player.purchasesRemaining}" step="1" inputmode="numeric">

            <div class="form-text">
                Disponibles: 
                <strong>
                    ${player.purchasesRemaining}.
                </strong>
                Ingresa 0 si no realizaste compras.
            </div>
        </div>
    </div>
    `;
}

/*
  Función que renderiza la pantalla donde EL JUGADOR ACTUAL 
  registra únicamente su propio resultado.
*/
export function renderHandResults(game, player, hand) {
    //Obtener el repartidor de esta mano
    const dealer = game.players[game.dealerIndex];

    //Obtener el juego correspondiente a esta mano, en modo ordenado
    const currentOrderedGame = game.mode === 'ordenado' ? getOrderedGame(game.currentHand) : null;

    //Determinar si esta mano permite registrar compras
    const purchasesAllowed = arePurchasesAllowed(game.mode, game.currentHand);

    //Convertir el código interno del motivo de cierre en un texto comprensible
    const endReasonText = hand.endReason === 'player_out' ? 
    'Un jugador ganó la mano' : 'Se agotó la pila de robo';

    return `
    <main class="container py-3">
        <!-- Encabezado -->
        <section class="mb-4">
            <h1 class="h3 fw-bold mb-1">
                Registrar resultado
            </h1>

            <p class="text-secondary mb-0">
                Mano ${hand.number}
            </p>

            <small class="text-secondary d-block">
                Repartió: ${dealer.name}
            </small>
        </section>
        
        <!-- Información de la mano -->
        <section class="card mb-4">
            <div class="card-body">
                <h2 class="h5 mb-3">
                    Finalización de la mano
                </h2>

                <p class="mb-0">
                    ${endReasonText}
                </p>
            </div>
        </section>

        <!-- Resultado del jugador actual -->
        <section>
            <h2 class="h5 mb-3">
                Tu resultado
            </h2>

            <div class="card">
                <div class="card-body">
                    <h3 class="h6 fw-bold mb-3">
                        ${player.name}
                    </h3>

                    ${game.mode === 'ordenado' ? 
                    renderOrderedPlayerResult(player, currentOrderedGame, purchasesAllowed) : renderFreePlayerResult(game, player)}
                </div>
            </div>
        </section>
        
        <!-- Mensaje de error -->
        <div class="alert alert-danger d-none mt-3" id="errorResultado">

        </div>

        <!-- Acciones -->
        <section class="mt-4">
            <button type="button" id="btnGuardarResultado" class="btn btn-primary w-100">
                Guardar mi resultado
            </button>
        </section>
    </main>
    `;
}