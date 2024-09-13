import {createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { auth } from '@/firebaseConfig';

export async function register(email: string, password: string) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user
        console.log("Registro bem-sucedido!\nUID do usuário:", user.uid);
        console.log("E-mail do usuário:", user.email);
        return user;
    } catch (error) {
        throw error;
        // TRATAR ERROS
    }
}

export async function login(email: string, password: string) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user
        console.log("Login bem-sucedido!\nUID do usuário:", user.uid);
        console.log("E-mail do usuário:", user.email);
        return user;
    } catch (error) {
        throw error;
        // TRATAR ERROS
    }
}

export async function logout() {
    try {
        await signOut(auth);
        console.log("Logout bem-sucedido!");
    } catch (error) {
        throw error;
        // TRATAR ERROS
    }
}

// export function onAuthStateChanged(auth, (user) => {
//     if (user) {
//         console.log("Usuário logado:", user.uid);
//     } else {
//         console.log("Nenhum usuário logado.");
//     }});