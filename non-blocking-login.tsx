import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';

const provider = new GithubAuthProvider();

export const initiateGitHubSignIn = async (auth) => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        // Handle successful sign-in
        console.log('User Info:', user);
        await handleUserProfileCompletion(user);
    } catch (error) {
        console.error('Error signing in with GitHub:', error);
    }
};

const handleUserProfileCompletion = async (user) => {
    // Implement logic for completing user profile (e.g., username, account type selection)
    // You can store this information in your database or initialize the user session.
    const username = prompt('Please enter your username:');
    const accountType = prompt('Please select your account type (e.g., user/admin):');
    // Save username and account type
    console.log(`Username: ${username}, Account Type: ${accountType}`);
    // Your implementation to save the profile information
};
