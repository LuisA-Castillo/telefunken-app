//Cantidad mínima de jugadores para una partida
export const MIN_PLAYERS = 2;

//Cantidad máxima de jugadores para una partida
export const MAX_PLAYERS = 6;

//Cantidad de compras disponibles para el modo ordenado
export const ORDERED_PURCHASES = 12;

//Cantidad de compras disponibles para el modo libre
export const FREE_PURCHASES = 7;

//Lista de juegos de una partida de Telefunken
export const GAMES = [
    {
        code: '1/3',
        name: 'Un trío'
    },
    {
        code: '2/3',
        name: 'Dos tríos'
    },
    {
        code: '1/4',
        name: 'Un cuarto'
    },
    {
        code: '2/4',
        name: 'Dos cuartos'
    },
    {
        code: '1/5',
        name: 'Un quinto'
    },
    {
        code: '2/5',
        name: 'Dos quintos'
    },
    {
        code: 'ESC',
        name: 'Escalera'
    }
]

/*
  Función que verifica si la cantidad de 
  jugadores es válida para una partida.

  Devuelve true si está entre 2 y 6.
  Devuelve false en cualquier otro caso.
*/
export function isValidPlayerCount(playerCount) {
    return (playerCount >= MIN_PLAYERS && playerCount <= MAX_PLAYERS);
}

/*
  Función que devuelve la cantidad inicial de 
  compras según la modalidad seleccionada.
*/
export function getInitialPurchases(mode) {
    if (mode === 'ordenado') {
        return ORDERED_PURCHASES;
    }

    if (mode === 'libre') {
        return FREE_PURCHASES;
    }

    return null;
}