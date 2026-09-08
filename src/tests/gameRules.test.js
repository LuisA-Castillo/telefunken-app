//Importar las herramientas de Vitest para las pruebas
import { describe, expect, test } from 'vitest';

//Importar las funciones que se van a probar
import { isValidPlayerCount, getInitialPurchases, canAddPlayer, movePlayer, removePlayer, getOrderedGame, arePurchasesAllowed } from '../utils/gameRules';

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
        expect(getInitialPurchases('libre')).toBe(77);
    });

    test('unknown mode returns null', () => {
        expect(getInitialPurchases('otro')).toBe(null);
    });
});

/*
  Pruebas relacionadas con la incorporación
  de nuevos jugadores.
*/
describe('Adding players', () => {
  test('allows adding players when there are fewer than 6', () => {
    expect(canAddPlayer(5)).toBe(true)
  });

  test('rejects adding another player when there are already 6', () => {
    expect(canAddPlayer(6)).toBe(false)
  });
});

/*
  Pruebas relacionadas con el orden
  de los jugadores.
*/
describe('Player order', () => {
  test('moves a player up', () => {
    const players = [
      { name: 'Beto' },
      { name: 'Mel' },
      { name: 'Techi' },
    ];

    //Movemos a Techi: posición 2 → posición 1
    movePlayer(players, 2, 1);

    //map() nos permite obtener solamente los nombres para comprobar el orden.
    expect(players.map((player) => player.name)).toEqual(['Beto', 'Techi', 'Mel']);
  });

  test('moves a player down', () => {
    const players = [
      { name: 'Beto' },
      { name: 'Mel' },
      { name: 'Techi' },
    ];

    //Movemos a Beto: posición 0 → posición 1.
    movePlayer(players, 0, 1);

    expect(players.map((player) => player.name)).toEqual(['Mel', 'Beto', 'Techi']);
  });

  test('does not move a player outside the list', () => {
    const players = [
      { name: 'Beto' },
      { name: 'Mel' }
    ];

    //Intentamos mover a Beto antes del inicio de la lista (irreal)
    movePlayer(players, 0, -1);

    //El orden debe quedar igual
    expect(players.map((player) => player.name)).toEqual(['Beto', 'Mel']);
  });
});

/*
  Pruebas relacionadas con la eliminación
  de jugadores.
*/
describe('Removing players', () => {
  test('removes a regular player', () => {
    const players = [
      {
        name: 'Beto',
        isHost: true
      },
      {
        name: 'Mel',
        isHost: false
      },
      {
        name: 'Techi',
        isHost: false
      },
    ];

    //Eliminar a Mel
    const result = removePlayer(players, 1);

    //La operación debe ser exitosa, debe devolver true
    expect(result).toBe(true);

    //Mel ya no debe estar en la lista
    expect(players.map((player) => player.name)).toEqual(['Beto', 'Techi']);
  });

  test('does not remove the host', () => {
    const players = [
      {
        name: 'Beto',
        isHost: true
      },
      {
        name: 'Mel',
        isHost: false
      },
    ];
    
    const result = removePlayer(players, 0);

    expect(result).toBe(false);

    expect(players.map((player) => player.name)).toEqual(['Beto', 'Mel']);
  });

  test('does not remove an invalid position', () => {
    const players = [
      {
        name: 'Beto',
        isHost: true
      },
    ];

    const result = removePlayer(players, 5);

    expect(result).toBe(false);
  });
});

/*
  Pruebas relacionadas con las compras
  y cuándo podrían realizarse en el modo ordenado.
*/
describe('Ordered game rules', () => {
  test('gets the correct game for the current hand', () => {
    expect(getOrderedGame(1).code).toBe('1/3');

    expect(getOrderedGame(4).code).toBe('2/4');

    expect(getOrderedGame(7).code).toBe('ESC');
  });

  test('return null for and invalid ordered hand', () => {
    expect(getOrderedGame(0)).toBe(null);

    expect(getOrderedGame(8)).toBe(null);
  });

  test('does not allow purchases in the first ordered game', () => {
    expect(arePurchasesAllowed('ordenado', 1)).toBe(false);
  });

  test('allows purchases in later ordered games', () => {
    expect(arePurchasesAllowed('ordenado', 2)).toBe(true);
  });

  test('allows purchases in free mode', () => {
    expect(arePurchasesAllowed('libre', 1)).toBe(true);
  });
});