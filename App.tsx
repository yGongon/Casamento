import React, { useState, useEffect } from 'react';
import { Gift, GiftClaim } from './types';
import { INITIAL_GIFTS } from './constants';
import Hero from './components/Hero';
import EventDetails from './components/EventDetails';
import GiftList from './components/GiftList';
import CashGift from './components/CashGift';
import Footer from './components/Footer';
import { db, auth, googleProvider } from './firebase';
import { collection, onSnapshot, doc, updateDoc, getDocs, writeBatch, arrayUnion, getDoc } from 'firebase/firestore';
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
        
        // Custom sort (by numeric part of ID)
        const sortedGifts = giftsData.sort((a, b) => {
           const getNum = (id: string) => {
             const parts = id.split('-');
             if (parts.length > 1) return parseInt(parts[1]) || 0;
             return 0;
           };
           return getNum(a.id) - getNum(b.id);
        });
        
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

    // Seed logic (Updated to sync changes from constants.ts including maxQuantity)
    const seedDatabase = async () => {
      try {
        const snapshot = await getDocs(giftsCollectionRef);
        // Explicitly type the tuple to ensure Map infers types correctly
        const existingDocs = new Map<string, Gift>(
          snapshot.docs.map(doc => [doc.id, doc.data() as Gift] as [string, Gift])
        );
        
        const batch = writeBatch(db);
        let updatesCount = 0;
        
        INITIAL_GIFTS.forEach((gift) => {
          const docRef = doc(db, 'gifts', gift.id);
          const existingData = existingDocs.get(gift.id);

          if (!existingData) {
            // Create new if doesn't exist
            batch.set(docRef, { ...gift, claims: [] }); // Initialize with empty claims
            updatesCount++;
          } else {
            // Update static fields if they changed in constants.ts
            // Important: We must allow updating maxQuantity
            let needsUpdate = false;
            const updates: any = {};
            
            // Cast existingData to Gift to resolve 'unknown' type error
            const currentGift = existingData as Gift;

            if (currentGift.image !== gift.image) { updates.image = gift.image; needsUpdate = true; }
            if (currentGift.name !== gift.name) { updates.name = gift.name; needsUpdate = true; }
            if (currentGift.description !== gift.description) { updates.description = gift.description; needsUpdate = true; }
            if (currentGift.category !== gift.category) { updates.category = gift.category; needsUpdate = true; }
            
            // Sync maxQuantity
            const newMax = gift.maxQuantity || 1;
            const oldMax = currentGift.maxQuantity || 1;
            if (newMax !== oldMax) {
              updates.maxQuantity = newMax;
              needsUpdate = true;
            }

            if (needsUpdate) {
              batch.update(docRef, updates);
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
      const giftSnap = await getDoc(giftRef);
      
      if (!giftSnap.exists()) {
        setToast({ message: "Presente não encontrado.", type: 'error' });
        return;
      }

      const giftData = giftSnap.data() as Gift;
      const currentClaims = giftData.claims || [];
      const maxQuantity = giftData.maxQuantity || 1;

      // Check capacity
      if (currentClaims.length >= maxQuantity) {
         setToast({ message: "Este presente já foi escolhido por completo.", type: 'error' });
         return;
      }

      // Check if user already claimed THIS item (prevent double booking same item ID)
      const hasAlreadyClaimed = currentClaims.some(c => c.userId === user.uid);
      if (hasAlreadyClaimed) {
        setToast({ message: "Você já escolheu este presente.", type: 'error' });
        return;
      }

      const newClaim: GiftClaim = {
        userId: user.uid,
        name: name,
        isAnonymous: isAnonymous,
        timestamp: Date.now()
      };

      // Add to claims array
      // Also maintain legacy fields for backward compatibility/simplicity if needed, 
      // but UI mainly uses claims array now.
      await updateDoc(giftRef, {
        claims: arrayUnion(newClaim),
        // We set the legacy fields to the LAST person who claimed it, or keep it generic
        claimedBy: name, 
        claimedByUserId: user.uid,
        isAnonymous: isAnonymous
      });

      setToast({ message: "Presente marcado com sucesso! Obrigado!", type: 'success' });
    } catch (error) {
      console.error("Error claiming gift:", error);
      setToast({ message: "Erro ao marcar presente. Tente novamente.", type: 'error' });
    }
  };

  const handleUnclaimGift = async (giftId: string) => {
    if (!user) return;

    try {
      const giftRef = doc(db, 'gifts', giftId);
      const giftSnap = await getDoc(giftRef);
      
      if (!giftSnap.exists()) return;

      const giftData = giftSnap.data() as Gift;
      const currentClaims = giftData.claims || [];

      // Filter out the current user's claim
      const updatedClaims = currentClaims.filter(c => c.userId !== user.uid);
      
      const updates: any = {
        claims: updatedClaims
      };

      // If no claims left, clear legacy fields
      if (updatedClaims.length === 0) {
        updates.claimedBy = null;
        updates.claimedByUserId = null;
        updates.isAnonymous = false;
      } else {
        // If claims remain, set legacy fields to the last remaining claim
        const lastClaim = updatedClaims[updatedClaims.length - 1];
        updates.claimedBy = lastClaim.name;
        updates.claimedByUserId = lastClaim.userId;
        updates.isAnonymous = lastClaim.isAnonymous;
      }

      await updateDoc(giftRef, updates);
      setToast({ message: "Presente desmarcado com sucesso.", type: 'success' });
    } catch (error) {
      console.error("Error unclaiming gift:", error);
      setToast({ message: "Erro ao desmarcar presente.", type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pureWhite text-serenityDark">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-pureWhite text-fineBlack px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-serif mb-2">Ops! Algo deu errado.</h2>
        <p className="font-sans text-sm opacity-60">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-6 px-6 py-2 bg-serenity text-white rounded-sm font-sans text-sm uppercase tracking-wider hover:bg-serenityDark transition-colors"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pureWhite selection:bg-serenity selection:text-white">
      <Hero user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <EventDetails />
      <GiftList 
        gifts={gifts} 
        currentUser={user} 
        onClaim={handleClaimGift} 
        onUnclaim={handleUnclaimGift}
        onLogin={handleLogin}
      />
      <CashGift />
      <Footer />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  );
};

export default App;