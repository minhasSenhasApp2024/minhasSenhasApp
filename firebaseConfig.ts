import { initializeApp } from 'firebase/app';
import {getFirestore, collection, addDoc, getDocs} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

import firebase from 'firebase/app';
import 'firebase/auth'; // Import the auth module

// Optionally import the services that you want to use

// import {...} from "firebase/database";
// import {...} from "firebase/firestore";
// import {...} from "firebase/functions";
// import {...} from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  databaseURL: process.env.EXPO_PUBLIC_DATABASE_URL,
  projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: 'sender-id',
  appId: process.env.EXPO_PUBLIC_APP_ID,
//   measurementId: 'G-measurement-id',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Função para adicionar dados de teste ao Firestore
export async function addTestData() {
  try {
    const docRef = await addDoc(collection(db, "testCollection"), {
      testField: "testValue"
    });
    console.log("Documento escrito com ID: ", docRef.id);
    return true;
  } catch (e) {
    console.error("Erro ao adicionar documento: ", e);
    return false;
  }
}
// see the Firebase documentation: https://firebase.google.com/docs/web/setup#access-firebase


export async function testarEnv() {
  console.log('expo public api key', process.env.EXPO_PUBLIC_API_KEY);
  console.log('expo public auth domain', process.env.EXPO_PUBLIC_AUTH_DOMAIN);
  console.log('EXPO_PUBLIC_DATABASE_URL', process.env.EXPO_PUBLIC_DATABASE_URL);
  console.log('EXPO_PUBLIC_PROJECT_ID', process.env.EXPO_PUBLIC_PROJECT_ID);
  console.log('EXPO_PUBLIC_STORAGE_BUCKET', process.env.EXPO_PUBLIC_STORAGE_BUCKET);
  console.log('EXPO_PUBLIC_APP_ID', process.env.EXPO_PUBLIC_APP_ID);
}

export async function fetchData() {
  const querySnapshot = await getDocs(collection(db, 'testCollection'));
  return querySnapshot.docs.map(doc => doc.data());
}
