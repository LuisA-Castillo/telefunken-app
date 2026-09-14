import { GAME_STATUS, MAX_PLAYERS } from './gameRules';

/*
  Función que verifica si un nuevo jugador
  puede unirse al juego nuevo.
*/
export function canJoinGame(game) {
    return (game.status === GAME_STATUS.LOBBY && game.players.length < MAX_PLAYERS);
}

/*
  Función que verifica si un nuevo jugador es 
  host para poder administrar el lobby.
*/
export function canManageLobby(game, playerId) {
    return (game.status === GAME_STATUS.LOBBY && game.hostPlayerId === playerId);
}

/*
  Función que verifica si un jugador puede
   abandonar el juego desde el lobby.
*/
export function canLeaveLobby(game, playerId) {
    if(game.status !== GAME_STATUS.LOBBY){
        return false;
    }

    return game.players.some((player) => player.id === playerId)
}