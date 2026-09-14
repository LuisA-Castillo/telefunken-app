import { canLeaveLobby } from './lobbyPermissions';

/*
  Función que recibe el juego actual y el Id del jugador
  para validar y que pueda salir del juego voluntariamente 
  siempre y cuando aún está en el lobby sin iniciar el juego.
*/
export function leaveLobby(game, playerId) {
    //Comprobar que el jugador pueda salir
    if(!canLeaveLobby(game, playerId)){
        return false;
    }

    //Buscar la posición del jugador 
    const playerIndex = game.players.findIndex((player) => player.id === playerId);

    //Por seguridad si no lo encuentra no se hace nada
    if(playerIndex === -1){
        return false;
    }

    //Comprobar si quien sale es el host actual
    const leavingPlayerIsHost = game.hostPlayerId === playerId;

    //Eliminar al jugador del lobby
    game.players.splice(playerIndex, 1);

    //Si salió el host y todavía hay jugadores el siguiente jugador en el orden actual se convierte en el nuevo host
    if(leavingPlayerIsHost && game.players.length > 0){
        const newHostIndex = playerIndex % game.players.length;

        game.hostPlayerId = game.players[newHostIndex].id;
    }

    //Si el host era el único jugador, la partida queda sin jugadores
    if(game.players.length === 0){
        game.hostPlayerId = null;
    }

    return true;
}