import { exp } from "firebase/firestore/pipelines";

//Datos utilizados para almacenar temporalmente la identidad del jugadro y la partida en el navegador
const GAME_ID_KEY = 'telefunken_current_game_id';

const PLAYER_ID_KEY = 'telefunken_current_player_id';

/*
  Función para guardar la sesión actual del dispositivo.

  No se almacena toda la partida porque
  firestore ya contiene el estado persistente.
*/
export function saveSession(gameId, playerId) {
    localStorage.setItem(GAME_ID_KEY, gameId);
    localStorage.setItem(PLAYER_ID_KEY, playerId);
}

/*
  Función para recuperar la sesión guardada
  anteriormente en este navegador.
*/
export function loadSession() {
    const gameId = localStorage.getItem(GAME_ID_KEY);
    const playerId = localStorage.getItem(PLAYER_ID_KEY);

    //Si no hay alguno de los valores, no hay sesión válida
    if(!gameId || !playerId){
        return null;
    }

    return {
        gameId,
        playerId
    };
}

/*
  Función para eliminar la sesión local.

  Se utilizará cuando el jugador
  abandone definitivamente la partida.
*/
export function clearSession() {
    localStorage.removeItem(GAME_ID_KEY);
    localStorage.removeItem(PLAYER_ID_KEY);
}