//Importar la función que determina las compras iniciales según la modalidad
import { getInitialPurchases } from './gameRules';

/*
  Función que inicializa los datos 
  necesarios cuando una partida comienza.

  Recibe el objeto game que construimos
  anteriormente en Crear partida y Lobby.
*/
export function initializeGame(game) {
    //Obtener la cantidad inicial de las compras, según la modalidad
    const initialPurchases = getInitialPurchases(game.mode);

    //Indicar que la partida ya inició
    game.started = true;

    //La primera mano
    game.currentHand = 1;

    //Obtener al jugador que reparte en el arreglo de jugadores (primero), sabiendo que el orden del arreglo es el orden alrededor de la mesa
    game.dealerIndex = 0;

    //Almacenar todas las manos que se vaya cerrando durante la partida
    game.hands = [];

    //Recorrer el arreglo de jugadores y añadir la información necesaria en la partida
    game.players.forEach((player) => {
        //Compras que aún le quedan
        player.purchasesRemaining = initialPurchases;
        
        //Puntaje acumulado de la partida
        player.totalScore = 0;

        //Juegos completados
        player.completedGames = [];

        //Penalizaciones del modo libre
        player.penalties = [];
    });

    //Devolver la misma partida ya inicializada, con la información ya añadida
    return game;
}