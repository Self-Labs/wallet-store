import React from 'react';
import { Mail, Package, Send } from 'lucide-react';

const Contact = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">

       {/* HEADER PADRÃO */}
      <h1 className="text-3xl font-tech text-white mb-8 flex items-center gap-3">
            <span className="text-bs-jade">///</span> CONTACT
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Canais */}
        <div className="space-y-4">
            <div className="bg-bs-card border border-bs-border p-6 hover:border-bs-jade/30 transition-colors group cursor-default">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-black border border-bs-border text-bs-jade">
                        <Mail size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-tech text-lg uppercase">General</h3>
                        <p className="text-gray-500 font-tech text-sm">contato@jadewallet.com.br</p>
                    </div>
                </div>
            </div>
            <div className="bg-bs-card border border-bs-border p-6 hover:border-bs-jade/30 transition-colors group cursor-default">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-black border border-bs-border text-bs-blue">
                        <Package size={20} />
                    </div>
                    <div>
                        <h3 className="text-white font-tech text-lg uppercase">Logistics</h3>
                        <p className="text-gray-500 font-tech text-sm">rastreio@jadewallet.com.br</p>
                    </div>
                </div>
            </div>
            <div className="p-6 border border-dashed border-bs-border text-gray-600 font-tech text-xs uppercase leading-relaxed">
                Use PGP encryption if necessary. <br/>
                We respect your privacy and data sovereignty.
            </div>
        </div>

        {/* Formulário */}
        <div className="bg-bs-card border border-bs-border p-6">
            <form className="space-y-4">
                <div>
                    <label className="block text-xs font-tech text-gray-500 mb-2 uppercase tracking-widest">Identify (Email)</label>
                    <input type="email" className="w-full bg-black border border-bs-border text-white p-3 focus:border-bs-jade outline-none font-tech text-sm transition-colors" placeholder="secure@email.com" />
                </div>
                <div>
                    <label className="block text-xs font-tech text-gray-500 mb-2 uppercase tracking-widest">Payload (Message)</label>
                    <textarea rows="5" className="w-full bg-black border border-bs-border text-white p-3 focus:border-bs-jade outline-none font-tech text-sm transition-colors"></textarea>
                </div>
                <button type="button" className="w-full bg-bs-jade hover:bg-[#00ffa3]/90 text-black font-bold font-tech py-3 px-8 uppercase tracking-widest flex items-center justify-center gap-2 transition-transform active:scale-95">
                    TRANSMIT <Send size={16} />
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;