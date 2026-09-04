//Importar las herramientas de Vitest para las pruebas
import { describe, expect, test } from 'vitest'

//Importar las funciones que se van a probar
import { isValidPlayerCount, getInitialPurchases } from '../utils/gameRules'

/*
  Pruebas para las reglas correspondientes
  a la cantidad de jugadores.
*/
describe('Player count validation', () => {
    test('allows the minimum of 2 players', () => {
        expect(isValidPlayerCount(2)).toBe(true);
    });

    test('allows the maximum of 6 players', () => {
        expect(isValidPlayerCount(6)).toBe(true);
    });

    test('rejects fewer than 2 players', () => {
        expect(isValidPlayerCount(1)).toBe(false);
    });

    test('rejects more than 6 players', () => {
        expect(isValidPlayerCount(7)).toBe(false);
    });
});

/*
  Pruebas relacionadas con las compras
  iniciales de cada modalidad.
*/
describe('Initial purchases', () => {
    test('ordered mode starts with 12 purchases', () => {
        expect(getInitialPurchases('ordenado')).toBe(12);
    });

    test('free mode starts with 7 purchases', () => {
        expect(getInitialPurchases('libre')).toBe(7);
    });

    test('unknown mode returns null', () => {
        expect(getInitialPurchases('otro')).toBe(null);
    });
});