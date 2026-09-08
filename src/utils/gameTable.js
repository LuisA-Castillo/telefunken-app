/*
  Función que obtiene todos los resultados registrados
  para un jugador a lo largo de la partida.
*/
export function getPlayerResults(game, playerName) {
    /*
      flatMap recorre todas las manos
      y devuelve un único arreglo
      con los resultados encontrados.
    */
   return game.hands.flatMap((hand) => 
    hand.results.filter((result) => result.playerName === playerName)
   );
}

/*
  Función que obtiene el puntaje registrado
  por un jugador para un juego específico.
*/
export function getGameScore(game, playerName, gameCode) {
    const results = getPlayerResults(game, playerName);

    //Buscamos el resultado asociado al juego solicitado.
    const result = results.find((playerResult) => playerResult.completedGameCode === gameCode);

    /*
      Si todavía no completó ese juego,
      devolver null.

      Es importante devolver null y no 0,
      porque 0 sí es un puntaje válido:
      significa que el jugador cerró.
    */
    if (!result){
        return null;
    }

    return result.points;
}

/*
  Función que obtiene todas las penalizaciones
  de un jugador en el orden
  en que ocurrieron durante la partida.

  Solo en modo libre.
*/
export function getPenaltyScores(game, playerName){
    const results = getPlayerResults(game, playerName);

    //Dejar únicamente los resultados sin juego completado.
    const penalties = results
    .filter((result) => result.completedGameCode === null)
    .map((result) => result.points);

    //Sumar sus puntos
    return penalties;
}

/*
  Función que obtiene la mayor cantidad de penalizaciones
  registradas por un mismo jugador.

  Esto nos permite saber cuántas filas
  de penalización necesita la tabla.
*/
export function getMaxPenaltyCount(game){
    const penaltyCounts = game.players.map((player) => 
        getPenaltyScores(game, player.name).length);

    if(penaltyCounts.length === 0){
        return 0;
    }

    return Math.max(...penaltyCounts);
}

/*
  Función que calcula el puntaje 
  total acumulado por un jugador.
*/
export function getPlayerTotal(game, playerName){
    const results = getPlayerResults(game, playerName);

    return results.reduce((total, result) => total + result.points, 0);
}