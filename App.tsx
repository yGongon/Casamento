
import React, { useState, useEffect } from 'react';
import { Gift, GiftClaim } from './types';
import { INITIAL_GIFTS, INITIAL_GOALS, GOAL_IDS, ADMIN_EMAILS } from './constants';
import Hero from './components/Hero';
import EventDetails from './components/EventDetails';
import GiftList from './components/GiftList';
import CashGift from './components/CashGift';
import Footer from './components/Footer';
import { db, auth, googleProvider } from './firebase';
import { collection, onSnapshot, doc, updateDoc, arrayUnion, getDoc, deleteDoc, setDoc, addDoc, query, orderBy, limit, writeBatch } from 'firebase/firestore';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { Loader2, CheckCircle, XCircle, Plane, Camera, ShieldAlert, RefreshCw, AlertTriangle } from 'lucide-react';
import emailjs from '@emailjs/browser';

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-6 py-4 rounded-sm shadow-2xl animate-slide-up ${
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

  useEffect(() => {
    const giftsCollectionRef = collection(db, 'gifts');
    const unsubscribe = onSnapshot(giftsCollectionRef, (snapshot) => {
      const giftsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Gift[];
      setGifts(giftsData.sort((a, b) => a.id.localeCompare(b.id)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    const logsRef = collection(db, 'activity_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(30));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setActivityLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setToast({ message: "Acesso de administrador liberado!", type: 'success' });
    } catch (error) {
      setToast({ message: "Erro ao autenticar.", type: 'error' });
    }
  };

  const safeRestoreGifts = async () => {
    if (!isAdmin) return;
    if (!window.confirm("Isso irá apenas ADICIONAR os itens da lista original que por acaso sumiram. Seus itens marcados ou novos NÃO serão apagados. Deseja continuar?")) return;
    
    setLoading(true);
    try {
      const batch = writeBatch(db);
      for (const gift of INITIAL_GIFTS) {
        const giftRef = doc(db, 'gifts', gift.id);
        const snap = await getDoc(giftRef);
        if (!snap.exists()) {
          batch.set(giftRef, { ...gift, claims: [] });
        }
      }
      await batch.commit();
      setToast({ message: "Estrutura da lista restaurada!", type: 'success' });
    } catch (e) {
      setToast({ message: "Erro na restauração.", type: 'error' });
    } finally {
      setLoading(false);
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
      
      await addDoc(collection(db, 'activity_logs'), {
        action: manualByAdmin ? 'RECUPERAÇÃO_MANUAL' : 'PRESENTE_MARCADO',
        details: `${name} presenteou ${giftData.name}`,
        guest_name: name,
        gift_name: giftData.name,
        timestamp: Date.now()
      });

      setToast({ message: manualByAdmin ? "Presente restaurado!" : "Obrigado! ❤️", type: 'success' });

      const EMAILJS_PUBLIC_KEY = "VA3a0JkCjqXQUIec1";   
      if (EMAILJS_PUBLIC_KEY && !manualByAdmin) {
          emailjs.send("casamentowevelley", "template_l9getos", {
            guest_name: name,
            gift_name: giftData.name,
            message: `Ação realizada em ${new Date().toLocaleString('pt-BR')}`,
          }, EMAILJS_PUBLIC_KEY).catch(console.error);
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
      if (claimIndex !== undefined) updatedClaims.splice(claimIndex, 1);
      else updatedClaims = updatedClaims.filter(c => c.userId !== user.uid);

      await updateDoc(giftRef, { claims: updatedClaims });
      
      await addDoc(collection(db, 'activity_logs'), {
        action: 'PRESENTE_DESMARCADO',
        details: `Removido: ${removedClaim?.name} de ${giftData.name}`,
        timestamp: Date.now()
      });

      setToast({ message: "Marcação removida.", type: 'success' });
    } catch (error) {
      setToast({ message: "Erro ao desmarcar.", type: 'error' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-serenity" /></div>;

  return (
    <div className="min-h-screen bg-pureWhite">
      <Hero user={user} onLogin={handleLogin} onLogout={() => signOut(auth)} />
      
      {isAdmin && (
        <div className="bg-red-50 border-y border-red-100 py-3 px-4 flex justify-center items-center gap-6 sticky top-0 z-[60] shadow-sm">
          <div className="flex items-center gap-2 text-red-700 font-bold text-[10px] uppercase tracking-widest">
            <ShieldAlert size={14} /> Modo Administrador
          </div>
          <button onClick={safeRestoreGifts} className="flex items-center gap-2 px-4 py-1.5 bg-red-600 text-white rounded-full text-[10px] uppercase tracking-tighter hover:bg-red-700 transition-colors">
            <RefreshCw size={12} /> Restaurar Itens Faltantes
          </button>
        </div>
      )}

      <EventDetails />
      <CashGift goalId={GOAL_IDS.HONEYMOON} currentUser={user} title="Operação Lua de Mel" subtitle="Nossos Sonhos" description="Ficaríamos imensamente felizes com sua contribuição para nossa viagem." image="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/34/dc/b8/photo0jpg.jpg?w=1000" icon={Plane} buttonText="Contribuir" />
      <CashGift goalId={GOAL_IDS.PHOTOS} currentUser={user} title="Eternizando Momentos" subtitle="Memórias Únicas" description="Ajude-nos a guardar cada sorriso e emoção deste dia único." image="https://images.pexels.com/photos/34933461/pexels-photo-34933461.jpeg" icon={Camera} buttonText="Contribuir" reverse={true} />

      <GiftList 
        gifts={gifts} 
        currentUser={user} 
        onClaim={handleClaimGift} 
        onUnclaim={handleUnclaimGift} 
        onDelete={(id) => deleteDoc(doc(db, 'gifts', id))} 
        onAdd={(g) => setDoc(doc(db, 'gifts', `item-${Date.now()}`), { ...g, id: `item-${Date.now()}`, claims: [] })} 
        onLogin={handleLogin} 
      />
      
      {isAdmin && (
        <section className="bg-slate-900 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-yellow-400" />
                <h2 className="font-serif text-2xl">Histórico de Atividade (Recuperação)</h2>
              </div>
              <span className="text-[10px] uppercase tracking-widest opacity-50">Últimas 30 ações</span>
            </div>
            
            <div className="bg-white/5 rounded-sm border border-white/10 overflow-hidden">
              {activityLogs.length === 0 ? (
                <div className="p-12 text-center opacity-40 italic text-sm">Nenhuma atividade registrada ainda.</div>
              ) : (
                <div className="divide-y divide-white/5">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="p-4 flex justify-between items-center hover:bg-white/5 transition-colors">
                      <div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mr-3 ${log.action.includes('RECUPERAÇÃO') ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                          {log.action}
                        </span>
                        <p className="text-sm mt-1">{log.details}</p>
                      </div>
                      <span className="text-[10px] opacity-40 font-mono">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
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
