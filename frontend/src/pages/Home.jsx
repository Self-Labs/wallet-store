import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Package, AlertCircle, ShoppingCart, Cpu, ShieldCheck, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const api = axios.create({ baseURL: '/api' });

const Home = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  
  useEffect(() => {
    api.get('/produtos/')
      .then(res => { setProdutos(res.data); setLoading(false); })
      .catch(err => { setError("Sistema indisponível."); setLoading(false); });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">

      {/* HERO SECTION */}
      <div className="text-center mb-20 relative">
        {/* Efeito de fundo sutil para dar profundidade sem atrapalhar a leitura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-bs-jade/5 rounded-full blur-3xl -z-10"></div>
        <h1 className="text-4xl md:text-6xl font-tech text-white mb-6">
          SECURE YOUR <span className="text-bs-jade">ASSETS</span>
        </h1>
        <p className="text-gray-400 font-tech">
          Hardware Wallets Open-Source (DIY). <br />
          Firmware auditável e privacidade absoluta.
        </p>
        <div className="mt-8 flex justify-center gap-4">
            <Link to="/produtos" className="bg-bs-jade hover:bg-[#00ffa3]/90 text-black font-bold font-tech py-3 px-8 uppercase tracking-widest transition-transform active:scale-95 flex items-center gap-2">
                VER PRODUTOS <ArrowRight size={20} />
            </Link>
        </div>
      </div>
      {loading && <div className="text-bs-jade text-center animate-pulse font-tech">INITIALIZING UPLINK...</div>}
      {error && (
        <div className="text-red-500 text-center bg-red-900/10 p-4 font-tech flex items-center justify-center gap-2 border border-red-500/30">
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* DESTAQUES */}
      {!loading && !error && (
        <>
            <div className="flex items-center justify-between mb-8 border-b border-bs-border pb-4">
                <h2 className="text-2xl font-tech text-white flex items-center gap-2">
                    <ShieldCheck className="text-bs-jade"/> DESTAQUES
                </h2>
                <Link to="/produtos" className="text-bs-jade hover:underline font-tech text-sm">Ver todos &rarr;</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {produtos.slice(0, 3).map(produto => (
                <div key={produto.id} className="group bg-bs-card border border-bs-border hover:border-bs-jade transition-all duration-300 flex flex-col h-full relative">

                    {/* ÁREA DE CLIQUE (Vai para Detalhes) */}
                    <Link to={`/produto/${produto.id}`} className="flex-grow flex flex-col">
                        <div className="h-48 bg-bs-dark/50 flex items-center justify-center border-b border-bs-border/30 relative overflow-hidden">
                            {produto.imagem ? (
                                <img src={produto.imagem} alt={produto.nome} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            ) : (
                                <Package size={48} className="text-gray-700 group-hover:text-bs-jade transition-colors" />
                            )}
                            {produto.estoque_atual <= 0 && (
                                <div className="absolute inset-0 bg-black/80 flex items-center justify-center font-tech text-red-500 text-xl tracking-widest">ESGOTADO</div>
                            )}
                        </div>
                        <div className="p-6 pb-2">
                            <h3 className="text-xl font-bold text-white mb-2 font-tech uppercase tracking-wide group-hover:text-bs-jade transition-colors">{produto.nome}</h3>
                            <p className="text-gray-500 text-sm mb-4 font-tech line-clamp-2">
                                {produto.descricao || "Dispositivo DIY de alta performance."}
                            </p>
                        </div>
                    </Link>

                    {/* ÁREA DE AÇÃO (Carrinho) */}
                    <div className="px-6 pb-6 mt-auto">
                        <div className="flex items-center justify-between pt-4 border-t border-bs-border/30">
                            <span className="text-bs-jade font-bold text-xl font-tech">
                                R$ {parseFloat(produto.preco_venda).toFixed(2)}
                            </span>
                            <button 
                                onClick={() => addToCart(produto)}
                                disabled={produto.estoque_atual <= 0}
                                className="text-gray-400 hover:text-bs-jade hover:bg-white/5 p-2 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                                <ShoppingCart size={20} />
                            </button>
                        </div>
                    </div>
                </div>
                ))}
            </div>
        </>
      )}
    </div>
  );
};

export default Home;