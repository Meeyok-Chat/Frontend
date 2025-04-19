import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
    apiKey: "AIzaSyAcw3L_pAkFTftHyV0IL_uvfVjaxAFhr3w",
    authDomain: "meeyok-chat.firebaseapp.com",
    projectId: "meeyok-chat",
    storageBucket: "meeyok-chat.firebasestorage.app",
    messagingSenderId: "205755784778",
    appId: "1:205755784778:web:fee1f52db55ef6a300d0b3",
    measurementId: "G-J8WVX4BQNQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);