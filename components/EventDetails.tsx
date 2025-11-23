import React from 'react';
import { MapPin, Church } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

const EventDetails: React.FC = () => {
  return (
    <section className="py-24 px-4 md:px-8 bg-pureWhite relative overflow-hidden">
      
      <div className="max-w-3xl mx-auto relative z-10">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-4">
            <h2 className="font-serif text-4xl md:text-5xl text-fineBlack">O Grande Encontro</h2>
            <p className="font-sans text-fineBlack/60 tracking-widest uppercase text-xs">
              Detalhes da Cerimônia
            </p>
          </div>
        </ScrollReveal>

        {/* Ceremony - Centered */}
        <ScrollReveal delay={100}>
          <div className="flex flex-col items-center text-center space-y-8 group">
            
            {/* Icon with decorative ring */}
            <div className="relative">
              <div className="absolute inset-0 bg-serenity/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="relative p-6 bg-serenityLight rounded-full text-serenityDark mb-2 group-hover:bg-serenity group-hover:text-white transition-colors duration-500 shadow-sm">
                <Church size={40} strokeWidth={1.2} />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-serif text-4xl text-fineBlack">A Bênção</h3>
              <p className="font-sans text-md font-medium text-serenityDark tracking-wider uppercase">
                17:00 Horas
              </p>
            </div>

            <div className="w-24 h-px bg-gradient-to-r from-transparent via-serenity/40 to-transparent" />

            <p className="font-sans text-fineBlack/70 leading-relaxed max-w-lg text-lg font-light">
              Nossa união será abençoada na histórica Igreja Bom Jesus. 
              <br />
              Um momento íntimo de fé, emoção e gratidão.
            </p>

            <div className="pt-6">
              <a href="https://maps.app.goo.gl/7wRmoRdjNPS5XCM3A" className="group/btn inline-flex flex-col items-center gap-2">
                <span className="inline-flex items-center gap-2 px-8 py-3 border border-fineBlack/10 rounded-sm hover:border-serenity hover:bg-serenity hover:text-white transition-all duration-300 font-sans text-xs uppercase tracking-widest shadow-sm">
                  <MapPin size={14} />
                  Ver Localização no Mapa
                </span>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default EventDetails;