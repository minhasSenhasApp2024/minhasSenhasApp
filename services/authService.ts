import {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut} from 'firebase/auth';
import { auth } from '@/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';


export async function register(
    email: string, 
    password: string, 
    setIsLoggedIn: (value: boolean) => void, 
    setUserEmail: (email: string | null) => void, 
    setAwaitingUser: (value: boolean) => void) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("Registro bem-sucedido!\nUID do usuário:", user.uid);
        console.log("E-mail do usuário:", user.email);
        await logout(setIsLoggedIn, setUserEmail, setAwaitingUser); // Log out immediately after registration
        return user;
    } catch (error) {
        throw error;
    }
}

export async function login(
    email: string, 
    password: string, 
    setIsLoggedIn: (value: boolean) => void, 
    setUserEmail: (email: string | null) => void) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        setIsLoggedIn(true);
        setUserEmail(user.email);
        await AsyncStorage.setItem('userEmail', user.email || '');
        await AsyncStorage.setItem('userPassword', password);
        await AsyncStorage.setItem('biometricEnabled', 'true');
        console.log("Login bem-sucedido!\nUID do usuário:", user.uid);
        console.log("E-mail do usuário:", user.email);
        return user;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
}

export async function logout(
    setIsLoggedIn: (value: boolean) => void, 
    setUserEmail: (email: string | null) => void, 
    setAwaitingUser: (value: boolean) => void) {
    try {
        await signOut(auth);
        setIsLoggedIn(false);
        setUserEmail(null);
        setAwaitingUser(true);
        console.log("Logout bem-sucedido!");
    } catch (error) {
        throw error;
    }
}
