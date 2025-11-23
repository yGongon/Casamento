import React, { useState } from 'react';
import { Plane, Heart, Copy, Check, X } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { PIX_KEY, PIX_HOLDER_NAME, PIX_QR_CODE_URL } from '../constants';

const CashGift: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-20 px-4 bg-serenityLight/30 border-t border-white">
      <div className="max-w-4xl mx-auto">
        <ScrollReveal>
          <div className="bg-white rounded-sm shadow-lg overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Side - Image/Visual */}
            <div className="md:w-2/5 bg-serenity relative h-64 md:h-auto overflow-hidden group">
              <img 
                src="https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0f/34/dc/b8/photo0jpg.jpg?w=1000" 
                alt="Viagem Lua de Mel" 
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-serenityDark/60 to-transparent flex flex-col justify-end p-8 text-white">
                <Plane className="w-8 h-8 mb-4 animate-float" />
                <h3 className="font-serif text-3xl italic">Nossos Sonhos</h3>
              </div>
            </div>

            {/* Right Side - Content */}
            <div className="md:w-3/5 p-8 md:p-12 flex flex-col justify-center items-start space-y-6">
              <div>
                <h3 className="font-serif text-3xl text-fineBlack mb-2">Operação Lua de Mel</h3>
                <div className="w-12 h-px bg-serenity mb-4" />
                <p className="font-sans text-fineBlack/70 leading-relaxed">
                  Se preferir não escolher um presente físico, 
                  ficaríamos imensamente felizes com sua contribuição para realizarmos a viagem dos nossos sonhos.
                </p>
              </div>

              <button 
                onClick={() => setIsModalOpen(true)}
                className="group relative px-8 py-3 bg-fineBlack text-white font-sans text-sm tracking-widest overflow-hidden rounded-sm hover:shadow-lg transition-all duration-300"
              >
                <span className="relative z-10 flex items-center gap-2 group-hover:gap-4 transition-all">
                  CONTRIBUIR VIA PIX <Heart size={14} className="text-serenity fill-serenity" />
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
                Sinta-se livre para contribuir com o valor que seu coração desejar. O valor cai direto em nossa conta, sem taxas.
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

              <p className="text-xs text-fineBlack/40 font-sans italic pt-2">
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CashGift;