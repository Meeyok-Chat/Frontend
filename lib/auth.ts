import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";
import { setPersistence, browserLocalPersistence } from "firebase/auth";

export const useAuth = () => {
  const signup = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    const user = await createUserWithEmailAndPassword(auth, email, password);
    return user;
  };

  const signin = async (email: string, password: string) => {
    await setPersistence(auth, browserLocalPersistence);
    const user = await signInWithEmailAndPassword(auth, email, password);
    console.log(await user.user.getIdToken());
    return user;
  };

  const signout = async () => {
    await signOut(auth);
  };

  return { signup, signin, signout };
};

export const getUserToken = async () => {
  await auth.authStateReady();
  const user = auth.currentUser;
  const token = await user?.getIdToken();
  return token;
};
