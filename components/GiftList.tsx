
import React, { useState, useMemo, useEffect } from 'react';
import { Gift } from '../types';
import { Check, Gift as GiftIcon, X, Lock, Trash2, LogIn, Info } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { User } from 'firebase/auth';

interface GiftListProps {
  gifts: Gift[];
  currentUser: User | null;
  onClaim: (giftId: string, name: string, isAnonymous: boolean) => void;
  onUnclaim: (giftId: string) => void;
  onLogin: () => void;
}

const GiftList: React.FC<GiftListProps> = ({ gifts, currentUser, onClaim, onUnclaim, onLogin }) => {
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Pre-fill name if logged in
  useEffect(() => {
    if (currentUser?.displayName && selectedGiftId) {
      setGuestName(currentUser.displayName);
    }
  }, [currentUser, selectedGiftId]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(gifts.map(g => g.category)));
    return ['Todos', ...cats.sort()];
  }, [gifts]);

  // Filter gifts based on selection
  const filteredGifts = useMemo(() => {
    if (selectedCategory === 'Todos') return gifts;
    return gifts.filter(g => g.category === selectedCategory);
  }, [gifts, selectedCategory]);

  // Group gifts in chunks of 6 (2 rows on desktop/tablet)
  const giftChunks = useMemo(() => {
    const size = 6;
    const chunks = [];
    for (let i = 0; i < filteredGifts.length; i += size) {
      chunks.push(filteredGifts.slice(i, i + size));
    }
    return chunks;
  }, [filteredGifts]);

  const handleOpenModal = (giftId: string) => {
    if (!currentUser) {
      onLogin();
      return;
    }
    setSelectedGiftId(giftId);
    setGuestName(currentUser.displayName || '');
    setIsAnonymous(false);
  };

  const handleCloseModal = () => {
    setSelectedGiftId(null);
  };

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGiftId) {
      let finalName = guestName.trim();
      if (finalName === '') finalName = 'Convidado';
      
      onClaim(selectedGiftId, finalName, isAnonymous);
      handleCloseModal();
    }
  };

  return (
    <section className="relative bg-pureWhite py-20 px-4 md:px-8 overflow-hidden" id="lista-de-presentes">
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-serenity/30 rounded-full mix-blend-multiply filter blur-[60px] animate-blob opacity-90" />
        <div className="absolute top-0 -right-20 w-96 h-96 bg-blue-200/60 rounded-full mix-blend-multiply filter blur-[60px] animate-blob opacity-90" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Header */}
        <ScrollReveal>
          <div className="text-center mb-12 space-y-6">
            <h2 className="font-serif text-4xl md:text-5xl text-fineBlack">Com Carinho</h2>
            <div className="w-16 h-px bg-serenity mx-auto" />
            <div className="max-w-3xl mx-auto space-y-4">
               <p className="font-sans font-light text-fineBlack/70 leading-relaxed text-sm md:text-base">
                 Essas são algumas opções da nossa lista de necessidades para nossa casa, sinta-se à vontade para nos presentear ou não. 
                 <br/><span className="font-medium text-serenityDark">A sua presença é o mais importante.</span>
               </p>
               <p className="font-sans text-xs text-fineBlack/50 italic flex items-center justify-center gap-2">
                 <Info size={12} /> As imagens são meramente ilustrativas, mas preferimos itens na cor <strong className="text-fineBlack">PRETA</strong>.
               </p>
            </div>
            
            {!currentUser && (
               <div className="mt-4 bg-serenityLight/50 inline-block px-6 py-3 rounded-sm border border-serenity/20">
                  <p className="flex items-center gap-2 text-xs md:text-sm font-sans text-serenityDark">
                    <Lock size={14} /> Para presentear, é necessário fazer login com sua conta Google.
                  </p>
               </div>
            )}
          </div>
        </ScrollReveal>

        {/* Category Filter */}
        <ScrollReveal delay={100}>
          <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`
                  px-6 py-2 text-sm font-sans tracking-wide rounded-full transition-all duration-300 border
                  ${selectedCategory === cat 
                    ? 'bg-serenity text-white border-serenity shadow-md transform scale-105' 
                    : 'bg-white/50 text-fineBlack/60 border-transparent hover:bg-white hover:shadow-sm hover:text-fineBlack'
                  }
                `}
              >
                {cat}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Grid revealed in chunks of 6 (2 rows) */}
        <div className="space-y-8 md:space-y-12">
          {giftChunks.map((chunk, chunkIndex) => (
            <ScrollReveal key={chunkIndex} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {chunk.map((gift) => {
                const claims = gift.claims || [];
                const claimedCount = claims.length;
                const maxQuantity = gift.maxQuantity || 1;
                const isFullyClaimed = claimedCount >= maxQuantity;
                const myClaim = currentUser ? claims.find(c => c.userId === currentUser.uid) : null;
                const isClaimedByMe = !!myClaim;

                return (
                  <div 
                    key={gift.id}
                    className={`group relative bg-white/80 backdrop-blur-sm border border-serenityLight rounded-sm overflow-hidden transition-all duration-500 hover:shadow-xl ${
                      isClaimedByMe ? 'border-green-200 ring-1 ring-green-100' : ''
                    } ${isFullyClaimed && !isClaimedByMe ? 'opacity-80' : 'hover:border-serenity/30'}`}
                  >
                    {/* Category Tag */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[10px] uppercase tracking-widest font-sans text-fineBlack/70 shadow-sm rounded-sm">
                        {gift.category}
                      </span>
                    </div>

                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img 
                        src={gift.image} 
                        alt={gift.name} 
                        className={`w-full h-full object-cover transition-transform duration-700 ${isFullyClaimed && !isClaimedByMe ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}
                      />
                      {isFullyClaimed && !isClaimedByMe && (
                        <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                           <span className="px-4 py-2 font-serif italic text-lg shadow-sm border backdrop-blur-sm bg-white/90 text-fineBlack border-serenity/20">
                             Já escolhido
                           </span>
                        </div>
                      )}
                      {isClaimedByMe && (
                        <div className="absolute inset-0 bg-green-500/10 flex items-center justify-center">
                           <span className="px-4 py-2 font-serif italic text-lg shadow-sm border backdrop-blur-sm bg-green-50 text-green-800 border-green-200">
                             Escolhido por você
                           </span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-8 text-center space-y-4">
                      <h3 className="font-serif text-2xl text-fineBlack">{gift.name}</h3>
                      <p className="font-sans text-sm font-light text-fineBlack/60 leading-relaxed min-h-[3rem]">
                        {gift.description}
                      </p>

                      {isClaimedByMe ? (
                         <div className="pt-4 space-y-3">
                           <p className="text-xs text-green-600 font-sans">
                             Você presenteou este item. <br/>
                             {isAnonymous && <span className="text-fineBlack/40">(Modo Anônimo)</span>}
                           </p>
                           <button
                             onClick={() => onUnclaim(gift.id)}
                             className="inline-flex items-center gap-2 px-6 py-2 border border-red-200 text-red-500 font-sans text-xs tracking-wider hover:bg-red-50 transition-colors rounded-sm uppercase"
                           >
                             <Trash2 size={14} />
                             Desmarcar
                           </button>
                         </div>
                      ) : isFullyClaimed ? (
                        <div className="pt-4 border-t border-serenity/20">
                          <div className="flex items-center justify-center gap-2 text-serenityDark font-medium font-sans text-sm">
                            <Check size={16} />
                            <span>Já presenteado</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOpenModal(gift.id)}
                          className="mt-4 inline-flex items-center gap-2 px-8 py-3 bg-serenity text-white font-sans text-sm tracking-wider hover:bg-serenityDark transition-colors rounded-sm shadow-sm hover:shadow-md"
                        >
                          {currentUser ? <GiftIcon size={16} /> : <LogIn size={16} />}
                          {currentUser ? 'VOU PRESENTEAR' : 'LOGIN PARA PRESENTEAR'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Modal Overlay */}
      {selectedGiftId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-serenityDark/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl relative animate-slide-up border border-white/50">
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-fineBlack/40 hover:text-fineBlack transition-colors"
            >
              <X size={24} />
            </button>
            <h3 className="font-serif text-3xl text-fineBlack mb-2">Confirmar Presente</h3>
            <p className="font-sans text-sm text-fineBlack/60 mb-6">
              Que alegria! Confirme seu nome como aparecerá na lista ou escolha a opção anônima.
            </p>
            <form onSubmit={handleSubmitClaim} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-xs uppercase tracking-wider text-fineBlack/50 mb-2">Seu Nome</label>
                <input
                  type="text"
                  id="name"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full border-b border-fineBlack/10 py-2 text-fineBlack outline-none focus:border-serenity transition-colors bg-transparent placeholder-fineBlack/20"
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-fineBlack/20 checked:border-serenity checked:bg-serenity transition-all"
                  />
                  <Check 
                    size={14} 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                  />
                </div>
                <label htmlFor="anonymous" className="text-sm font-sans text-fineBlack/70 cursor-pointer select-none">
                  Esconder meu nome apenas na lista pública
                </label>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-serenity text-white font-sans text-sm tracking-widest hover:bg-serenityDark transition-colors uppercase rounded-sm shadow-md"
              >
                Confirmar Escolha
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default GiftList;
