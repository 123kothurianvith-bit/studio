'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { getSdks } from './index';
import { initializeFirebase } from '.';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(
  authInstance: Auth,
  email: string,
  password: string,
  profileData: { role: 'user' | 'developer' }
): void {
  // CRITICAL: Do NOT 'await' the promise.
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
      // User created in Auth, now create their profile in Firestore.
      const user = userCredential.user;
      const { firestore } = getSdks(authInstance.app);
      const userDocRef = doc(firestore, 'users', user.uid);
      
      // Set the user's profile data, including their role.
      // This is also non-blocking.
      setDoc(userDocRef, {
        email: user.email,
        role: profileData.role,
      }, { merge: true });

    })
    .catch(error => {
      // Errors from either createUser or setDoc will be caught here.
      console.error("Error during sign-up process:", error);
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // CRITICAL: Call signInWithEmailAndPassword directly. Do NOT use 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}
