
import React, { useState, useMemo, useEffect } from 'react';
import { Gift } from '../types';
import { Check, Gift as GiftIcon, X, Lock, Trash2, LogIn, Info, Settings, Plus, Camera, Type } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { User } from 'firebase/auth';
import { ADMIN_EMAILS } from '../constants';

interface GiftListProps {
  gifts: Gift[];
  currentUser: User | null;
  onClaim: (giftId: string, name: string, isAnonymous: boolean) => void;
  onUnclaim: (giftId: string) => void;
  onDelete: (giftId: string) => void;
  onAdd: (gift: Omit<Gift, 'id' | 'claims'>) => void;
  onLogin: () => void;
}

const GiftList: React.FC<GiftListProps> = ({ gifts, currentUser, onClaim, onUnclaim, onDelete, onAdd, onLogin }) => {
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Add Gift Form State
  const [newGift, setNewGift] = useState({ name: '', description: '', image: '', category: 'Cozinha', maxQuantity: 1 });

  const isAdmin = currentUser && currentUser.email && ADMIN_EMAILS.includes(currentUser.email);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(gifts.map(g => g.category)));
    return ['Todos', ...cats.sort()];
  }, [gifts]);

  const filteredGifts = useMemo(() => {
    if (selectedCategory === 'Todos') return gifts;
    return gifts.filter(g => g.category === selectedCategory);
  }, [gifts, selectedCategory]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(newGift);
    setIsAddModalOpen(false);
    setNewGift({ name: '', description: '', image: '', category: 'Cozinha', maxQuantity: 1 });
  };

  return (
    <section className="relative bg-pureWhite py-20 px-4 md:px-8 overflow-hidden" id="lista-de-presentes">
      <div className="relative z-10 max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12 space-y-6">
            <h2 className="font-serif text-4xl md:text-5xl text-fineBlack">Com Carinho</h2>
            <div className="w-16 h-px bg-serenity mx-auto" />
            <p className="font-sans font-light text-fineBlack/70 leading-relaxed text-sm max-w-2xl mx-auto">
              Sinta-se à vontade para nos presentear. Sua presença é o mais importante para nós.
            </p>
            
            {isAdmin && (
              <div className="flex justify-center gap-4 mt-8">
                <button 
                  onClick={() => setIsAdminMode(!isAdminMode)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full border text-xs font-sans tracking-widest transition-all ${isAdminMode ? 'bg-serenityDark text-white border-serenityDark' : 'bg-white text-serenityDark border-serenity'}`}
                >
                  <Settings size={14} className={isAdminMode ? 'animate-spin' : ''} />
                  {isAdminMode ? 'SAIR DO MODO ADMIN' : 'GERENCIAR LISTA'}
                </button>
                {isAdminMode && (
                  <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-full text-xs font-sans tracking-widest shadow-md hover:bg-green-600 transition-all"
                  >
                    <Plus size={14} /> ADICIONAR ITEM
                  </button>
                )}
              </div>
            )}
          </div>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 text-xs font-sans tracking-widest rounded-full border transition-all ${selectedCategory === cat ? 'bg-serenity text-white border-serenity shadow-sm' : 'bg-white text-fineBlack/50 border-transparent hover:text-fineBlack'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGifts.map((gift) => {
            const claims = gift.claims || [];
            const isFullyClaimed = claims.length >= (gift.maxQuantity || 1);
            const isClaimedByMe = currentUser ? claims.some(c => c.userId === currentUser.uid) : false;

            return (
              <div key={gift.id} className="group relative bg-white border border-serenityLight rounded-sm overflow-hidden transition-all duration-300 hover:shadow-lg">
                
                {isAdminMode && (
                  <button 
                    onClick={() => onDelete(gift.id)}
                    className="absolute top-3 right-3 z-30 p-2 bg-red-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform"
                    title="Excluir Permanentemente"
                  >
                    <Trash2 size={16} />
                  </button>
                )}

                <div className="aspect-[4/3] overflow-hidden relative">
                  <img src={gift.image} alt={gift.name} className={`w-full h-full object-cover transition-transform duration-700 ${isFullyClaimed && !isClaimedByMe ? 'grayscale opacity-40' : 'group-hover:scale-105'}`} />
                  {isFullyClaimed && !isClaimedByMe && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-[2px]">
                      <span className="px-4 py-2 bg-white/90 font-serif italic text-lg shadow-sm">Já presenteado</span>
                    </div>
                  )}
                  {isClaimedByMe && (
                    <div className="absolute inset-0 flex items-center justify-center bg-green-50/20 backdrop-blur-[2px]">
                      <span className="px-4 py-2 bg-green-500 text-white font-sans text-xs tracking-widest uppercase shadow-md">Escolhido por você</span>
                    </div>
                  )}
                </div>

                <div className="p-8 text-center space-y-4">
                  <span className="text-[10px] uppercase tracking-widest text-serenityDark font-medium">{gift.category}</span>
                  <h3 className="font-serif text-2xl text-fineBlack">{gift.name}</h3>
                  <p className="font-sans text-xs text-fineBlack/50 leading-relaxed min-h-[2rem]">{gift.description}</p>
                  
                  {isClaimedByMe ? (
                    <button onClick={() => onUnclaim(gift.id)} className="text-red-400 text-[10px] tracking-widest uppercase hover:underline mt-4">Desmarcar Presente</button>
                  ) : !isFullyClaimed && (
                    <button 
                      onClick={() => currentUser ? setSelectedGiftId(gift.id) : onLogin()} 
                      className="mt-4 w-full py-3 bg-serenity text-white text-xs tracking-widest hover:bg-serenityDark transition-all uppercase rounded-sm"
                    >
                      Presentear
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Add Gift */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-serenityDark/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl relative animate-slide-up border border-white/50">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-fineBlack/40 hover:text-fineBlack"><X size={24} /></button>
            <h3 className="font-serif text-3xl text-fineBlack mb-6">Novo Presente</h3>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-fineBlack/40 mb-1 block">Nome do Item</label>
                <input type="text" required value={newGift.name} onChange={e => setNewGift({...newGift, name: e.target.value})} className="w-full border-b py-2 outline-none focus:border-serenity transition-colors" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-fineBlack/40 mb-1 block">URL da Imagem</label>
                <input type="url" required value={newGift.image} onChange={e => setNewGift({...newGift, image: e.target.value})} className="w-full border-b py-2 outline-none focus:border-serenity transition-colors" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-fineBlack/40 mb-1 block">Categoria</label>
                <select value={newGift.category} onChange={e => setNewGift({...newGift, category: e.target.value})} className="w-full border-b py-2 outline-none focus:border-serenity transition-colors bg-transparent">
                  <option>Cozinha</option>
                  <option>Cama & Banho</option>
                  <option>Casa & Décor</option>
                  <option>Eletros</option>
                </select>
              </div>
              <button type="submit" className="w-full py-4 bg-serenity text-white text-xs tracking-widest hover:bg-serenityDark transition-all uppercase rounded-sm shadow-lg mt-4">Adicionar à Lista</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Claim Gift */}
      {selectedGiftId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-serenityDark/20 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md p-8 rounded-sm shadow-2xl relative animate-slide-up">
            <button onClick={() => setSelectedGiftId(null)} className="absolute top-4 right-4 text-fineBlack/40"><X size={24} /></button>
            <h3 className="font-serif text-3xl text-fineBlack mb-2">Confirmar Presente</h3>
            <p className="font-sans text-xs text-fineBlack/50 mb-6 uppercase tracking-widest">Muito obrigado pelo carinho!</p>
            <form onSubmit={(e) => { e.preventDefault(); onClaim(selectedGiftId, guestName || 'Convidado', isAnonymous); setSelectedGiftId(null); }} className="space-y-6">
              <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full border-b py-2 outline-none focus:border-serenity transition-colors" placeholder="Seu nome" required />
              <div className="flex items-center gap-2">
                <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} className="accent-serenity" />
                <label htmlFor="anon" className="text-xs font-sans text-fineBlack/60 cursor-pointer">Marcar como anônimo na lista pública</label>
              </div>
              <button type="submit" className="w-full py-4 bg-serenity text-white text-xs tracking-widest uppercase rounded-sm shadow-md">Confirmar</button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default GiftList;
