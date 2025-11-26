import React, { useState, useEffect } from 'react';
import { Heart, Copy, Check, X, LucideIcon, Edit2, Save, TrendingUp } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { PIX_KEY, PIX_HOLDER_NAME, PIX_QR_CODE_URL, ADMIN_EMAILS } from '../constants';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User } from 'firebase/auth';

interface CashGiftProps {
  goalId?: string; // Optional: If provided, enables progress bar
  currentUser?: User | null;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  icon: LucideIcon;
  buttonText: string;
  reverse?: boolean;
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
  reverse = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Goal State
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetAmount, setTargetAmount] = useState(1); // Avoid div by zero
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newAmountInput, setNewAmountInput] = useState('');
  const [dbError, setDbError] = useState(false);

  // Check Admin Status
  useEffect(() => {
    if (currentUser && currentUser.email && ADMIN_EMAILS.includes(currentUser.email)) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [currentUser]);

  // Listen to Firestore Goal
  useEffect(() => {
    if (!goalId) return;

    const goalRef = doc(db, 'cash_goals', goalId);
    
    // Adding error callback to avoid "Uncaught Error" when permissions are missing
    const unsubscribe = onSnapshot(
      goalRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setCurrentAmount(data.currentAmount || 0);
          setTargetAmount(data.targetAmount || 1);
          setDbError(false);
        }
      },
      (error) => {
        console.warn("Firestore access restricted (CashGift):", error.message);
        setDbError(true);
        // Fallback to initial props or 0 if needed, mostly handled by state defaults
      }
    );

    return () => unsubscribe();
  }, [goalId]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateAmount = async () => {
    if (!goalId || !newAmountInput) return;
    
    try {
      const val = parseFloat(newAmountInput);
      if (isNaN(val)) return;

      const goalRef = doc(db, 'cash_goals', goalId);
      await updateDoc(goalRef, {
        currentAmount: val
      });
      setIsEditing(false);
      setNewAmountInput('');
    } catch (error) {
      console.error("Error updating goal:", error);
      alert("Erro ao atualizar valor. Verifique se você tem permissão.");
    }
  };

  const progressPercentage = Math.min((currentAmount / targetAmount) * 100, 100);
  
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <section className="py-20 px-4 bg-serenityLight/30 border-t border-white overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className={`bg-white rounded-sm shadow-lg overflow-hidden flex flex-col ${reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
            
            {/* Image Side */}
            <div className="md:w-2/5 bg-serenity relative h-64 md:h-auto overflow-hidden group">
              <img 
                src={image} 
                alt={title} 
                className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-serenityDark/60 to-transparent flex flex-col justify-end p-8 text-white">
                <Icon className="w-8 h-8 mb-4 animate-float" />
                <h3 className="font-serif text-3xl italic">{subtitle}</h3>
              </div>
            </div>

            {/* Content Side */}
            <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center items-start space-y-6 w-full">
              <div className="w-full">
                <h3 className="font-serif text-3xl text-fineBlack mb-2">{title}</h3>
                <div className="w-12 h-px bg-serenity mb-4" />
                <p className="font-sans text-fineBlack/70 leading-relaxed mb-6">
                  {description}
                </p>

                {/* Progress Bar (Featured Section) */}
                {goalId && !dbError && (
                  <div className="mb-8 w-full">
                    <div className="bg-white border border-serenity/30 shadow-md rounded-md p-6 relative overflow-hidden group">
                      {/* Decorative background blob */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-serenityLight rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-80 transition-opacity"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp size={16} className="text-serenityDark" />
                          <span className="text-xs font-sans uppercase tracking-widest text-fineBlack/50">Meta Atual</span>
                        </div>
                        
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-4xl md:text-5xl font-serif font-bold text-serenityDark">
                            {formatCurrency(currentAmount)}
                          </span>
                          <span className="text-sm font-sans text-fineBlack/40 font-medium">
                            de {formatCurrency(targetAmount)}
                          </span>
                        </div>

                        {/* Thicker, more visible bar */}
                        <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner border border-gray-100">
                          <div 
                            className="h-full bg-gradient-to-r from-serenity to-serenityDark shadow-lg relative"
                            style={{ width: `${progressPercentage}%`, transition: 'width 1.5s ease-out' }}
                          >
                            <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse-slow"></div>
                          </div>
                        </div>
                        
                        <div className="text-right mt-1">
                          <span className="text-[10px] font-sans text-fineBlack/40">{Math.round(progressPercentage)}% completado</span>
                        </div>
                      </div>

                      {/* Admin Panel inside the card */}
                      {isAdmin && (
                        <div className="mt-4 pt-4 border-t border-dashed border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold text-gray-400">Painel Admin</span>
                            {!isEditing ? (
                              <button 
                                onClick={() => { setIsEditing(true); setNewAmountInput(currentAmount.toString()); }}
                                className="text-xs text-serenityDark hover:underline flex items-center gap-1 font-medium bg-serenityLight/50 px-2 py-1 rounded-sm"
                              >
                                <Edit2 size={10} /> Atualizar Valor
                              </button>
                            ) : (
                              <button 
                                onClick={() => setIsEditing(false)}
                                className="text-xs text-red-400 hover:underline"
                              >
                                Cancelar
                              </button>
                            )}
                          </div>
                          
                          {isEditing && (
                            <div className="flex items-center gap-2 mt-3 animate-fade-in">
                              <span className="text-sm text-gray-500 font-serif">R$</span>
                              <input 
                                type="number" 
                                value={newAmountInput}
                                onChange={(e) => setNewAmountInput(e.target.value)}
                                className="w-full border-b-2 border-serenity bg-transparent py-1 text-lg font-serif outline-none text-serenityDark"
                                placeholder="0.00"
                              />
                              <button 
                                onClick={handleUpdateAmount}
                                className="bg-serenity text-white p-2 rounded-sm hover:bg-serenityDark shadow-md transition-all hover:scale-105"
                              >
                                <Save size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="group relative px-8 py-3 bg-fineBlack text-white font-sans text-sm tracking-widest overflow-hidden rounded-sm hover:shadow-lg transition-all duration-300 w-full md:w-auto text-center"
              >
                <span className="relative z-10 flex items-center justify-center md:justify-start gap-2 group-hover:gap-4 transition-all uppercase">
                  {buttonText} <Heart size={14} className="text-serenity fill-serenity" />
                </span>
                <div className="absolute inset-0 bg-serenityDark transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out" />
              </button>
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Modal Pix */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-serenityDark/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-lg p-8 rounded-sm shadow-2xl relative animate-slide-up border border-white/50">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-fineBlack/40 hover:text-fineBlack transition-colors p-2"
            >
              <X size={24} />
            </button>

            <div className="text-center space-y-6">
              <div className="inline-flex p-4 bg-serenityLight rounded-full text-serenityDark mb-2">
                <Heart size={32} />
              </div>
              
              <h3 className="font-serif text-3xl text-fineBlack">Obrigado pelo Carinho!</h3>
              <p className="font-sans text-sm text-fineBlack/60 max-w-xs mx-auto">
                Sinta-se livre para contribuir com o valor que seu coração desejar. O valor cai direto em nossa conta.
              </p>

              {/* QR Code Box */}
              <div className="bg-white p-4 border border-fineBlack/10 rounded-sm inline-block shadow-inner">
                <img 
                  src={PIX_QR_CODE_URL} 
                  alt="QR Code Pix" 
                  className="w-48 h-48 object-contain mix-blend-multiply"
                />
              </div>

              {/* Pix Key Copy */}
              <div className="bg-serenityLight/50 p-4 rounded-sm flex items-center justify-between gap-4 border border-serenity/20">
                <div className="text-left overflow-hidden">
                  <p className="text-xs text-fineBlack/50 uppercase tracking-wider mb-1">Chave Pix</p>
                  <p className="font-mono text-fineBlack text-sm truncate">{PIX_KEY}</p>
                  <p className="text-[10px] text-fineBlack/40 mt-1">{PIX_HOLDER_NAME}</p>
                </div>
                <button 
                  onClick={handleCopyPix}
                  className={`p-2 rounded-full transition-all duration-300 ${copied ? 'bg-green-500 text-white' : 'bg-white text-serenityDark hover:bg-serenity hover:text-white shadow-sm'}`}
                  title="Copiar Chave"
                >
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