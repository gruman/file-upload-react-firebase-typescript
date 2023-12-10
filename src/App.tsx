import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import './constants/firebase'; // Import this file to initialize Firebase
import './App.css';
import Home from './pages/Home';
import Login from './pages/Login';


const auth = getAuth();

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      if (authUser) {
        setUser(authUser);
      } else {
        // User is signed out
        setUser(null);
      }
    });

    return () => unsubscribe(); // Cleanup on component unmount
  }, [auth]);

  return (
    <div className="container">
      {user ? (
        // User is authenticated, render Home component
        <Home user={user} />
      ) : (
        // User is not authenticated, render Login component
        <Login />
      )}
    </div>
  );
};

export default App;
