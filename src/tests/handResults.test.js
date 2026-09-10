//Importar las herramientas de Vitest para las pruebas
import { describe, expect, test } from 'vitest';

//Importar las funciones que se van a probar
import { createPlayerResult, createPlayerResult, validatePlayerResult, saveHandResults, validateHandResults, advanceToNextHand, isGameFinished, getGameWinners } from '../utils/handResults';

/*
  Pruebas para obtener los resultados
  de una mano, de un jugador específico.
*/
describe('Hand results', () => {
    test('creates a completed game result', () => {
        const result = createPlayerResult(
            'Beto',
            '1/3',
            34,
            2
        );

        expect(result).toEqual({
            playerName: 'Beto',
            completedGameCode: '1/3',
            points: 34,
            purchasesUsed: 2,
        });
    });

    test('creates a penalty result', () => {
        const result = createPlayerResult(
            'Beto',
            null,
            52,
            1
        );

        expect(result).toEqual({
            playerName: 'Beto',
            completedGameCode: null,
            points: 52,
            purchasesUsed: 1,
        });
    });

    test('accepts a valid player result', () => {
        expect(validatePlayerResult('1/3', '34', '2', 7, true)).toBe(true);
    });

    test('rejects empty points', () => {
        expect(validatePlayerResult('1/3', '', '2', 7, true)).toBe(false);
    });

    test('rejects purchases greater than remaining', () => {
        expect(validatePlayerResult('1/3', '34', '8', 7, true)).toBe(false);
    });

    test('rejects completed game without game code', () => {
        expect(validatePlayerResult('', '34', '1', 7, true)).toBe(false);
    });

    test('saves hand results and updates purchases', () => {
        const game = {
            currentHand: 1,
            dealerIndex: 0,
            hands: [],
            players: [
                {
                    name: 'Beto',
                    purchasesRemaining: 7,
                },
                {
                    name: 'Mel',
                    purchasesRemaining: 7,
                },
            ],
        };

        const results = [
            {
                playerName: 'Beto',
                completedGameCode: null,
                points: 52,
                purchasesUsed: 1,
            },
            {
                playerName: 'Mel',
                completedGameCode: '1/3',
                points: 18,
                purchasesUsed: 2,
            },
        ];

        const hand = saveHandResults(game, 'player_out', results);

        expect(game.hands.length).toBe(1);
        
        expect(hand.numbre).toBe(1);

        expect(hand.results).toEqual(results);

        expect(game.players[0].purchasesRemaining).toBe(6);

        expect(game.players[1].purchasesRemaining).toBe(5);
    });

    test('accepts player out with exactly one zero score', () => {
        const results = [
            { points: 34 },
            { points: 0 },
            { points: 18 },
        ];

        expect(validateHandResults('player_out', results)).toBe(true);
    });

    test('rejects player out without zero score', () => {
        const results = [
            { points: 34 },
            { points: 27 },
            { points: 18 },
        ];

        expect(validateHandResults('player_out', results)).toBe(false);
    });

    test('rejects player out with multiple zero score', () => {
        const results = [
            { points: 0 },
            { points: 0 },
            { points: 18 },
        ];

        expect(validateHandResults('player_out', results)).toBe(false);
    });

    test('accepts exhaust deck without zero scores', () => {
        const results = [
            { points: 34 },
            { points: 27 },
            { points: 18 },
        ];

        expect(validateHandResults('draw_pile_exhausted', results)).toBe(true);
    });

    test('rejects exhaust deck with zero score', () => {
        const results = [
            { points: 34 },
            { points: 0 },
            { points: 18 },
        ];

        expect(validateHandResults('draw_pile_exhausted', results)).toBe(false);
    });

    test('advances hand and rotates dealer', () => {
        const game = {
            currentHand: 1,
            dealerIndex: 0,
            players: [
                { name: 'Beto' },
                { name: 'Mel' },
                { name: 'Luigi' },
            ],
        };

        advanceToNextHand(game);

        expect(game.currentHand).toBe(2);

        expect(game.dealerIndex).toBe(1);
    });

    test('rotates dealer back to the firts player', () => {
        const game = {
            currentHand: 3,
            dealerIndex: 2,
            players: [
                { name: 'Beto' },
                { name: 'Mel' },
                { name: 'Luigi' },
            ],
        };

        advanceToNextHand(game);

        expect(game.currentHand).toBe(4);

        expect(game.dealerIndex).toBe(0);
    });

    test('ordered game finishes on hand seven', () => {
        const game = {
            mode: 'ordenado',
            currentHand: 7,
            players: [],
            hands: [
                {},
                {},
                {},
                {},
                {},
                {},
                {},
            ]
        };

        expect(isGameFinished(game)).toBe(true);
    });

    test('ordered game does not finish before hand seven', () => {
        const game = {
            mode: 'ordenado',
            currentHand: 7,
            players: [],
            hands: [
                {},
                {},
                {},
                {},
                {},
                {},
            ]
        };

        expect(isGameFinished(game)).toBe(false);
    });

    test('free game finishes when a player completes seven games', () => {
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
            hands: [
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '1/3',
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '2/3',
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '1/4',
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '2/4',
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '1/5',
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '2/5',
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: 'ESC',
                        },
                    ],
                },
            ],
        };

        expect(isGameFinished(game)).toBe(true);
    });

    test('free game does not finish with only six completed games', () => {
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
            hands: [
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '1/3',
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '2/3',
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '1/4',
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '2/4',
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '1/5',
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '2/5',
                        },
                    ],
                },
            ],
        };

        expect(isGameFinished(game)).toBe(false);
    });

    test('ordered game winner is player with lowest total score', () => {
        const game = {
            mode: 'ordenado',
            players: [
                { name: 'Beto' },
                { name: 'Mel' },
                { name: 'Luigi' },
            ],
            hands: [
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '1/3',
                            points: 20,
                        },
                        {
                            playerName: 'Mel',
                            completedGameCode: '1/3',
                            points: 0,
                        },
                        {
                            playerName: 'Luigi',
                            completedGameCode: '1/3',
                            points: 30,
                        },
                    ],
                },
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '2/3',
                            points: 15,
                        },
                        {
                            playerName: 'Mel',
                            completeGameCode: '2/3',
                            points: 5,
                        },
                        {
                            playerName: 'Luigi',
                            completedGameCode: '2/3',
                            points: 0,
                        },
                    ],
                }
            ],
        };

        const winners = getGameWinners(game);

        expect(winners.map((player) => player.name)).toEqual(['Mel']);
    });

    test('ordered game can have multiple winners on tied score', () => {
        const game = {
            mode: 'ordenado',
            players: [
                { name: 'Beto' },
                { name: 'Mel' },
                { name: 'Luigi' },
            ],
            hands: [
                {
                    results: [
                        {
                            playerName: 'Beto',
                            completedGameCode: '1/3',
                            points: 20,
                        },
                        {
                            playerName: 'Mel',
                            completedGameCode: '1/3',
                            points: 20,
                        },
                        {
                            playerName: 'Luigi',
                            completedGameCode: '1/3',
                            points: 30,
                        },
                    ],
                },
            ],
        };

        const winners = getGameWinners(game);

        expect(winners.map((player) => player.name)).toEqual(['Beto', 'Mel']);
    });

    test('free game winner is lowest scoring player among players who completed all games', () => {
        const gameCodes = [
            '1/3',
            '2/3',
            '1/4',
            '2/4',
            '1/5',
            '2/5',
            'ESC',
        ];

        const game = {
            mode: 'libre',

            players: [
                { name: 'Beto' },
                { name: 'Mel' },
                { name: 'Techi' },
            ],

            hands:
                gameCodes.map(
                    (gameCode) => ({
                        results: [
                            {
                                playerName: 'Beto',
                                completedGameCode: gameCode,
                                points: 10,
                            },
                            {
                                playerName: 'Mel',
                                completedGameCode: gameCode,
                                points: 5,
                            },
                            {
                                /*
                                  Luigi no completa
                                  ningún juego.
                                */
                                playerName: 'Luigi',
                                completedGameCode: null,
                                points: 1,
                            },
                        ],
                    })
                ),
        };

        const winners = getGameWinners(game);

        expect(winners.map((player) => player.name)).toEqual(['Mel']);
    });

    test('free game ignores lower scoring players who did not completed all games', () => {
        const gameCodes = [
            '1/3',
            '2/3',
            '1/4',
            '2/4',
            '1/5',
            '2/5',
            'ESC',
        ];

        const game = {
            mode: 'libre',

            players: [
                { name: 'Beto' },
                { name: 'Mel' },
                { name: 'Techi' },
            ],

            hands:
                gameCodes.map(
                    (gameCode) => ({
                        results: [
                            {
                                playerName: 'Beto',
                                completedGameCode: gameCode,
                                points: 20,
                            },
                            {
                                playerName: 'Mel',
                                completedGameCode: null,
                                points: 1,
                            },
                        ],
                    })
                ),
        };

        const winners = getGameWinners(game);

        expect(winners.map((player) => player.name)).toEqual(['Beto']);
    });
});