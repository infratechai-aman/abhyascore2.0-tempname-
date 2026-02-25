import { db } from '../firebase';
import { collection, doc, getDoc, getDocs, query, orderBy, where } from 'firebase/firestore';

/**
 * Fetches dynamic home cards from Firestore home_cards collection.
 * Falls back to empty array if not found.
 */
export const fetchHomeCards = async () => {
    try {
        const cardsRef = collection(db, 'home_cards');
        const q = query(cardsRef, where('visible', '==', true), orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        if (snapshot.empty) return [];

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('[configService] Error fetching home cards:', error);
        return [];
    }
};

/**
 * Fetches global reward rules.
 */
export const fetchRewardRules = async () => {
    try {
        const rulesRef = doc(db, 'reward_rules', 'default');
        const snapshot = await getDoc(rulesRef);

        if (!snapshot.exists()) return null;

        return snapshot.data();
    } catch (error) {
        console.error('[configService] Error fetching reward rules:', error);
        return null;
    }
};
