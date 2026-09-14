//Importar las herramientas de Vitest para las pruebas
import { describe, expect, test } from 'vitest';

//Importar las funciones que se van a probar
import { initializeGame } from '../utils/gameSetup';
import { GAME_STATUS } from '../utils/gameRules';

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
                },
                {
                    name: 'Mel',
                },
            ],
        };

        initializeGame(game);

        //Es estado de la partida debe ser in_progress
        expect(game.status).toBe(GAME_STATUS.IN_PROGRESS);

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
                },
                {
                    name: 'Mel',
                },
            ],
        };

        initializeGame(game);

        expect(game.players[0].purchasesRemaining).toBe(12);
        expect(game.players[1].purchasesRemaining).toBe(12);
    });
});