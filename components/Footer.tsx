import React from 'react';
import ScrollReveal from './ScrollReveal';

const Footer: React.FC = () => {
  return (
    <footer className="bg-serenityLight text-fineBlack py-12 px-4 text-center overflow-hidden border-t border-serenity/20">
      <ScrollReveal>
        <div className="max-w-4xl mx-auto space-y-4">
          <h3 className="font-serif text-3xl md:text-4xl text-serenityDark">Wevelley & Gabriella</h3>
          <div className="w-8 h-px bg-serenity mx-auto" />
          <p className="font-sans font-light text-sm tracking-wide opacity-80">
            14 de Fevereiro de 2026
          </p>
          <p className="font-sans font-light text-xs tracking-wide opacity-60 pt-4">
            Feito com amor, cuidado e essência.
          </p>
        </div>
      </ScrollReveal>
    </footer>
  );
};

export default Footer;