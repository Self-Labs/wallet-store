import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const api = axios.create({ baseURL: '/api' });

const Home = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    api.get('/produtos/')
      .then(res => { setProdutos(res.data); setLoading(false); })
      .catch(err => { setError("Sistema indisponível."); setLoading(false); });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Banner Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl md:text-7xl font-tech text-white mb-4 tracking-tighter">
          SECURE YOUR <span className="text-bs-jade">ASSETS</span>
        </h1>
        <p className="text-gray-400 font-mono max-w-2xl mx-auto">
          Hardware Wallets Open-Source (DIY). <br />
          Montagem especializada, firmware auditável e privacidade absoluta.
        </p>
      </div>
      
      {loading && <div className="text-bs-jade text-center animate-pulse font-mono">INITIALIZING UPLINK...</div>}
      
      {error && (
        <div className="text-red-500 text-center border border-red-900 p-4 font-mono flex items-center justify-center gap-2">
          <AlertCircle size={20} /> {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {produtos.map(produto => (
          <div key={produto.id} className="group bg-bs-card border border-bs-border hover:border-bs-jade transition-all p-6 flex flex-col">
            <div className="h-48 bg-bs-dark/50 mb-6 flex items-center justify-center border border-bs-border/30">
              <Package size={48} className="text-gray-700 group-hover:text-bs-jade transition-colors" />
            </div>
            
            <h3 className="text-2xl font-tech text-white mb-2">{produto.nome}</h3>
            <p className="text-gray-500 text-sm mb-6 flex-grow font-mono line-clamp-2">
              {produto.descricao || "Dispositivo DIY de alta performance."}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-6 border-t border-bs-border">
              <span className="text-bs-jade font-bold text-xl font-mono">
                R$ {produto.preco_venda}
              </span>
              <Link to={`/produto/${produto.id}`} className="bg-white hover:bg-bs-jade text-black font-bold px-6 py-2 uppercase text-sm tracking-wider transition-colors">
                Detalhes
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;