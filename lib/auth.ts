import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateCurrentUser } from "firebase/auth";
import { auth } from "./firebase";

export const signup = async (email: string, password: string) => {
    const user = await createUserWithEmailAndPassword(auth, email, password);
    return user;
}

export const signin = async (email: string, password: string) => {
    const user = await signInWithEmailAndPassword(auth, email, password);
    return user;
}

export const signout = async () => {
    await signOut(auth);
}

export const getUserToken = async () => {
    const user = auth.currentUser;
    const token = await user?.getIdToken();
    return token;
}