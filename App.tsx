
import React, { useState, useEffect } from 'react';
import { Gift, GiftClaim } from './types';
import { INITIAL_GIFTS, INITIAL_GOALS, GOAL_IDS, ADMIN_EMAILS } from './constants';
import Hero from './components/Hero';
import EventDetails from './components/EventDetails';
import GiftList from './components/GiftList';
import CashGift from './components/CashGift';
import Footer from './components/Footer';
import { db, auth, googleProvider } from './firebase';
import { collection, onSnapshot, doc, updateDoc, getDocs, writeBatch, arrayUnion, getDoc, deleteDoc, setDoc } from 'firebase/firestore';
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
    const settingsDocRef = doc(db, 'settings', 'setup');

    const unsubscribe = onSnapshot(
      giftsCollectionRef, 
      (snapshot) => {
        const giftsData = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Gift[];
        
        // Custom sort by original ID or timestamp
        const sortedGifts = giftsData.sort((a, b) => {
           const getNum = (id: string) => {
             const parts = id.split('-');
             if (parts.length > 1) return parseInt(parts[1]) || 0;
             return 0;
           };
           const nA = getNum(a.id);
           const nB = getNum(b.id);
           if (nA !== nB) return nA - nB;
           return (a.id > b.id) ? 1 : -1;
        });
        
        setGifts(sortedGifts);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Firebase Error (Loading Gifts):", err);
        setError("Erro de conexão com a lista de presentes.");
        setLoading(false);
      }
    );

    const seedDatabase = async () => {
      try {
        const setupSnap = await getDoc(settingsDocRef);
        if (setupSnap.exists() && setupSnap.data().completed) return;

        const batch = writeBatch(db);
        INITIAL_GIFTS.forEach((gift) => {
          const docRef = doc(db, 'gifts', gift.id);
          batch.set(docRef, { ...gift, claims: [] });
        });
        INITIAL_GOALS.forEach((goal) => {
          const goalRef = doc(db, 'cash_goals', goal.id);
          batch.set(goalRef, goal);
        });
        batch.set(settingsDocRef, { completed: true, timestamp: Date.now() });
        await batch.commit();
      } catch (err) {
        console.warn("Seed/Setup Error:", err);
      }
    };

    seedDatabase();
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setToast({ message: "Bem-vindo(a)!", type: 'success' });
    } catch (error) {
      setToast({ message: "Erro ao fazer login.", type: 'error' });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setToast({ message: "Você saiu.", type: 'success' });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClaimGift = async (giftId: string, name: string, isAnonymous: boolean) => {
    if (!user) { handleLogin(); return; }
    try {
      const giftRef = doc(db, 'gifts', giftId);
      const giftSnap = await getDoc(giftRef);
      if (!giftSnap.exists()) return;
      const giftData = giftSnap.data() as Gift;
      const currentClaims = giftData.claims || [];
      if (currentClaims.length >= (giftData.maxQuantity || 1)) {
         setToast({ message: "Este item já foi presenteado.", type: 'error' });
         return;
      }
      const newClaim: GiftClaim = { userId: user.uid, name, isAnonymous, timestamp: Date.now() };
      await updateDoc(giftRef, { claims: arrayUnion(newClaim) });
      setToast({ message: "Obrigado pelo presente! ❤️", type: 'success' });

      // Email notification logic
      const EMAILJS_SERVICE_ID = "casamentowevelley";   
      const EMAILJS_TEMPLATE_ID = "template_l9getos"; 
      const EMAILJS_PUBLIC_KEY = "VA3a0JkCjqXQUIec1";   
      if (EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY) {
          emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_email: 'wevelleytwich@gmail.com',
            gift_name: giftData.name,
            guest_name: name,
            is_anonymous: isAnonymous ? '(Anônimo)' : '',
            timestamp: new Date().toLocaleString('pt-BR')
          }, EMAILJS_PUBLIC_KEY).catch(console.error);
      }
    } catch (error) {
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
      const updatedClaims = (giftData.claims || []).filter(c => c.userId !== user.uid);
      await updateDoc(giftRef, { claims: updatedClaims });
      setToast({ message: "Presente desmarcado.", type: 'success' });
    } catch (error) {
      setToast({ message: "Erro ao desmarcar.", type: 'error' });
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) return;
    if (!window.confirm("Deseja mesmo remover este presente? Esta ação não pode ser desfeita.")) return;
    try {
      await deleteDoc(doc(db, 'gifts', giftId));
      setToast({ message: "Presente removido permanentemente.", type: 'success' });
    } catch (error) {
      setToast({ message: "Erro ao remover.", type: 'error' });
    }
  };

  const handleAddGift = async (newGift: Omit<Gift, 'id' | 'claims'>) => {
    if (!user || !ADMIN_EMAILS.includes(user.email || '')) return;
    try {
      const id = `manual-${Date.now()}`;
      await setDoc(doc(db, 'gifts', id), { ...newGift, id, claims: [] });
      setToast({ message: "Novo presente adicionado!", type: 'success' });
    } catch (error) {
      setToast({ message: "Erro ao adicionar presente.", type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-pureWhite text-serenityDark">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pureWhite">
      <Hero user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <EventDetails />
      
      <CashGift 
        goalId={GOAL_IDS.HONEYMOON}
        currentUser={user}
        title="Operação Lua de Mel"
        subtitle="Nossos Sonhos"
        description="Ficaríamos imensamente felizes com sua contribuição para realizarmos a viagem dos nossos sonhos."
        image="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/34/dc/b8/photo0jpg.jpg?w=1000"
        icon={Plane}
        buttonText="Contribuir para a Viagem"
      />

      <CashGift 
        goalId={GOAL_IDS.PHOTOS}
        currentUser={user}
        title="Eternizando Momentos"
        subtitle="Memórias Únicas"
        description="Ajude-nos a guardar cada sorriso e emoção deste dia único."
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
        onAdd={handleAddGift}
        onLogin={handleLogin}
      />
      
      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
