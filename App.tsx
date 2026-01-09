
import React, { useState, useEffect } from 'react';
import { Gift, GiftClaim } from './types';
import { INITIAL_GIFTS, INITIAL_GOALS, GOAL_IDS, ADMIN_EMAILS } from './constants';
import Hero from './components/Hero';
import EventDetails from './components/EventDetails';
import GiftList from './components/GiftList';
import CashGift from './components/CashGift';
import Footer from './components/Footer';
import { db, auth, googleProvider } from './firebase';
import { collection, onSnapshot, doc, updateDoc, getDocs, writeBatch, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Loader2, CheckCircle, XCircle, AlertCircle, Plane, Camera } from 'lucide-react';
import emailjs from '@emailjs/browser';

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
    const goalsCollectionRef = collection(db, 'cash_goals');

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
        console.error("Firebase Error (Loading Gifts):", err);
        setGifts(INITIAL_GIFTS);
        setLoading(false);
      }
    );

    // Seed logic (Smarter: only seeds if collection is empty to respect manual deletions)
    const seedDatabase = async () => {
      try {
        const giftsSnapshot = await getDocs(giftsCollectionRef);
        
        // Se a coleção de presentes estiver vazia, faz o seed inicial
        if (giftsSnapshot.empty) {
          console.log("Banco de dados vazio. Iniciando carga inicial de presentes...");
          const batch = writeBatch(db);
          INITIAL_GIFTS.forEach((gift) => {
            const docRef = doc(db, 'gifts', gift.id);
            batch.set(docRef, { ...gift, claims: [] });
          });
          await batch.commit();
        }

        // Seed Metas Financeiras (se não existirem)
        const goalsSnapshot = await getDocs(goalsCollectionRef);
        if (goalsSnapshot.empty) {
          const batch = writeBatch(db);
          INITIAL_GOALS.forEach((goal) => {
            const goalRef = doc(db, 'cash_goals', goal.id);
            batch.set(goalRef, goal);
          });
          await batch.commit();
        }
      } catch (err) {
        console.warn("Seed Warning (Isso é normal se as regras de escrita estiverem restritas):", err);
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

      if (currentClaims.length >= maxQuantity) {
         setToast({ message: "Este presente já foi escolhido por completo.", type: 'error' });
         return;
      }

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

      await updateDoc(giftRef, {
        claims: arrayUnion(newClaim),
        claimedBy: name, 
        claimedByUserId: user.uid,
        isAnonymous: isAnonymous
      });

      setToast({ message: "Presente marcado com sucesso! Obrigado!", type: 'success' });

      // --- EMAIL NOTIFICATION ---
      const EMAILJS_SERVICE_ID = "casamentowevelley";   
      const EMAILJS_TEMPLATE_ID = "template_l9getos"; 
      const EMAILJS_PUBLIC_KEY = "VA3a0JkCjqXQUIec1";   
      
      if (EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
          const emailParams = {
            to_email: 'wevelleytwich@gmail.com',
            gift_name: giftData.name,
            guest_name: name,
            guest_email: user.email,
            is_anonymous: isAnonymous ? '(Marcado como anônimo no site)' : '',
            timestamp: new Date().toLocaleString('pt-BR')
          };
          emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, emailParams, EMAILJS_PUBLIC_KEY).catch(console.error);
      }
    } catch (error: any) {
      console.error("Error claiming gift:", error);
      setToast({ message: "Erro ao marcar presente.", type: 'error' });
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
      const updatedClaims = currentClaims.filter(c => c.userId !== user.uid);
      
      const updates: any = { claims: updatedClaims };

      if (updatedClaims.length === 0) {
        updates.claimedBy = null;
        updates.claimedByUserId = null;
        updates.isAnonymous = false;
      } else {
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

  const handleDeleteGift = async (giftId: string) => {
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) return;

    if (!window.confirm("Tem certeza que deseja remover este presente da lista para sempre?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'gifts', giftId));
      setToast({ message: "Presente removido da lista permanentemente.", type: 'success' });
    } catch (error) {
      console.error("Error deleting gift:", error);
      setToast({ message: "Erro ao remover presente. Verifique as permissões.", type: 'error' });
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
      
      <CashGift 
        goalId={GOAL_IDS.HONEYMOON}
        currentUser={user}
        title="Operação Lua de Mel"
        subtitle="Nossos Sonhos"
        description="Se preferir não escolher um presente físico, ficaríamos imensamente felizes com sua contribuição para realizarmos a viagem dos nossos sonhos."
        image="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/34/dc/b8/photo0jpg.jpg?w=1000"
        icon={Plane}
        buttonText="Contribuir para a Viagem"
      />

      <CashGift 
        goalId={GOAL_IDS.PHOTOS}
        currentUser={user}
        title="Eternizando Momentos"
        subtitle="Memórias Únicas"
        description="Ajude-nos a guardar cada sorriso e emoção deste dia único. Sua contribuição será dedicada aos registros fotográficos que contam nossa história."
        image="https://images.pexels.com/photos/34933461/pexels-photo-34933461.jpeg"
        icon={Camera}
        buttonText="Contribuir para as Fotos"
        reverse={true}
        pixKey="92e4ba26-32c9-4c98-9521-7ff2fc96621c"
        pixQrCodeUrl="https://i.imgur.com/M9FZrur.jpeg"
      />

      <GiftList 
        gifts={gifts} 
        currentUser={user} 
        onClaim={handleClaimGift} 
        onUnclaim={handleUnclaimGift}
        onDelete={handleDeleteGift}
        onLogin={handleLogin}
      />
      
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
