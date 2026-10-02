import { generateGameCode } from "../utils/gameCode";
import { gameCodeExists } from "./gameRepository";

/*
  Función para Generar un código de partida
  que todavía no exista en Firestore.
*/
export async function generateUniqueGameCode() {
    let gameCode;
    let exists;

    do {
        //Generar un código nuevo
        gameCode = generateGameCode();

        //consultar si ese código ya existe 
        exists = await gameCodeExists(gameCode);
    } while(exists);

    return gameCode;
}