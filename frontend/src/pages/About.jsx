import React from 'react';
import { Shield, EyeOff, Wrench } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      {/* Banner Hero */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-tech text-white mb-6">
          VERIFY. <span className="text-bs-jade">DON'T TRUST.</span>
        </h1>
        <p className="text-gray-400 font-tech">
          Democratizando a segurança digital através de hardware acessível e transparente.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Card 1: DIY */}
        <div className="bg-bs-card border border-bs-border p-6 text-center">
          <Wrench className="w-12 h-12 text-bs-jade mx-auto mb-4" />
          <h3 className="text-white font-tech text-xl mb-2">Cultura DIY</h3>
          <p className="text-gray-500 text-sm">
            Apoiamos projetos como Blockstream Jade e Krux. Montamos o hardware para que você foque na segurança.
          </p>
        </div>
        
        {/* Card 2: Privacidade */}
        <div className="bg-bs-card border border-bs-border p-6 text-center">
          <EyeOff className="w-12 h-12 text-bs-jade mx-auto mb-4" />
          <h3 className="text-white font-tech text-xl mb-2">Zero Logs</h3>
          <p className="text-gray-500 text-sm">
            Privacidade radical. Seus dados de entrega são deletados automaticamente após o recebimento.
          </p>
        </div>

        {/* Card 3: Open Source */}
        <div className="bg-bs-card border border-bs-border p-6 text-center">
          <Shield className="w-12 h-12 text-bs-jade mx-auto mb-4" />
          <h3 className="text-white font-tech text-xl mb-2">100% Auditável</h3>
          <p className="text-gray-500 text-sm">
            Sem caixas pretas. Hardware de mercado (ESP32/K210) rodando firmware oficial auditável.
          </p>
        </div>
      </div>

      <div className="border-l-4 border-bs-jade pl-6 py-2 bg-bs-card/30">
        <p className="text-gray-300 font-tech italic">
          "Acreditamos que a segurança não deve ser um privilégio caro. Ao utilizar hardware acessível e software aberto, entregamos a mesma segurança dos grandes players, por uma fração do preço."
        </p>
      </div>
    </div>
  );
};

export default About;