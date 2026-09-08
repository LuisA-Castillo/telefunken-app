//Importar las herramientas de Vitest para las pruebas
import { describe, expect, test } from 'vitest';

//Importar las funciones que se van a probar
import { getPlayerResults, getGameScore, getPenaltyScores, getMaxPenaltyCount, getPlayerTotal } from '../utils/gameTable';

//Creamos una partida
const game = {
    players: [
        {
            name: 'Beto',
        },
        {
            name: 'Mel',
        },
    ],
    hands: [
        {
            number: 1,
            results: [
                {
                    playerName: 'Beto',
                    completedGameCode: '1/3',
                    points: 34,
                    purchasesUsed: 1,
                },
                {
                    playerName: 'Mel',
                    completedGameCode: '1/3',
                    points: 0,
                    purchasesUsed: 0,
                },
            ],
        },
        {
            number: 2,
            results: [
                {
                    playerName: 'Beto',
                    completedGameCode: null,
                    points: 52,
                    purchasesUsed: 1,
                },
                {
                    playerName: 'Mel',
                    completedGameCode: '2/3',
                    points: 18,
                    purchasesUsed: 2,
                },
            ],
        },
        {
            number: 3,
            results: [
                {
                    playerName: 'Beto',
                    completedGameCode: '1/5',
                    points: 11,
                    purchasesUsed: 0,
                },
                {
                    playerName: 'Mel',
                    completedGameCode: null,
                    points: 27,
                    purchasesUsed: 1,
                },
            ],
        },
        {
            number: 4,
            results: [
                {
                    playerName: 'Beto',
                    completedGameCode: null,
                    points: 31,
                    purchasesUsed: 0,
                },
                {
                    playerName: 'Mel',
                    completedGameCode: '1/4',
                    points: 22,
                    purchasesUsed: 0,
                },
            ],
        },
    ],
};

/*
  Pruebas para los cálculos de puntos de 
  cada jugador en la tabla.
*/
describe('Game table calculations', () => {
    test('get all results for one player', () => {
        const results = getPlayerResults(game, 'Beto');

        expect(results.length).toBe(4);
    });

    test('get the score of a completed game', () => {
        expect(getGameScore(game, 'Beto', '1/3')).toBe(34);
    });

    test('returns zero when the player closed with zero points', () => {
        expect(getGameScore(game, 'Mel', '1/3')).toBe(0);
    });

    test('return null when the game has not been completed', () => {
        expect(getGameScore(game, 'Beto', '2/3')).toBe(null);
    });

    test('get penalties separately', () => {
        expect(getPenaltyScores(game, 'Beto')).toEqual([52, 31]);
        expect(getPenaltyScores(game, 'Mel')).toEqual([27]);
    });

    test('gets the maximum number of penalty rows', () => {
        expect(getMaxPenaltyCount(game)).toBe(2);
    });

    test('calculates the player total', () => {
        expect(getPlayerTotal(game, 'Beto')).toBe(128);
        expect(getPlayerTotal(game, 'Mel')).toBe(67);
    });
});
