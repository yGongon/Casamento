
import React, { useState, useMemo } from 'react';
import { Gift } from '../types';
import { Check, X, Settings, Plus, Trash2, UserPlus, History } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { User } from 'firebase/auth';
import { ADMIN_EMAILS } from '../constants';

interface GiftListProps {
  gifts: Gift[];
  currentUser: User | null;
  onClaim: (giftId: string, name: string, isAnonymous: boolean, manualByAdmin?: boolean) => void;
  onUnclaim: (giftId: string, claimIndex?: number) => void;
  onDelete: (giftId: string) => void;
  onAdd: (gift: Omit<Gift, 'id' | 'claims'>) => void;
  onLogin: () => void;
}

const GiftList: React.FC<GiftListProps> = ({ gifts, currentUser, onClaim, onUnclaim, onDelete, onAdd, onLogin }) => {
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [manualClaimGiftId, setManualClaimGiftId] = useState<string | null>(null);
  const [guestName, setGuestName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGift, setNewGift] = useState({ name: '', description: '', image: '', category: 'Cozinha', maxQuantity: 1 });

  const isAdmin = currentUser && currentUser.email && ADMIN_EMAILS.includes(currentUser.email);

  const categories = useMemo(() => ['Todos', ...Array.from(new Set(gifts.map(g => g.category))).sort()], [gifts]);
  const filteredGifts = useMemo(() => selectedCategory === 'Todos' ? gifts : gifts.filter(g => g.category === selectedCategory), [gifts, selectedCategory]);

  return (
    <section className="py-20 px-4 bg-pureWhite" id="lista-de-presentes">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="font-serif text-4xl text-fineBlack mb-4">Lista de Presentes</h2>
            {isAdmin && (
              <div className="flex justify-center gap-4 mt-4">
                <button onClick={() => setIsAdminMode(!isAdminMode)} className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] tracking-widest uppercase transition-all ${isAdminMode ? 'bg-serenityDark text-white' : 'bg-white'}`}>
                  <Settings size={14} /> {isAdminMode ? 'Modo Admin: Ativo' : 'Ativar Modo Admin'}
                </button>
                {isAdminMode && (
                  <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full text-[10px] tracking-widest uppercase"><Plus size={14} /> Novo Item</button>
                )}
              </div>
            )}
          </div>
        </ScrollReveal>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 text-[10px] tracking-widest rounded-full border uppercase transition-all ${selectedCategory === cat ? 'bg-serenity text-white border-serenity' : 'bg-white text-gray-400'}`}>{cat}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredGifts.map(gift => {
            const claims = gift.claims || [];
            const isFull = claims.length >= (gift.maxQuantity || 1);
            const myClaim = currentUser ? claims.find(c => c.userId === currentUser.uid) : null;

            return (
              <div key={gift.id} className="bg-white border border-gray-100 rounded-sm overflow-hidden group hover:shadow-xl transition-all relative">
                {isAdminMode && (
                  <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
                    <button onClick={() => onDelete(gift.id)} className="p-2 bg-red-500 text-white rounded-full shadow-lg"><Trash2 size={14} /></button>
                    <button onClick={() => setManualClaimGiftId(gift.id)} className="p-2 bg-blue-500 text-white rounded-full shadow-lg" title="Restaurar marcação manual"><UserPlus size={14} /></button>
                  </div>
                )}
                
                <div className="aspect-square overflow-hidden bg-gray-50">
                  <img src={gift.image} alt={gift.name} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isFull && !myClaim ? 'grayscale opacity-50' : ''}`} />
                </div>

                <div className="p-6 text-center">
                  <span className="text-[9px] uppercase tracking-widest text-serenityDark font-bold">{gift.category}</span>
                  <h3 className="font-serif text-xl my-2">{gift.name}</h3>
                  
                  {claims.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[9px] text-gray-400 uppercase tracking-tighter mb-1">Presenteado por:</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {claims.map((c, idx) => (
                          <span key={idx} className="bg-serenityLight text-serenityDark text-[10px] px-2 py-1 rounded-sm flex items-center gap-1">
                            {c.isAnonymous ? 'Anônimo' : c.name}
                            {isAdminMode && <X size={10} className="cursor-pointer hover:text-red-500" onClick={() => onUnclaim(gift.id, idx)} />}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {myClaim ? (
                    <button onClick={() => onUnclaim(gift.id)} className="text-red-400 text-[10px] uppercase tracking-widest border-b border-red-200">Cancelar meu presente</button>
                  ) : !isFull && (
                    <button onClick={() => currentUser ? setSelectedGiftId(gift.id) : onLogin()} className="w-full py-3 bg-serenity text-white text-[10px] tracking-widest uppercase hover:bg-serenityDark">Escolher Presente</button>
                  )}
                  {isFull && !myClaim && <span className="text-[10px] font-serif italic text-gray-400">Este item já foi presenteado</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Manual Claim (RECUPERAÇÃO) */}
      {manualClaimGiftId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm p-8 rounded-sm shadow-2xl relative">
            <button onClick={() => setManualClaimGiftId(null)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
            <h3 className="font-serif text-2xl mb-4">Restaurar Marcação</h3>
            <p className="text-[10px] text-gray-400 uppercase mb-4">Use os dados do e-mail para preencher aqui.</p>
            <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full border-b py-2 mb-4 outline-none" placeholder="Nome do Convidado" />
            <button onClick={() => { onClaim(manualClaimGiftId, guestName, false, true); setManualClaimGiftId(null); setGuestName(''); }} className="w-full py-3 bg-blue-600 text-white text-[10px] uppercase tracking-widest">Salvar Manualmente</button>
          </div>
        </div>
      )}

      {/* Modal Public Claim */}
      {selectedGiftId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm p-8 rounded-sm shadow-2xl relative">
            <button onClick={() => setSelectedGiftId(null)} className="absolute top-4 right-4 text-gray-400"><X size={20} /></button>
            <h3 className="font-serif text-2xl mb-4">Presentear</h3>
            <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} className="w-full border-b py-2 mb-4 outline-none" placeholder="Seu Nome" />
            <div className="flex items-center gap-2 mb-6">
              <input type="checkbox" id="anon" checked={isAnonymous} onChange={e => setIsAnonymous(e.target.checked)} />
              <label htmlFor="anon" className="text-xs text-gray-500">Ocultar meu nome na lista pública</label>
            </div>
            <button onClick={() => { onClaim(selectedGiftId, guestName, isAnonymous); setSelectedGiftId(null); setGuestName(''); }} className="w-full py-3 bg-serenity text-white text-[10px] uppercase tracking-widest">Confirmar</button>
          </div>
        </div>
      )}

      {/* Modal Add Gift */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white w-full max-w-md p-8 rounded-sm relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4"><X size={20} /></button>
            <h3 className="font-serif text-2xl mb-6">Novo Item</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Nome" className="w-full border-b py-2" onChange={e => setNewGift({...newGift, name: e.target.value})} />
              <input type="text" placeholder="URL Imagem" className="w-full border-b py-2" onChange={e => setNewGift({...newGift, image: e.target.value})} />
              <select className="w-full border-b py-2" onChange={e => setNewGift({...newGift, category: e.target.value})}>
                <option>Cozinha</option><option>Cama & Banho</option><option>Casa & Décor</option>
              </select>
              <button onClick={() => { onAdd(newGift); setIsAddModalOpen(false); }} className="w-full py-3 bg-serenity text-white uppercase text-[10px] tracking-widest mt-4">Adicionar</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GiftList;
