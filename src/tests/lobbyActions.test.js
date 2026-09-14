//Importar las herramientas de Vitest para las pruebas
import { describe, expect, test } from 'vitest';

//Importar las funciones que se van a probar
import { leaveLobby } from '../utils/lobbyActions';
import { GAME_STATUS } from '../utils/gameRules';

/*
  Pruebas para salir del juego voluntariamente
  y si es el host el que saldrá, delegar ese rol 
  al siguiente en el orden actual.
*/
describe('Lobby actions', () => {
    test('allows a regular player to leave the lobby', () => {
        const game = {
            status: GAME_STATUS.LOBBY,
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
        };

        const result = leaveLobby(game, 'player-mel');

        expect(result).toBe(true);

        expect(game.players.map((player) => player.id)).toEqual(['player-beto', ]);

        expect(game.hostPlayerId).toBe('player-beto');
    });

    test('transfer the host when the current host leaves the lobby', ()=> {
        const game = {
            status: GAME_STATUS.LOBBY,
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
                {
                    id: 'player-luigi',
                    name: 'Luigi',
                },
            ],
        };

        const result = leaveLobby(game, 'player-beto');

        expect(result).toBe(true);

        expect(game.players.map((player) => player.id)).toEqual(['player-mel', 'player-luigi']);

        expect(game.hostPlayerId).toBe('player-mel');
    });

    test('transfers the host to the first player when the host was last in the lobby order', () => {
        const game = {
            status: GAME_STATUS.LOBBY,
            hostPlayerId: 'player-beto',
            players: [
                {
                    id: 'player-mel',
                    name: 'Mel',
                },
                {
                    id: 'player-luigi',
                    name: 'Luigi',
                },
                {
                    id: 'player-beto',
                    name: 'Beto',
                },
            ],
        };

        const result = leaveLobby(game, 'player-beto');

        expect(result).toBe(true);

        expect(game.hostPlayerId).toBe('player-mel');
    });

    test('clears teh host when the only player leaves the lobby', () => {
        const game = {
            status: GAME_STATUS.LOBBY,
            hostPlayerId: 'player-beto',
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                },
            ],
        };

        const result = leaveLobby(game, 'player-beto');

        expect(result).toBe(true);

        expect(game.players).toHaveLength(0);
        
        expect(game.hostPlayerId).toBeNull();
    });

    test('does not allow a player to leave after the game has started', () => {
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
        };

        const result = leaveLobby(game, 'player-mel');

        expect(result).toBe(false);

        expect(game.players.map((player) => player.id)).toEqual(['player-beto', 'player-mel']);

        expect(game.hostPlayerId).toBe('player-beto');
    });
});