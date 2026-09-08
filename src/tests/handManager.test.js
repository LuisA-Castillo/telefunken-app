//Importar las herramientas de Vitest para las pruebas
import { describe, expect, test } from 'vitest';

//Importar las funciones que se van a probar
import { createHand, createPlayerResult } from '../utils/handManager';

/*
  Pruebas para las reglas correspondientes
  a las manos jugadas.
*/
describe('Hand management', () => {
    test('creates a new hand correctly', () => {
        const game = {
            currentHand: 3,
            dealerIndex: 1,
            players: [
                {
                    name: 'Beto',
                },
                {
                    name: 'Mel',
                },
            ],
        };

        const hand = createHand(game);

        expect(hand.number).toBe(3);

        expect(hand.dealerName).toBe('Mel');

        expect(hand.results).toEqual([]);
    });

    test('creates a result with a complete game', () => {
        const result = createPlayerResult({
            playerName: 'Beto',
            completedGameCode: '1/5',
            points: 18,
            purchasesUsed: 2,
        });

        expect(result.playerName).toBe('Beto');
        expect(result.completedGameCode).toBe('1/5');
        expect(result.points).toBe(18);
        expect(result.purchasesUsed).toBe(2);
    });

    test('creates a penalty result', () => {
        const result = createPlayerResult({
            playerName: 'Mel',
            points: 47,
            purchasesUsed: 1,
        });

        expect(result.completedGameCode).toBe(null);
        expect(result.points).toBe(47);
    });
});