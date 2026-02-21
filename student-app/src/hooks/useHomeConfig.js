import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to load and manage home card configuration.
 */
export const useHomeConfig = (hardcodedFallbacks = []) => {
    const [cards, setCards] = useState([]);
    const [rewardRules, setRewardRules] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) return; // Wait for authentication

        setLoading(true);

        // 1. Listen to Home Cards
        const cardsRef = collection(db, 'home_cards');
        const q = query(cardsRef, where('visible', '==', true), orderBy('order', 'asc'));

        const unsubscribeCards = onSnapshot(q, (snapshot) => {
            const dbCards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (dbCards.length > 0) {
                setCards(dbCards);
            } else {
                setCards(hardcodedFallbacks);
            }
            // Check if both loaded to stop loading state (optional, just let it be)
            setLoading(false);
        }, (err) => {
            console.error('[Config] Cards listener error:', err);
            setError(err);
            setCards(hardcodedFallbacks);
        });

        // 2. Listen to Reward Rules
        const rulesRef = doc(db, 'reward_rules', 'default');
        const unsubscribeRules = onSnapshot(rulesRef, (snapshot) => {
            if (snapshot.exists()) {
                setRewardRules(snapshot.data());
            } else {
                setRewardRules(null);
            }
        }, (err) => {
            console.error('[Config] Rules listener error:', err);
        });

        return () => {
            unsubscribeCards();
            unsubscribeRules();
        };
    }, [currentUser]);

    return { cards, rewardRules, loading, error };
};
