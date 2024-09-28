import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { auth, db } from '@/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';

export async function register(email: string, password: string) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user
        console.log("Registro bem-sucedido!\nUID do usuário:", user.uid);
        console.log("E-mail do usuário:", user.email);
        return user;
    } catch (error) {
        console.error("Erro ao registrar usuário:", error);
        throw error;
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
        console.error("Erro ao fazer login:", error);
        throw error;
    }
}

export async function logout() {
    try {
        await signOut(auth);
        console.log("Logout bem-sucedido!");
    } catch (error) {
        console.error("Erro ao fazer logout:", error);
        throw error;
    }
}

export function onAuthStateChanged(auth: any, callback: (user: any) => void) {
    const user = auth.currentUser;
    if (user) {
        console.log("Usuário logado:", user.uid);
    } else {
        console.log("Nenhum usuário logado.");
    }};