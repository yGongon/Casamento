import React, { useState, useEffect } from 'react';
import { TimeLeft } from '../types';
import { WEDDING_DATE, COUPLE_PHOTO } from '../constants';
import { Heart, LogIn, LogOut, User as UserIcon, Share2, X, MessageCircle, Facebook, Twitter, Copy, Check } from 'lucide-react';
import ScrollReveal from './ScrollReveal';
import { User } from 'firebase/auth';

interface HeroProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

const Hero: React.FC<HeroProps> = ({ user, onLogin, onLogout }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = +WEDDING_DATE - +new Date();
      
      let newTimeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        newTimeLeft = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      setTimeLeft(newTimeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDate = WEDDING_DATE.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'twitter' | 'copy') => {
    const url = window.location.href;
    const text = "Gabriella & Wevelley - Venha celebrar nosso amor conosco!";
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        setTimeout(() => setLinkCopied(false), 2000);
        break;
    }
  };

  return (
    <header className="relative w-full min-h-screen flex flex-col items-center justify-center bg-serenityLight overflow-hidden px-4 py-12">
      
      {/* Auth & Actions Bar */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-end items-center gap-3 z-50">
        
        {/* Share Button with Custom Tooltip */}
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="group relative flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white text-serenityDark hover:text-serenityDark/80 text-xs font-sans font-medium tracking-wider uppercase rounded-full transition-all duration-300"
        >
          <Share2 size={14} />
          <span className="hidden sm:inline">Compartilhar</span>
          
          {/* Tooltip Element */}
          <span className="absolute top-full right-0 mt-3 w-max px-3 py-2 bg-serenityDark text-white text-[10px] font-sans tracking-wide rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 shadow-xl transform translate-y-[-5px] group-hover:translate-y-0 z-50 pointer-events-none">
            Compartilhar este momento especial
            <span className="absolute -top-1 right-4 w-2 h-2 bg-serenityDark transform rotate-45"></span>
          </span>
        </button>

        {/* Divider */}
        <div className="h-4 w-px bg-fineBlack/10"></div>

        {user ? (
          <div className="flex items-center gap-4">
             <div className="hidden md:flex items-center gap-2 text-serenityDark font-sans text-sm">
                <UserIcon size={14} />
                <span>Olá, {user.displayName?.split(' ')[0]}</span>
             </div>
             <button 
               onClick={onLogout}
               className="flex items-center gap-2 px-4 py-2 bg-white/50 hover:bg-white text-fineBlack/60 text-xs font-sans tracking-wider uppercase rounded-full transition-all"
             >
               <LogOut size={14} /> <span className="hidden sm:inline">Sair</span>
             </button>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-serenity hover:text-white text-serenityDark text-xs font-sans font-medium tracking-wider uppercase rounded-full shadow-sm transition-all"
          >
            <LogIn size={14} /> Login
          </button>
        )}
      </div>

      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-serenity/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

      <div className="z-10 text-center max-w-4xl mx-auto space-y-8">
        
        <ScrollReveal>
          <div className="flex justify-center mb-6">
             <Heart className="text-serenity w-8 h-8 opacity-80 animate-pulse-slow" strokeWidth={1} />
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-fineBlack leading-tight">
            Wevelley <span className="text-serenity italic">&</span> Gabriella
          </h1>

          <div className="w-24 h-px bg-serenity/30 mx-auto my-6" />

          <p className="font-sans text-lg tracking-widest uppercase text-fineBlack/60">
            {formattedDate}
          </p>
        </ScrollReveal>

        {/* Couple Photo Section */}
        <ScrollReveal delay={200}>
          <div className="relative mx-auto mt-10 mb-10 w-64 h-80 md:w-80 md:h-96 lg:w-96 lg:h-[28rem] transform rotate-2 hover:rotate-0 transition-transform duration-700 ease-in-out">
            <div className="absolute inset-0 border border-serenity/40 translate-x-4 translate-y-4 rounded-sm" />
            <div className="absolute inset-0 bg-white p-2 shadow-xl rounded-sm">
              <div className="w-full h-full overflow-hidden relative">
                <img 
                  src={COUPLE_PHOTO} 
                  alt="Gabriella & Wevelley" 
                  className="w-full h-full object-cover filter brightness-[1.02] contrast-[0.95]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-serenityDark/20 to-transparent opacity-40" />
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={400}>
          <div className="flex flex-wrap justify-center items-start gap-3 md:gap-6 mt-8 font-serif text-serenityDark">
            <TimeUnit value={timeLeft.days} label="Dias" />
            <div className="text-3xl md:text-4xl opacity-30 pt-1">:</div>
            <TimeUnit value={timeLeft.hours} label="Horas" />
            <div className="text-3xl md:text-4xl opacity-30 pt-1">:</div>
            <TimeUnit value={timeLeft.minutes} label="Min" />
            <div className="text-3xl md:text-4xl opacity-30 pt-1">:</div>
            <TimeUnit value={timeLeft.seconds} label="Seg" isLast />
          </div>
        </ScrollReveal>

        <ScrollReveal delay={600}>
          <div className="mt-12 max-w-2xl mx-auto bg-white/60 backdrop-blur-md p-8 rounded-sm shadow-sm border border-white">
            <p className="font-serif text-2xl text-fineBlack/70 italic leading-relaxed">
              "Receber vocês no nosso dia é o maior presente. Preparado com carinho, essência e leveza — do jeito que vivemos."
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-serenityDark/30 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm p-6 rounded-sm shadow-2xl relative animate-slide-up border border-white/50">
            <button 
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-fineBlack/40 hover:text-fineBlack transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="font-serif text-2xl text-fineBlack mb-2 text-center">Compartilhe o Amor</h3>
            <p className="font-sans text-xs text-fineBlack/60 mb-8 text-center uppercase tracking-wide">
              Convide amigos e família
            </p>

            <div className="space-y-3">
              <button 
                onClick={() => handleShare('whatsapp')}
                className="w-full flex items-center justify-center gap-3 py-3 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white rounded-sm transition-all duration-300 group"
              >
                <MessageCircle size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-sans text-sm font-medium">WhatsApp</span>
              </button>

              <button 
                onClick={() => handleShare('facebook')}
                className="w-full flex items-center justify-center gap-3 py-3 bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white rounded-sm transition-all duration-300 group"
              >
                <Facebook size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-sans text-sm font-medium">Facebook</span>
              </button>

              <button 
                onClick={() => handleShare('twitter')}
                className="w-full flex items-center justify-center gap-3 py-3 bg-black/5 text-black hover:bg-black hover:text-white rounded-sm transition-all duration-300 group"
              >
                <Twitter size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-sans text-sm font-medium">Twitter</span>
              </button>

              <div className="h-px bg-gray-100 my-2" />

              <button 
                onClick={() => handleShare('copy')}
                className="w-full flex items-center justify-center gap-3 py-3 bg-serenityLight text-serenityDark hover:bg-serenity hover:text-white rounded-sm transition-all duration-300 group"
              >
                {linkCopied ? <Check size={20} /> : <Copy size={20} />}
                <span className="font-sans text-sm font-medium">
                  {linkCopied ? 'Link Copiado!' : 'Copiar Link'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};

const TimeUnit: React.FC<{ value: number; label: string; isLast?: boolean }> = ({ value, label, isLast }) => {
  return (
    <div className="flex flex-col items-center min-w-[60px] md:min-w-[80px]">
      <div className="relative h-12 md:h-14 overflow-hidden">
        <span 
          key={value}
          className="block text-4xl md:text-5xl tabular-nums leading-none animate-fade-in"
        >
          {value.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="text-xs md:text-sm font-sans text-fineBlack/50 uppercase tracking-widest mt-2">
        {label}
      </span>
    </div>
  );
};

export default Hero;