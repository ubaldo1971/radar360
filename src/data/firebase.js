/**
 * firebase.js — Inicialización de Firebase (Firestore y Auth).
 */
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCz95HGX21Naw5VF3uq1RiFoLtaFffYjW4",
    authDomain: "radar360-portal-ubaldo.firebaseapp.com",
    projectId: "radar360-portal-ubaldo",
    storageBucket: "radar360-portal-ubaldo.firebasestorage.app",
    messagingSenderId: "844039808609",
    appId: "1:844039808609:web:310af60d1dd788e47e6c20"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
