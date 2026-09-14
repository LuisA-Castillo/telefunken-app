//Importar las herramientas de Vitest para las pruebas
import { describe, expect, test } from 'vitest';

//Importar las funciones que se van a probar
import { canJoinGame, canManageLobby, canLeaveLobby } from '../utils/lobbyPermissions';
import { GAME_STATUS } from '../utils/gameRules';

/*
  Pruebas para manejar los permisos de 
  los jugadores dentro del lobby.
*/
describe('Lobby permissions', () => {
    test('allows joining while the game is in the lobby and has space', () => {
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
        };

        const result = canJoinGame(game);

        expect(result).toBe(true);
    });

    test('does not allow joining when the lobby is full', () => {
        const game = {
            status: GAME_STATUS.LOBBY,
            players: [
                { id: 'player-1' },
                { id: 'player-2' },
                { id: 'player-3' },
                { id: 'player-4' },
                { id: 'player-5' },
                { id: 'player-6' },
            ],
        };

        const result = canJoinGame(game);

        expect(result).toBe(false);
    });

    test('does not allow joining after the game has started', () => {
        const game = {
            status: GAME_STATUS.IN_PROGRESS,
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                },
            ],
        };

        const result = canJoinGame(game);

        expect(result).toBe(false);
    });

    test('allows only the host to manage the lobby', () => {
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

        expect(canManageLobby(game, 'player-beto')).toBe(true);

        expect(canManageLobby(game, 'player-mel')).toBe(false);
    });

    test('does not allow the host to manage the lobby after the game is started', () => {
        const game = {
            status: GAME_STATUS.IN_PROGRESS,
            hostPlayerId: 'player-beto',
            players: [
                {
                    id: 'player-beto',
                    name: 'Beto',
                },
            ],
        };

        const result = canManageLobby(game, 'player-beto');

        expect(result).toBe(false);
    });

    test('allows a player to leave only while still in the lobby', () => {
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

        expect(canLeaveLobby(game, 'player-mel')).toBe(true);

        game.status = GAME_STATUS.IN_PROGRESS

        expect(canLeaveLobby(game, 'player-mel')).toBe(false);
    });
});