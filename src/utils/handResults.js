import { getPlayerResults, getPlayerTotal } from './gameTable';
import { GAMES } from './gameRules';

/*
  Función que crea el resultado de un 
  jugador correspondiente a una mano.
*/
export function createPlayerResult(playerId, completedGameCode, points, purchasesUsed) {
    return {
        playerId,
        completedGameCode,
        points,
        purchasesUsed,
    };
}

/*
  Función que valida los datos introducidos
  para el resultado de un jugador.
*/
export function validatePlayerResult(completedGameCode, points, purchasesUsed, purchasesRemaining, gameCompleted) {
    //Puntos obligatorios y no negativos
    if(points === '' || Number(points) < 0){
        return false;
    }

    //Compras no negativas
    if(Number(purchasesUsed) < 0) {
        return false;
    }

    //No se puede resgistrar mas compras de las q le sobran al jugador
    if(Number(purchasesUsed) > purchasesRemaining){
        return false;
    }

    //Si completó el juego debe escoger el juego que completó
    if(gameCompleted && !completedGameCode){
        return false;
    }

    return true;
}

/*
  Función que guarda los resultados de la mano 
  actual dentro del historial de la partida.
*/
export function saveHandResults(game, endReason, results) {
    //Crear el objeto q representa la mano finalizada
    const hand = {
        numbre: game.currentHand,
        dealerIndex: game.dealerIndex,
        endReason,
        results
    };

    //Añadir la mano al historial
    game.hands.push(hand);

    //Descontar las compras utilizadas
    results.forEach((result) => {
        const player = game.players.find((player) => player.id === result.playerId);

        if(player){
            player.purchasesRemaining -= result.purchasesUsed;
        }
    });

    return hand;
}

/*
  Función que valida que si un jugador resulta ganador de la mano, 
  entonces debe existir un único jugador en esa mano que tenga 0 puntos.
  Si la mano acaba porque ya se barajó dos veces, entonces, no debe existir
  ningún jugador con 0 puntos.
*/
export function validateHandResults(endReason, results) {
    const zeroScoreCount = results.filter((result) => result.points === 0).length;

    if(endReason === 'player_out'){
        return zeroScoreCount === 1;
    }

    if(endReason === 'draw_pile_exhausted'){
        return zeroScoreCount === 0;
    }

    return false;
}

/*
  Función para avanzar la partida a la siguiente mano
  y rota el repartidor hacia la derecha.
*/
export function advanceToNextHand(game) {
    //Incrementar el número de mano
    game.currentHand += 1;

    //Cambia el repartidor a la derecha o al siguiente
    /*
      Usamos módulo (%) para que,
      después del último jugador,
      vuelva automáticamente al primero.
    */
    game.dealerIndex = (game.dealerIndex + 1) % game.players.length;

    return game;
}

/*
  Función que determina si la partida ha 
  terminado después de guardar una mano.
*/
export function isGameFinished(game) {
    /*
      MODO ORDENADO

      La partida termina cuando ya se
      han GUARDADO los resultados
      de los siete juegos.
    */
    if(game.mode === 'ordenado'){
        return game.hands.length >= GAMES.length;
    }

    /*
      MODO LIBRE

      La partida termina cuando al menos
      un jugador ha completado los
      siete juegos.
    */
    if(game.mode === 'libre'){
        return game.players.some((player) => {
            //Obtener todos los resultados de ese jugador
            const playerResults = game.hands.flatMap((hand) => hand.results.filter((result) => result.playerId === player.id));

            //Separamos solo los juegos completados
            const completedGames = playerResults.filter((result) => result.completedGameCode !== null);

            const completedGameCodes = completedGames.map((result) => result.completedGameCode);

            const uniqueCompletedGames = new Set(completedGameCodes);

            return uniqueCompletedGames.size >= 7
        });
    }

    return false;
}

/*
  Función que obtiene los jugadores ganadores
  de una partida que ya ha terminado.

  Devuelve un arreglo ya que podría
  existir un empate.
*/
export function getGameWinners(game) {
    let candidates = [];

    /*
      MODO ORDENADO

      Todos los jugadores podrían ganar.
    */
    if(game.mode === 'ordenado'){
        candidates = game.players;
    }
    /*
      MODO LIBRE

      Solo pueden ganar los jugadores
      que hayan completado los siete juegos.
    */
    else if(game.mode === 'libre'){
        candidates = game.players.filter((player) => {
            const results = getPlayerResults(game, player.id);

            const completedGameCodes = results.filter((result) => result.completedGameCode !== null).map((result) => result.completedGameCode);

            //Se elimina posibles códigos repetidos
            const uniqueCompletedGames = new Set(completedGameCodes);

            return (uniqueCompletedGames.size >= 7);
        });
    }

    //Si por alguna razón no hay candidatos, no continuamos
    if(candidates.length === 0){
        return [];
    }

    //Calcular el menor puntaje entre los candidatos
    const lowestScore = Math.min(...candidates.map((player) => getPlayerTotal(game, player.id)));

    //Devolver todos los jugadores que tiene ese puntaje mínimo 
    return candidates.filter((player) => getPlayerTotal(game, player.id) === lowestScore);
}