import { GAME_STATUS } from "./gameRules";

/*
  Función para saber si un jugador 
  puede abortar la partida
*/
export function canAbortGame(game, playerId) {
    const player = game.players.find((player) => player.id === playerId);

    //La partida debe estar en progreso y El jugador que intenta abortarla debe ser el host.
    return (game.status === GAME_STATUS.IN_PROGRESS && game.hostPlayerId === playerId);
}

/*
  Función para finalizar un juego 
*/
export function finishGame(game) {
    game.status = GAME_STATUS.FINISHED;
    game.statisticsEligible = true;
    game.endReason = 'completed';

    return game;
}

/*
  Función para abortar un juego 
*/
export function abortGame(game, playerId) {
    if(!canAbortGame(game, playerId)){
        return false;
    }

    game.status = GAME_STATUS.ABORTED;
    game.statisticsEligible = false;
    game.endReason = 'forced';
    game.endedByPlayerId = playerId;

    return true;
}