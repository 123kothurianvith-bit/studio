
'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
} from 'firebase/auth';
import { setDoc, doc, getFirestore } from 'firebase/firestore';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string,
  profileData: { role: 'user' | 'developer' }
): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
      const user = userCredential.user;
      const firestore = getFirestore(authInstance.app);
      const userDocRef = doc(firestore, 'users', user.uid);
      
      setDoc(userDocRef, {
        email: user.email,
        role: profileData.role,
      }, { merge: true });
    })
    .catch(error => {
      console.error("Error during sign-up process:", error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}
