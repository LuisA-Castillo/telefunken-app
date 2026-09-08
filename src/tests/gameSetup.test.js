//Importar las herramientas de Vitest para las pruebas
import { describe, expect, test } from 'vitest';

//Importar las funciones que se van a probar
import { initializeGame } from '../utils/gameSetup';

/*
  Pruebas para inicializar un juego.
*/
describe('Game initialization', () => {
    test('initializes a free game correctly', () => {
        const game = {
            mode: 'libre',
            players: [
                {
                    name: 'Beto',
                    isHost: true
                },
                {
                    name: 'Mel',
                    isHost: false
                },
            ],
        };

        initializeGame(game);

        //Se debe inicializar la partida
        expect(game.currentHand).toBe(1);

        //El primer jugador será el repartidor
        expect(game.dealerIndex).toBe(0);

        //En el modo libre todos inician con 7 compras
        expect(game.players[0].purchasesRemaining).toBe(7);
        expect(game.players[1].purchasesRemaining).toBe(7);

        //Todos inician con 0 puntos
        expect(game.players[0].totalScore).toBe(0);
        expect(game.players[1].totalScore).toBe(0);
    });

    test('ordered mode starts with 12 purchases', () => {
        const game = {
            mode: 'ordenado',
            players: [
                {
                    name: 'Beto',
                    isHost: true
                },
                {
                    name: 'Mel',
                    isHost: false
                },
            ],
        };

        initializeGame(game);

        expect(game.players[0].purchasesRemaining).toBe(12);
        expect(game.players[1].purchasesRemaining).toBe(12);
    });
});