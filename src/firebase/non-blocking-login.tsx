import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
    // Your Firebase config here
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// Email Sign-Up Function
export const emailSignUp = async (email, password) => {
    try {
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        // Store user info in Firestore
        await db.collection('users').doc(userCredential.user.uid).set({ email });
    } catch (error) {
        console.error('Error during sign up:', error);
    }
};

// Email Sign-In Function
export const emailSignIn = async (email, password) => {
    try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
        console.error('Error during sign in:', error);
    }
};

// GitHub Sign-In Function
export const initiateGitHubSignIn = () => {
    const provider = new firebase.auth.GithubAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            const user = result.user;
            // Store user info in Firestore
            db.collection('users').doc(user.uid).set({
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            });
        })
        .catch((error) => {
            console.error('Error during GitHub sign-in:', error);
        });
};
