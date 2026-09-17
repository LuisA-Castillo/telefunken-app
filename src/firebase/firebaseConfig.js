// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";

/*
  Importar Firestore.

  getFirestore() nos permite obtener una referencia
  a la base de datos Firestore del proyecto Firebase.
*/
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBym_Wml70Es6IVq1HcwncHOqTzvMPGRHY",
  authDomain: "telefunken-app.firebaseapp.com",
  projectId: "telefunken-app",
  storageBucket: "telefunken-app.firebasestorage.app",
  messagingSenderId: "312794750488",
  appId: "1:312794750488:web:4bf980840d7c5ca16f2d6d"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

/*
  Obtener la instancia de Firestore.

  Exportamos "db" para poder utilizar
  la misma conexión desde otros archivos
  de la aplicación.
*/
export const db = getFirestore(firebaseApp);