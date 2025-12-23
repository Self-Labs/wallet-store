import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Search, Cpu } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const api = axios.create({ baseURL: '/api' });

const Products = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  
  useEffect(() => {
    api.get('/produtos/')
      .then(res => { setProdutos(res.data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <h1 className="text-3xl font-tech text-white flex items-center gap-3">
            <span className="text-bs-jade">///</span> CATALOG
        </h1>

        <div className="relative w-full md:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
            <input 
                type="text" 
                placeholder="SEARCH COMPONENT..." 
                className="w-full md:w-64 bg-black border border-bs-border text-white pl-12 pr-4 py-2 focus:border-bs-jade outline-none font-mono text-sm placeholder-gray-700 transition-colors uppercase"
            />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 font-mono text-bs-jade animate-pulse uppercase tracking-widest">
            [ LOADING ASSETS... ]
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {produtos.map(produto => (
            <div key={produto.id} className="group bg-bs-card border border-bs-border p-4 hover:border-bs-jade/50 transition-all duration-300 flex flex-col relative">
                <div className="h-40 bg-black/50 flex items-center justify-center border border-bs-border mb-4 relative overflow-hidden">
                    {produto.imagem ? (
                         <img src={produto.imagem} alt={produto.nome} className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />
                    ) : (
                         <Cpu size={32} className="text-gray-700 group-hover:text-bs-jade transition-colors" />
                    )}
                    
                    {produto.estoque_atual <= 0 && (
                        <div className="absolute inset-0 bg-black/90 flex items-center justify-center font-tech text-red-600 text-xl tracking-widest border border-red-900/50 m-2">
                            OFFLINE
                        </div>
                    )}
                </div>
                
                <div className="flex flex-col flex-grow">
                    <Link to={`/produto/${produto.id}`}>
                        <h3 className="text-white font-tech text-lg mb-1 group-hover:text-bs-jade truncate uppercase">
                            {produto.nome}
                        </h3>
                    </Link>
                    <p className="text-gray-500 text-xs font-mono mb-4 uppercase">
                        SKU: GEN-{produto.id.toString().padStart(3, '0')}
                    </p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-bs-border/50">
                        <span className="text-bs-jade font-mono text-lg">
                            R$ {parseFloat(produto.preco_venda).toFixed(2)}
                        </span>
                        <button 
                            onClick={() => addToCart(produto)}
                            disabled={produto.estoque_atual <= 0}
                            className="text-gray-400 hover:text-white hover:bg-white/5 p-2 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                        >
                            <ShoppingCart size={18} />
                        </button>
                    </div>
                </div>
            </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Products;