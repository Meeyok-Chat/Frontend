import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateCurrentUser } from "firebase/auth";
import { auth } from "./firebase";

import { setPersistence, browserLocalPersistence  } from "firebase/auth";

export const signup = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    const user = await createUserWithEmailAndPassword(auth, email, password);
    return user;
}

export const signin = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    const user = await signInWithEmailAndPassword(auth, email, password);
    return user;
}

export const signout = async () => {
    await signOut(auth);
}

export const getUserToken = async () => {
    await auth.authStateReady();
    const user = auth.currentUser;
    const token = await user?.getIdToken();
    return token;
}