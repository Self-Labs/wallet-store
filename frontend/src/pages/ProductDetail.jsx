import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, Cpu, ArrowLeft, ShoppingCart, PenTool } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

const api = axios.create({ baseURL: '/api' });

const ProductDetail = () => {
  const { id } = useParams();
  const [produto, setProduto] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/produtos/${id}/`)
      .then(res => { setProduto(res.data); setLoading(false); })
      .catch(err => setLoading(false));
  }, [id]);

  if (loading) return <div className="text-center py-20 text-bs-jade font-mono animate-pulse">LOADING SECURE DATA...</div>;
  if (!produto) return <div className="text-center py-20 text-red-500 font-mono">PRODUCT NOT FOUND OR REMOVED.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Link to="/" className="inline-flex items-center text-gray-500 hover:text-white mb-8 transition-colors font-mono text-sm">
        <ArrowLeft size={16} className="mr-2" /> VOLTAR AO CATALOGO
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-bs-card border border-bs-border p-8 flex items-center justify-center min-h-[400px] relative overflow-hidden group">
          <div className="absolute inset-0 bg-bs-jade/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Cpu size={120} className="text-bs-jade opacity-80" />
          <div className="absolute bottom-4 left-4 text-xs font-mono text-gray-600">
            SECURE HARDWARE ELEMENT // ID: {produto.id.toString().padStart(4, '0')}
          </div>
        </div>

        <div>
          <h1 className="text-4xl md:text-5xl font-tech text-white mb-4">{produto.nome}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <span className="bg-bs-jade/10 text-bs-jade border border-bs-jade/20 px-3 py-1 text-xs font-bold tracking-widest uppercase">
              Em Estoque
            </span>
            <span className="text-gray-500 text-xs font-mono">
              SKU: DIY-{produto.id}
            </span>
          </div>

          <div className="text-3xl font-mono text-white mb-8 border-b border-bs-border pb-8">
            R$ {produto.preco_venda}
          </div>

          <p className="text-gray-400 font-mono leading-relaxed mb-8">
            {produto.descricao || "Este é um dispositivo montado artesanalmente utilizando componentes de alta qualidade, compatível com firmwares open-source (Jade/Krux). Ideal para quem busca soberania sem depender de hardware proprietário fechado."}
          </p>

          <button 
            className="w-full bg-bs-jade hover:bg-[#00ffa3]/90 text-black font-bold py-4 uppercase tracking-[0.2em] text-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-3 mb-8"
            onClick={() => {
              addToCart(produto);
              navigate('/carrinho');
            }}
          >
            <ShoppingCart size={20} />
            Adicionar ao Carrinho
          </button>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-bs-border p-4 flex items-center gap-3 bg-bs-card/50">
              <PenTool className="text-bs-jade" />
              <div className="text-xs">
                <strong className="block text-white uppercase">Montagem Artesanal</strong>
                <span className="text-gray-500">Componentes Selecionados</span>
              </div>
            </div>
            <div className="border border-bs-border p-4 flex items-center gap-3 bg-bs-card/50">
              <ShieldCheck className="text-bs-jade" />
              <div className="text-xs">
                <strong className="block text-white uppercase">Open Hardware</strong>
                <span className="text-gray-500">Totalmente Auditável</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;