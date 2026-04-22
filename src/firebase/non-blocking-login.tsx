import React, { useEffect, useState } from 'react';
import { getAuth, GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const NonBlockingLogin = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);
  const provider = new GithubAuthProvider();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setUser(user);
    } catch (error) {
      console.error('Error during GitHub sign-in:', error);
    }
  };

  useEffect(() => {
    // Logic for checking user authentication can go here
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.displayName}</h2>
          <p>{user.email}</p>
        </div>
      ) : (
        <button onClick={handleLogin}>Sign in with GitHub</button>
      )}
    </div>
  );
};

export default NonBlockingLogin;