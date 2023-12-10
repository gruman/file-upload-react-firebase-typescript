// Login.tsx
import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const auth = getAuth();

const Login: React.FC = () => {
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google login successful', user);
    } catch (error) {
      console.error('Google login error', error);
    }
  };

  return (
    <div className="login">
      <button onClick={handleGoogleLogin}>Login with Google</button>
    </div>
  );
};

export default Login;
