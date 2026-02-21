import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

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

    // Google Login
    const googleLogin = async (selectedStream = 'JEE') => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user doc exists
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // Create new user doc
                const newUser = {
                    name: user.displayName,
                    email: user.email,
                    stream: selectedStream,
                    createdAt: new Date(),
                    stats: {
                        lvl: 1,
                        xp: 0,
                        nextXp: 100,
                        gold: 0,
                        gems: 0,
                        streak: 0
                    }
                };
                await setDoc(docRef, newUser);
                setUserData(newUser);
            } else {
                setUserData(docSnap.data());
            }
            return user;
        } catch (error) {
            console.error("Google Login Error:", error);
            throw error;
        }
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

    // Upgrade Guest → Google Account (migrate progress)
    const upgradeFromGuest = async () => {
        // Capture guest data before signing in
        const guestData = { ...userData };

        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                // New account — save all guest progress
                const migratedUser = {
                    name: user.displayName,
                    email: user.email,
                    stream: guestData.stream || 'JEE',
                    createdAt: new Date(),
                    migratedFromGuest: true,
                    stats: guestData.stats || {
                        lvl: 1, xp: 0, nextXp: 100,
                        gold: 0, gems: 0, streak: 0
                    }
                };
                await setDoc(docRef, migratedUser);
                setUserData(migratedUser);
            } else {
                // Existing account — merge guest stats (keep higher values)
                const existing = docSnap.data();
                const mergedStats = {
                    lvl: Math.max(existing.stats?.lvl || 1, guestData.stats?.lvl || 1),
                    xp: Math.max(existing.stats?.xp || 0, guestData.stats?.xp || 0),
                    nextXp: Math.max(existing.stats?.nextXp || 100, guestData.stats?.nextXp || 100),
                    gold: (existing.stats?.gold || 0) + (guestData.stats?.gold || 0),
                    gems: (existing.stats?.gems || 0) + (guestData.stats?.gems || 0),
                    streak: Math.max(existing.stats?.streak || 0, guestData.stats?.streak || 0),
                    totalTests: (existing.stats?.totalTests || 0) + (guestData.stats?.totalTests || 0),
                    totalQuestions: (existing.stats?.totalQuestions || 0) + (guestData.stats?.totalQuestions || 0),
                    correctAnswers: (existing.stats?.correctAnswers || 0) + (guestData.stats?.correctAnswers || 0),
                    lastActive: guestData.stats?.lastActive || existing.stats?.lastActive,
                };
                await updateDoc(docRef, { stats: mergedStats });
                setUserData({ ...existing, stats: mergedStats });
            }

            // Update currentUser to real Firebase user
            setCurrentUser(user);
            return user;
        } catch (error) {
            console.error("Guest upgrade error:", error);
            throw error;
        }
    };

    // Update User Stats
    const updateUserStats = async (newStats) => {
        if (!currentUser) return;

        // Update local state
        setUserData(prev => ({
            ...prev,
            stats: { ...prev.stats, ...newStats }
        }));

        // Update Firestore
        const userRef = doc(db, "users", currentUser.uid);
        try {
            await updateDoc(userRef, {
                "stats": newStats
            });
        } catch (err) {
            console.error("Error updating stats:", err);
        }
    };

    // Load User Data - Now Real-time
    useEffect(() => {
        let unsubscribeDoc = null;

        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);

            // Clean up previous registration if any
            if (unsubscribeDoc) unsubscribeDoc();

            if (user) {
                // Set up real-time listener for the user document
                const docRef = doc(db, "users", user.uid);
                unsubscribeDoc = onSnapshot(docRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    }
                }, (error) => {
                    console.error("Error fetching user data snapshot:", error);
                });
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeDoc) unsubscribeDoc();
        };
    }, []);

    const value = {
        currentUser,
        userData,
        signup,
        login,
        googleLogin,
        guestLogin,
        logout,
        upgradeFromGuest,
        updateUserStats
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
