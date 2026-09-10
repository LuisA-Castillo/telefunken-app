//Importar las herramientas de Vitest para las pruebas
import { describe, expect, test } from 'vitest';

//Importar las funciones que se van a probar
import { generatePlayerId } from '../utils/playerId';

/*
  Pruebas para la generación de 
  ids únicos para cada jugador.
*/
describe('Player ID', () => {
    test('generates a player id', () => {
        const playerId = generatePlayerId();

        expect(playerId.startsWith('player-')).toBe(true);
    });
});