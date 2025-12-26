import React from 'react';
import { ShieldAlert, Github } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-bs-border bg-bs-black mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">

        {/* Aviso de Privacidade */}
        <div className="border border-red-900/30 bg-red-900/5 p-6 mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-red-500 font-tech mb-2">
            <ShieldAlert size={20} />
            <span className="uppercase tracking-widest">Protocolo de Privacidade</span>
          </div>
          <p className="text-gray-500 text-sm font-tech">
            Nós levamos sua segurança a sério. Todos os dados pessoais de entrega são 
            <span className="text-white font-bold"> automaticamente destruídos </span> 
            do nosso banco de dados após a confirmação da entrega.
          </p>
        </div>

        <p className="text-white font-tech text-sm tracking-widest">
          WALLET 
          <span className="text-bs-jade">STORE</span> | <span className="text-bs-jade">DIY</span> 
          EDITION
        </p>
        <p className="text-gray-600 font-tech text-xs mt-2">
          Cypherpunk Philosophy. Verify, Don't Trust.
        </p>
      </div>
    </footer>
  );
};

export default Footer;