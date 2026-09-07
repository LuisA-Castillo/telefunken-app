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
    },
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

/*
  Función para verificar si todavía existe 
  espacio para añadir otro jugador.
*/
export function canAddPlayer(playerCount) {
  return playerCount < MAX_PLAYERS;
}

/*
  Función que mueve un jugador dentro de la lista.

  Recibe:
  - players: arreglo actual de jugadores.
  - currentIndex: posición actual.
  - newIndex: posición a la que queremos moverlo.

  La función modifica el mismo arreglo.
*/
export function movePlayer(players, currentIndex, newIndex) {
    /*
        Controlamos posiciones inválidas.

        No podemos mover un jugador:
        - antes de la posición 0;
        - después de la última posición.
    */
    if (newIndex < 0 || newIndex >= players.length) {
        return;
    }

    /*
        splice() permite quitar elementos
        de un arreglo.

        Aquí quitamos un jugador
        desde currentIndex.

        splice() devuelve un arreglo,
        por eso usamos [0] para obtener
        directamente el jugador eliminado.
    */
    const movedPlayer = players.splice(currentIndex, 1)[0];

    /*
        Ahora insertamos ese mismo jugador
        en su nueva posición.

        El 0 significa que no queremos eliminar
        ningún elemento en esa posición.
    */
    players.splice(newIndex, 0, movedPlayer);
}

/*
  Función que elimina un jugador de la lista
  usando su posición.

  No permite eliminar al Host.
*/
export function removePlayer(players, index) {
    //Comprobamos que la posición existe
    if(index < 0 || index >= players.length) {
        return false;
    }

    //Obtenemos el jugador que se quiere eliminar
    const player = players[index];

    //Control para que el Host no pueda eliminarse
    if(player.isHost) {
        return false;
    }

    //Eliminamos al jugador en la posición indicada
    players.splice(index, 1);

    //Retornar una señal true porque se elimina correctamente
    return true;
}