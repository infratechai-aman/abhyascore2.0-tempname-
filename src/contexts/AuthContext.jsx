import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null); // Stores stream (JEE/NEET), level, etc.
    const [loading, setLoading] = useState(true);

    // Sign Up
    const signup = async (email, password, name, stream) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user document in Firestore
        await setDoc(doc(db, "users", user.uid), {
            name: name,
            email: email,
            stream: stream, // 'JEE' or 'NEET'
            createdAt: new Date(),
            stats: {
                lvl: 1,
                xp: 0,
                nextXp: 100,
                gold: 0,
                gems: 0,
                streak: 0
            }
        });

        // Set local state immediately for responsiveness
        setUserData({ name, stream, stats: { lvl: 1, xp: 0, nextXp: 100, gold: 0, gems: 0, streak: 0 } });
        return user;
    };

    // Login
    const login = (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    // Guest Login (Bypass)
    const guestLogin = (selectedStream = 'JEE') => {
        const mockUser = { uid: 'guest123', email: 'guest@system.local' };
        setCurrentUser(mockUser);
        setUserData({
            name: 'Guest Operator',
            stream: selectedStream,
            stats: {
                lvl: 1,
                xp: 0,
                nextXp: 100,
                gold: 500,
                gems: 10,
                streak: 1
            }
        });
        setLoading(false);
    };

    // Logout
    const logout = () => {
        setUserData(null);
        setCurrentUser(null);
        return signOut(auth).catch(() => {
            // If firebase signout fails (e.g. guest mode), just clear local state
            setCurrentUser(null);
        });
    };

    // Load User Data
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                // Fetch extra data from Firestore
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        signup,
        login,
        guestLogin,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
