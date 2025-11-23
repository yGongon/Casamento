import React, { useState, useEffect } from 'react';
import { Gift } from './types';
import { INITIAL_GIFTS } from './constants';
import Hero from './components/Hero';
import EventDetails from './components/EventDetails';
import GiftList from './components/GiftList';
import CashGift from './components/CashGift';
import Footer from './components/Footer';
import { db, auth, googleProvider } from './firebase';
import { collection, onSnapshot, doc, updateDoc, getDocs, writeBatch } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

// Simple Toast Component
const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-4 rounded-sm shadow-2xl animate-slide-up ${
      type === 'success' ? 'bg-serenityDark text-white' : 'bg-red-500 text-white'
    }`}>
      {type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
      <span className="font-sans text-sm font-medium tracking-wide">{message}</span>
    </div>
  );
};

const App: React.FC = () => {
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Auth Listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Database Listener
  useEffect(() => {
    const giftsCollectionRef = collection(db, 'gifts');

    const unsubscribe = onSnapshot(
      giftsCollectionRef, 
      (snapshot) => {
        const giftsData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Gift[];
        
        const sortedGifts = giftsData.sort((a, b) => Number(a.id.split('-')[1]) - Number(b.id.split('-')[1]));
        
        setGifts(sortedGifts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firebase Error:", err);
        setError("Não foi possível carregar a lista de presentes. Verifique sua conexão.");
        setLoading(false);
      }
    );

    // Seed logic (Updated to sync changes from constants.ts)
    const seedDatabase = async () => {
      try {
        const snapshot = await getDocs(giftsCollectionRef);
        const existingDocs = new Map(snapshot.docs.map(doc => [doc.id, doc.data()]));
        
        const batch = writeBatch(db);
        let updatesCount = 0;
        
        INITIAL_GIFTS.forEach((gift) => {
          const docRef = doc(db, 'gifts', gift.id);
          const existingData = existingDocs.get(gift.id);

          if (!existingData) {
            // Create new if doesn't exist
            batch.set(docRef, gift);
            updatesCount++;
          } else {
            // Update static fields if they changed in constants.ts
            // This allows updating images/descriptions without resetting claimed status
            if (
              existingData.image !== gift.image ||
              existingData.name !== gift.name ||
              existingData.description !== gift.description ||
              existingData.category !== gift.category
            ) {
              batch.update(docRef, {
                image: gift.image,
                name: gift.name,
                description: gift.description,
                category: gift.category
              });
              updatesCount++;
            }
          }
        });

        if (updatesCount > 0) {
          await batch.commit();
          console.log(`Updated ${updatesCount} gifts in database.`);
        }
      } catch (err) {
        console.warn("Seed Warning:", err);
      }
    };

    seedDatabase();

    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setToast({ message: "Login realizado com sucesso!", type: 'success' });
    } catch (error) {
      console.error("Login error:", error);
      setToast({ message: "Erro ao fazer login.", type: 'error' });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setToast({ message: "Você saiu da conta.", type: 'success' });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleClaimGift = async (giftId: string, name: string, isAnonymous: boolean) => {
    if (!user) {
      handleLogin();
      return;
    }

    try {
      const giftRef = doc(db, 'gifts', giftId);
      