
import React, { useState, useEffect } from 'react';
import { Gift, GiftClaim } from './types';
import { INITIAL_GIFTS, INITIAL_GOALS, GOAL_IDS, ADMIN_EMAILS } from './constants';
import Hero from './components/Hero';
import EventDetails from './components/EventDetails';
import GiftList from './components/GiftList';
import CashGift from './components/CashGift';
import Footer from './components/Footer';
import { db, auth, googleProvider } from './firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, getDoc, deleteDoc, setDoc, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Loader2, CheckCircle, XCircle, Plane, Camera, History, ShieldAlert } from 'lucide-react';
import emailjs from '@emailjs/browser';

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-sm shadow-2xl animate-slide-up ${
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  const isAdmin = user && user.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Listener de Presentes
  useEffect(() => {
    const giftsCollectionRef = collection(db, 'gifts');
    const unsubscribe = onSnapshot(giftsCollectionRef, (snapshot) => {
      const giftsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Gift[];
      setGifts(giftsData.sort((a, b) => a.id.localeCompare(b.id)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Listener de Logs (Só para Admin)
  useEffect(() => {
    if (!isAdmin) return;
    const logsRef = collection(db, 'activity_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(20));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivityLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setToast({ message: "Acesso liberado!", type: 'success' });
    } catch (error) {
      setToast({ message: "Erro ao entrar.", type: 'error' });
    }
  };

  const handleClaimGift = async (giftId: string, name: string, isAnonymous: boolean, manualByAdmin: boolean = false) => {
    if (!user && !manualByAdmin) { handleLogin(); return; }
    try {
      const giftRef = doc(db, 'gifts', giftId);
      const giftSnap = await getDoc(giftRef);
      if (!giftSnap.exists()) return;
      const giftData = giftSnap.data() as Gift;
      
      const newClaim: GiftClaim = { 
        userId: manualByAdmin ? `admin-${Date.now()}` : user?.uid || 'anonymous', 
        name, 
        isAnonymous, 
        timestamp: Date.now() 
      };

      await updateDoc(giftRef, { claims: arrayUnion(newClaim) });
      
      // LOG DE SEGURANÇA (O Backup que salva vocês)
      await addDoc(collection(db, 'activity_logs'), {
        action: 'PRESENTE_MARCADO',
        details: `${name} presenteou ${giftData.name}`,
        guest_name: name,
        gift_name: giftData.name,
        timestamp: Date.now()
      });

      setToast({ message: manualByAdmin ? "Restauração concluída!" : "Obrigado! ❤️", type: 'success' });

      // Notificação de Email Reforçada
      const EMAILJS_PUBLIC_KEY = "VA3a0JkCjqXQUIec1";   
      if (EMAILJS_PUBLIC_KEY && !manualByAdmin) {
          emailjs.send("casamentowevelley", "template_l9getos", {
            guest_name: name,
            gift_name: giftData.name,
            message: isAnonymous ? "Presente anônimo" : `Presenteado por ${name}`,
            date: new Date().toLocaleString('pt-BR')
          }, EMAILJS_PUBLIC_KEY).catch(err => console.error("Erro EmailJS:", err));
      }
    } catch (error) {
      setToast({ message: "Erro ao salvar.", type: 'error' });
    }
  };

  const handleUnclaimGift = async (giftId: string, claimIndex?: number) => {
    if (!user) return;
    try {
      const giftRef = doc(db, 'gifts', giftId);
      const giftSnap = await getDoc(giftRef);
      if (!giftSnap.exists()) return;
      const giftData = giftSnap.data() as Gift;
      let updatedClaims = [...(giftData.claims || [])];
      
      const removedClaim = claimIndex !== undefined ? updatedClaims[claimIndex] : updatedClaims.find(c => c.userId === user.uid);

      if (claimIndex !== undefined) {
        updatedClaims.splice(claimIndex, 1);
      } else {
        updatedClaims = updatedClaims.filter(c => c.userId !== user.uid);
      }

      await updateDoc(giftRef, { claims: updatedClaims });
      
      await addDoc(collection(db, 'activity_logs'), {
        action: 'PRESENTE_DESMARCADO',
        details: `Removido: ${removedClaim?.name} de ${giftData.name}`,
        timestamp: Date.now()
      });

      setToast({ message: "Removido.", type: 'success' });
    } catch (error) {
      setToast({ message: "Erro ao desmarcar.", type: 'error' });
    }
  };

  const handleAddGift = async (newGift: Omit<Gift, 'id' | 'claims'>) => {
    const id = `item-${Date.now()}`;
    await setDoc(doc(db, 'gifts', id), { ...newGift, id, claims: [] });
    setToast({ message: "Item adicionado!", type: 'success' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-serenity" /></div>;

  return (
    <div className="min-h-screen bg-pureWhite">
      <Hero user={user} onLogin={handleLogin} onLogout={() => signOut(auth)} />
      <EventDetails />
      
      <CashGift 
        goalId={GOAL_IDS.HONEYMOON} 
        currentUser={user} 
        title="Operação Lua de Mel" 
        subtitle="Nossos Sonhos" 
        description="Ficaríamos imensamente felizes com sua contribuição para nossa viagem." 
        image="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/34/dc/b8/photo0jpg.jpg?w=1000" 
        icon={Plane} 
        buttonText="Contribuir" 
      />
      
      <CashGift 
        goalId={GOAL_IDS.PHOTOS} 
        currentUser={user} 
        title="Eternizando Momentos" 
        subtitle="Memórias Únicas" 
        description="Ajude-nos a guardar cada sorriso e emoção deste dia único." 
        image="https://images.pexels.com/photos/34933461/pexels-photo-34933461.jpeg" 
        icon={Camera} 
        buttonText="Contribuir" 
        reverse={true} 
      />

      <GiftList 
        gifts={gifts} 
        currentUser={user} 
        onClaim={handleClaimGift} 
        onUnclaim={handleUnclaimGift} 
        onDelete={(id) => deleteDoc(doc(db, 'gifts', id))} 
        onAdd={handleAddGift} 
        onLogin={handleLogin} 
      />
      
      {/* PAINEL DE MONITORAMENTO ADMIN */}
      {isAdmin && activityLogs.length > 0 && (
        <section className="bg-gray-50 py-12 px-4 border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-2 mb-6 text-red-600">
              <ShieldAlert size={20} />
              <h2 className="font-sans text-xs font-bold uppercase tracking-widest">Painel de Segurança & Logs (Admin)</h2>
            </div>
            <div className="space-y-2">
              {activityLogs.map((log) => (
                <div key={log.id} className="bg-white p-3 rounded-sm border border-gray-100 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-[10px] font-bold text-serenityDark uppercase">{log.action}</p>
                    <p className="text-xs text-fineBlack">{log.details || log.message}</p>
                  </div>
                  <span className="text-[9px] text-gray-400">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default App;
