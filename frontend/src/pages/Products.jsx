import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Package, Search } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-bs-border pb-6">
        <h1 className="text-3xl font-tech text-white">CATÁLOGO COMPLETO</h1>
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
            <input 
                type="text" 
                placeholder="Buscar componente..." 
                className="bg-black border border-bs-border text-white pl-10 pr-4 py-2 focus:border-bs-jade outline-none font-mono w-64"
            />
        </div>
      </div>

      {loading ? (
        <div className="text-bs-jade text-center font-mono">LOADING PRODUCTS...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {produtos.map(produto => (
            <div key={produto.id} className="group bg-bs-card border border-bs-border hover:border-bs-jade transition-all flex flex-col">
                <div className="h-40 bg-bs-dark/50 flex items-center justify-center border-b border-bs-border/30 relative overflow-hidden">
                    {produto.imagem ? (
                         <img src={produto.imagem} alt={produto.nome} className="h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                         <Package size={40} className="text-gray-700 group-hover:text-bs-jade transition-colors" />
                    )}
                    {produto.estoque_atual <= 0 && (
                        <div className="absolute inset-0 bg-black/80 flex items-center justify-center font-tech text-red-500 tracking-widest">ESGOTADO</div>
                    )}
                </div>
                
                <div className="p-4 flex flex-col flex-grow">
                    <Link to={`/produto/${produto.id}`}>
                        <h3 className="text-lg font-bold text-white mb-2 font-mono group-hover:text-bs-jade truncate">{produto.nome}</h3>
                    </Link>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-bs-border/30">
                        <span className="text-bs-jade font-bold font-mono">
                            R$ {parseFloat(produto.preco_venda).toFixed(2)}
                        </span>
                        <button 
                            onClick={() => addToCart(produto)}
                            disabled={produto.estoque_atual <= 0}
                            className="text-white hover:text-bs-jade transition-colors disabled:opacity-50"
                        >
                            <ShoppingCart size={20} />
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