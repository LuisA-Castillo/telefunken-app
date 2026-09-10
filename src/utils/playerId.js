/*
  Función que genera un identificador 
  simple para un jugador.
*/
export function generatePlayerId() {
    const randomPart = Math.random().toString(36).slice(2, 8);

    return `player-${randomPart}`;
}