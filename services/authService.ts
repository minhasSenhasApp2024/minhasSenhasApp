import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { auth } from '@/firebaseConfig';


export async function register(email: string, password: string, setIsLoggedIn: (value: boolean) => void, setUserEmail: (email: string | null) => void) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        setIsLoggedIn(true);
        setUserEmail(user.email);
        console.log("Registro bem-sucedido!\nUID do usuário:", user.uid);
        console.log("E-mail do usuário:", user.email);
        return user;
    } catch (error) {
        throw error;
    }
}

export async function login(email: string, password: string, setIsLoggedIn: (value: boolean) => void, setUserEmail: (email: string | null) => void) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        setIsLoggedIn(true);
        setUserEmail(user.email);
        console.log("Login bem-sucedido!\nUID do usuário:", user.uid);
        console.log("E-mail do usuário:", user.email);
        return user;
    } catch (error) {
        throw error;
    }
}

export async function logout(setIsLoggedIn: (value: boolean) => void, setUserEmail: (email: string | null) => void) {
    try {
        await signOut(auth);
        setIsLoggedIn(false);
        setUserEmail(null);
        console.log("Logout bem-sucedido!");
    } catch (error) {
        throw error;
    }
}

// export function onAuthStateChanged(auth: any, callback: (user: any) => void) {
//     const user = auth.currentUser;
//     if (user) {
//         console.log("Usuário logado:", user.uid);
//     } else {
//         console.log("Nenhum usuário logado.");
//     }};
