
import React, { useState, useEffect } from 'react';
import { Heart, Copy, Check, X, LucideIcon, Edit2, Save, TrendingUp } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { PIX_KEY, PIX_HOLDER_NAME, PIX_QR_CODE_URL, ADMIN_EMAILS } from '../constants';
import { doc, onSnapshot, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

interface CashGiftProps {
  goalId?: string;
  currentUser?: User | null;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: LucideIcon;
  buttonText: string;
  reverse?: boolean;
  pixKey?: string;
  pixQrCodeUrl?: string;
}

const CashGift: React.FC<CashGiftProps> = ({ 
  goalId,
  currentUser,
  title, 
  subtitle, 
  description, 
  image, 
  icon: Icon, 
  buttonText,
  reverse = false,
  pixKey,
  pixQrCodeUrl
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetAmount, setTargetAmount] = useState(1);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newAmountInput, setNewAmountInput] = useState('');

  const displayPixKey = pixKey || PIX_KEY;
  const displayQrCode = pixQrCodeUrl || PIX_QR_CODE_URL;

  useEffect(() => {
    setIsAdmin(!!currentUser?.email && ADMIN_EMAILS.includes(currentUser.email));
  }, [currentUser]);

  useEffect(() => {
    if (!goalId) return;
    const unsubscribe = onSnapshot(doc(db, 'cash_goals', goalId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCurrentAmount(data.currentAmount || 0);
        setTargetAmount(data.targetAmount || 1);
      }
    });
    return () => unsubscribe();
  }, [goalId]);

  const handleUpdateAmount = async () => {
    if (!goalId || !newAmountInput) return;
    try {
      const val = parseFloat(newAmountInput);
      if (isNaN(val)) return;
      await updateDoc(doc(db, 'cash_goals', goalId), { currentAmount: val });
      
      await addDoc(collection(db, 'activity_logs'), {
        action: 'META_ATUALIZADA',
        details: `${title} alterada para R$ ${val}`,
        timestamp: Date.now()
      });

      setIsEditing(false);
      setNewAmountInput('');
    } catch (error) {
      alert("Erro ao atualizar.");
    }
  };

  const progressPercentage = Math.min((currentAmount / targetAmount) * 100, 100);
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <section className="py-20 px-4 bg-serenityLight/30 border-t border-white">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className={`bg-white rounded-sm shadow-lg overflow-hidden flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
            <div className="md:w-2/5 bg-serenity relative h-64 md:h-auto group">
              <img src={image} alt={title} className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-serenityDark/60 to-transparent flex flex-col justify-end p-8 text-white">
                <Icon className="w-8 h-8 mb-4 animate-float" />
                <h3 className="font-serif text-3xl italic">{subtitle}</h3>
              </div>
            </div>

            <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center items-start space-y-6">
              <div className="w-full">
                <h3 className="font-serif text-3xl text-fineBlack mb-2">{title}</h3>
                <div className="w-12 h-px bg-serenity mb-4" />
                <p className="font-sans text-fineBlack/70 leading-relaxed mb-6">{description}</p>

                {goalId && (
                  <div className="mb-8 w-full bg-gray-50 p-6 rounded-sm border border-gray-100">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-serif font-bold text-serenityDark">{formatCurrency(currentAmount)}</span>
                      <span className="text-xs font-sans text-gray-400 uppercase tracking-widest">de {formatCurrency(targetAmount)}</span>
                    </div>

                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-serenity transition-all duration-1000" style={{ width: `${progressPercentage}%` }} />
                    </div>

                    {isAdmin && (
                      <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                        {!isEditing ? (
                          <button onClick={() => { setIsEditing(true); setNewAmountInput(currentAmount.toString()); }} className="text-[10px] uppercase font-bold text-serenityDark hover:underline flex items-center gap-1">
                            <Edit2 size={10} /> Restaurar Valor Acumulado
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 animate-fade-in">
                            <input type="number" value={newAmountInput} onChange={e => setNewAmountInput(e.target.value)} className="w-full border-b py-1 text-sm outline-none" placeholder="Valor" />
                            <button onClick={handleUpdateAmount} className="bg-serenity text-white p-1 rounded-sm"><Save size={14} /></button>
                            <button onClick={() => setIsEditing(false)} className="text-[10px] text-red-400">X</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-fineBlack text-white font-sans text-sm tracking-widest rounded-sm hover:shadow-lg transition-all w-full md:w-auto uppercase flex items-center justify-center gap-2">
                {buttonText} <Heart size={14} className="text-serenity fill-serenity" />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-serenityDark/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-lg p-8 rounded-sm shadow-2xl relative border border-white/50">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-gray-400 p-2"><X size={24} /></button>
            <div className="text-center space-y-6">
              <h3 className="font-serif text-3xl text-fineBlack">Obrigado pelo Carinho!</h3>
              <div className="bg-white p-4 border rounded-sm inline-block"><img src={displayQrCode} alt="Pix" className="w-48 h-48 object-contain" /></div>
              <div className="bg-serenityLight/50 p-4 rounded-sm flex items-center justify-between gap-4 border border-serenity/20">
                <div className="text-left overflow-hidden">
                  <p className="text-[10px] uppercase tracking-wider mb-1">Chave Pix</p>
                  <p className="font-mono text-sm truncate">{displayPixKey}</p>
                  <p className="text-[9px] text-gray-400">{PIX_HOLDER_NAME}</p>
                </div>
                <button onClick={() => { navigator.clipboard.writeText(displayPixKey); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`p-2 rounded-full transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white text-serenityDark'}`}>
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CashGift;
