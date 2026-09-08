/*
  Genera un código sencillo para identificar
  una partida.
*/
export function generateGameCode() {
    /*
    Math.random() genera un número entre 0 y 1.

    Multiplicamos por 9000 para obtener
    un rango de 0 a 8999.

    Después sumamos 1000 para conseguir
    un número entre 1000 y 9999.
  */
  const number = Math.floor(Math.random() * 9000) + 1000;

  /*
    Retornamos el código con el formato
    TELE-XXXX.
  */
  return `TELE-${number}`;
}