//Importar las herramientas de Vitest para las pruebas
import { createExpect, describe, expect, test } from 'vitest';

//Importar las funciones que se van a probar
import { createNextGame } from '../utils/newGameFlow';

/*
  Pruebas para la creación de un nuevo juego
  luego de haber finalizado uno previo.
*/
describe('New game flow', () => {
    test('creates a new game rotating players from the first winner', () => {
        const previousGame = {
            code: 'TELE-1111',
            mode: 'ordered',
            status: 'finished',
            started: true,
            currentHand: 7,
            dealerIndex: 2,
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                    isHost: true,
                    purchasesRemaining: 0,
                    totalScore: 120,
                    completedGames: ['1/3'],
                    penalties: [10],
                },
                {
                    id: 'player-mel',
                    name: 'Mel',
                    isHost: false,
                    purchasesRemaining: 1,
                    totalScore: 95,
                    completedGames: ['1/3'],
                    penalties: [],
                },
                {
                    id: 'player-luigi',
                    name: 'Luigi',
                    isHost: false,
                    purchasesRemaining: 2,
                    totalScore: 80,
                    completedGames: ['1/3'],
                    penalties: [10],
                },
                {
                    id: 'player-ana',
                    name: 'Ana',
                    isHost: false,
                    purchasesRemaining: 3,
                    totalScore: 140,
                    completedGames: ['1/3'],
                    penalties: [20],
                },
                {
                    id: 'player-carlos',
                    name: 'Carlos',
                    isHost: false,
                    purchasesRemaining: 4,
                    totalScore: 160,
                    completedGames: ['1/3'],
                    penalties: [],
                },
            ],
            hands: [
                {
                    number: 1,
                    results: [],
                },
            ],
        };

        const winners = [
            previousGame.players[2],
        ];

        const newGame = createNextGame(previousGame, winners);

        expect(newGame.players.map((player) => player.name)).toEqual(['Luigi', 'Ana', 'Carlos', 'Beto', 'Mel']);
    });

    test('uses the tied winner who appeared first in the previous seating order', () => {
        const previousGame = {
            mode: 'ordered',
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                },
                {
                    id: 'player-mel',
                    name: 'Mel',
                },
                {
                    id: 'player-luigi',
                    name: 'Luigi',
                },
                {
                    id: 'player-ana',
                    name: 'Ana',
                },
            ],
            hands: [],
        };

        const winners = [
            previousGame.players[3],
            previousGame.players[1],
        ]

        const newGame = createNextGame(previousGame, winners);

        expect(newGame.players.map((player) => player.name)).toEqual(['Mel', 'Luigi', 'Ana', 'Beto'])
    });

    test('keeps the same host in the new game', () => {
        const previousGame = {
            mode: 'ordered',
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                    isHost: true,
                },
                {
                    id: 'player-mel',
                    name: 'Mel',
                    isHost: false,
                },
                {
                    id: 'player-luigi',
                    name: 'Luigi',
                    isHost: false,
                },
                {
                    id: 'player-ana',
                    name: 'Ana',
                    isHost: false,
                },
            ],
            hands: [],
        };

        const winners = [
            previousGame.players[2],
        ];

        const newGame = createNextGame(previousGame, winners);

        const host = newGame.players.find((player) => player.isHost);

        expect(host.id).toBe('player-beto');
    });

    test('resets game-specific player data', () => {
        const previousGame = {
            mode: 'ordenado',
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                    isHost: true,
                    purchasesRemaining: 2,
                    totalScore: 150,
                    completedGames: [
                        '1/3',
                        '2/3',
                    ],
                    penalties: [
                        15,
                        20,
                    ],
                },
                {
                    id: 'player-mel',
                    name: 'Mel',
                    isHost: false,
                    purchasesRemaining: 0,
                    totalScore: 80,
                    completedGames: [
                        '1/3',
                    ],
                    penalties: [],
                },
            ],
            hands: [],
        };

        const winners = [
            previousGame.players[1]
        ];

        const newGame = createNextGame(previousGame, winners);

        newGame.players.forEach((player) => {
            expect(player.purchasesRemaining).toBe(12);

            expect(player.totalScore).toBe(0);

            expect(player.completedGames).toEqual([]);

            expect(player.penalties).toEqual([]);
        })
    }); 
    
    test('does not modify the previous game when the new game changes', () => {
        const previousGame = {
            mode: 'ordenado',

            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                    isHost: true,
                    purchasesRemaining: 3,
                    totalScore: 120,
                    completedGames: [
                        '1/3',
                    ],
                    penalties: [
                        25,
                    ],
                },
                {
                    id: 'player-mel',
                    name: 'Mel',
                    isHost: false,
                    purchasesRemaining: 1,
                    totalScore: 80,
                    completedGames: [
                        '1/3',
                        '2/3',
                    ],
                    penalties: [],
                },
            ],

            hands: [
                {
                    number: 1,
                    results: [],
                },
            ],
        };

        const winners = [
            previousGame.players[1]
        ];

        const newGame = createNextGame(previousGame, winners);

        newGame.players[0].name = 'Nombre modificado';

        newGame.players[0].completedGames.push('ESC');

        newGame.hands.push({
            number: 1,
            results: [],
        });

        expect(previousGame.players[1].name).toBe('Mel');

        expect(previousGame.players[1].completedGames).toEqual(['1/3', '2/3']);

        expect(previousGame.hands).toHaveLength(1);
    });

    test('creates the next game with initial lobby state', () => {
        const previousGame = {
            code: 'TELE-1111',
            mode: 'ordenado',
            status: 'finished',
            started: true,
            currentHand: 7,
            dealerIndex: 1,
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                    isHost: true,
                },
                {
                    id: 'player-mel',
                    name: 'Mel',
                    isHost: false,
                },
            ],
            hands: [
                {
                    number: 1,
                    results: [],
                },
            ],
        };

        const winners = [previousGame.players[1]];

        const newGame = createNextGame(previousGame, winners);

        expect(newGame.status).toBe('lobby');

        expect(newGame.started).toBe(false);

        expect(newGame.currentHand).toBe(0);

        expect(newGame.dealerIndex).toBe(0);

        expect(newGame.hands).toEqual([]);
    });

    test('generates a new code', () => {
        const previousGame = {
            code: 'TELE-1111',
            mode: 'ordenado',
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                },
                {
                    id: 'player-mel',
                    name: 'Mel',
                },
            ],
            hands: [],
        };

        const winners = [previousGame.players[0]];

        const newGame = createNextGame(previousGame, winners);

        expect(newGame.code).toBeDefined();

        expect(newGame.code).toMatch(/^TELE-\d{4}$/);
    });

    test('reset purchases to 7 in free mode', () => {
        const previousGame = {
            mode: 'libre',
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                    isHost: true,
                    purchasesRemaining: 0,
                    totalScore: 200,
                    completedGames: [
                        '1/3',
                        '2/3',
                        '1/4',
                    ],
                    penalties: [
                        20,
                        15,
                    ],
                },
                {
                    id: 'player-mel',
                    name: 'Mel',
                    isHost: false,
                    purchasesRemaining: 1,
                    totalScore: 150,
                    completedGames: [
                        'ESC',
                    ],
                    penalties: [
                        30,
                    ],
                },
            ],
            hands: [],
        };

        const winners = [previousGame.players[0]];

        const newGame = createNextGame(previousGame, winners);

        expect(newGame.mode).toBe('libre');

        newGame.players.forEach((player) => {
            expect(player.purchasesRemaining).toBe(7);

            expect(player.totalScore).toBe(0);

            expect(player.completedGames).toEqual([]);

            expect(player.penalties).toEqual([]);
        });
    });

    test('keeps the previous game mode', () => {
        const previousGame = {
            mode: 'libre',
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                },
                {
                    id: 'player-mel',
                    name: 'Mel',
                },
            ],
            hands: [],
        };

        const winners = [previousGame.players[0]];

        const newGame = createNextGame(previousGame, winners);

        expect(newGame.mode).toBe('libre');
    });

    test('keeps the host property in the new game', () => {
        const previousGame = {
            mode: 'ordenado',
            host: 'Beto',
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                    isHost: true,
                },
                {
                    id: 'player-mel',
                    name: 'Mel',
                    isHost: false,
                },
            ],
            hands: [],
        };

        const winners = [previousGame.players[1]];

        const newGame = createNextGame(previousGame, winners);

        expect(newGame.host).toBe('Beto');
    });
});