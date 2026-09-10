/*
  Función que crea la estructura de una nueva mano.

*/
export function createHand(game) {
    //Obtener el repartidor actual a partir de dealerIndex
    const dealer = game.players[game.dealerIndex];

    //Crear y retornar la mano
    return {
        //Número de mano
        number: game.currentHand,
        //Repartidor de cartas de esa mano
        dealerName: dealer.name,

        /*
          Más adelante aquí guardaremos
          por qué terminó la mano.

          Ejemplos:
          - player_out
          - draw_pile_exhausted
        */
       endReason: null,
       //Resultado por jugador
       results: [],
    };
}

/*
  Función que crea el resultado de un 
  jugador dentro de una mano.
*/
export function createPlayerResult({
    playerId,
    completedGameCode = null,
    points,
    purchasesUsed = 0,
}) {
    return {
        //Jugador al que le pertenece el resultado
        playerId,
        /*
          Código del juego completado.

          En modo ordenado siempre habrá
          un juego asociado.

          En modo libre puede ser null
          cuando el jugador no completó
          ningún juego y recibe penalización.
        */
       completedGameCode,
       //Puntos con los que completó esa mano
       points,
       //Cantidad de compras utilizadas en esa mano
       purchasesUsed,
    };
}