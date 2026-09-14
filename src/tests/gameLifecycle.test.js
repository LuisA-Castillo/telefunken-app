//Importar las herramientas de Vitest para las pruebas
import { describe, expect, test } from 'vitest';

//Importar las funciones que se van a probar
import { canAbortGame, finishGame, abortGame } from '../utils/gameLifecycle';
import { GAME_STATUS } from '../utils/gameRules';

/*
  Pruebas para el flujo de estados
  de todas las partidas.
*/
describe('Game lifecycle', () => {
    test('allows the host to abort an in_progress game', () => {
        const game = {
            status: GAME_STATUS.IN_PROGRESS,
            hostPlayerId: 'player-beto',
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

        const result = canAbortGame(game, 'player-beto');

        expect(result).toBe(true);
    });

    test('does not allow a regular player to abort the game', () => {
        const game = {
            status: GAME_STATUS.IN_PROGRESS,
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

        const result = canAbortGame(game, 'player-mel');

        expect(result).toBe(false);
    });

    test('does not allow aborting game from the lobby', () => {
        const game = {
            status: GAME_STATUS.LOBBY,
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

        const result = canAbortGame(game, 'player-beto');

        expect(result).toBe(false);
    });

    test('does not allow aborting an already finished game', () => {
        const game = {
            status: GAME_STATUS.FINISHED,
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

        const result = canAbortGame(game, 'player-beto');

        expect(result).toBe(false);
    });

    test('marks a normally completed game as finished and elegible for statistics', () => {
        const game = {
            status: GAME_STATUS.IN_PROGRESS,
        };

        const result = finishGame(game);

        expect(result.status).toBe(GAME_STATUS.FINISHED);
        
        expect(result.statisticsEligible).toBe(true);

        expect(result.endReason).toBe('completed');
    });

    test('aborts an in-progress game when requested by the host', () => {
        const game = {
            status: GAME_STATUS.IN_PROGRESS,
            hostPlayerId: 'player-beto',
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
            hands: [
                {
                    number: 1,
                    results: []
                },
            ],
        };

        const result = abortGame(game, 'player-beto');

        expect(result).toBe(true);

        expect(game.status).toBe(GAME_STATUS.ABORTED);
        
        expect(game.statisticsEligible).toBe(false);

        expect(game.endReason).toBe('forced');

        expect(game.endedByPlayerId).toBe('player-beto');

        expect(game.hands).toHaveLength(1);
    });

    test('does not modify the game when a regular player tries to abort it', () => {
        const game = {
            status: GAME_STATUS.IN_PROGRESS,
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
        };

        const result = abortGame(game, 'player-mel');

        expect(result).toBe(false);

        expect(game.status).toBe(GAME_STATUS.IN_PROGRESS);
        
        expect(game.statisticsEligible).toBeUndefined();

        expect(game.endReason).toBeUndefined();
    });
});