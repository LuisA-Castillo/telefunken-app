import { getInitialPurchases } from './gameRules';
import { generateGameCode } from './gameCode';
/*
  Función que toma al ganador de la partida
  anterior y lo pone primero para crear una
  nueva partida.
*/
export function createNextGame(previousGame, winners) {
    /*
      Tomar los ids de los ganadores y recorrer los jugadores de la partida anterior
      en el órden original para encontrar la primera coincidencia.
    */
    const winnerIds = winners.map((winner) => winner.id);

    const firstWinner = previousGame.players.find((player) => winnerIds.includes(player.id));

    //Reordenar a los jugadores en base al anterior juego y al ganador
    const winnerIndex = previousGame.players.findIndex((player) => player.id === firstWinner.id)
    
    const reorderedPlayers = [
        ...previousGame.players.slice(winnerIndex),
        ...previousGame.players.slice(0, winnerIndex),
    ];

    const initialPurchases = getInitialPurchases(previousGame.mode);

    //Reinicializar compras, juegos y totales
    const resetPlayers = reorderedPlayers.map((player) => ({
        ...player,
        purchasesRemaining: initialPurchases,
        totalScore: 0,
        completedGames: [],
        penalties: [],
    }));

    return {
        code: generateGameCode(),
        mode: previousGame.mode,
        host: previousGame.host,
        status: 'lobby',
        started: false,
        currentHand: 0,
        dealerIndex: 0,
        players: resetPlayers,
        hands: [],
    };
}