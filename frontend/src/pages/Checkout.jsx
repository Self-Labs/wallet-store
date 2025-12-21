import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Lock, Truck, CreditCard } from 'lucide-react';

const api = axios.create({ baseURL: '/api' });

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    cpf: '',
    address: ''
  });

  // Se não tiver itens, chuta de volta pra home
  if (cartItems.length === 0) {
    setTimeout(() => navigate('/'), 3000);
    return <div className="text-center py-20 text-bs-jade font-mono">CARRINHO VAZIO. REDIRECIONANDO...</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.preco_venda
      }))
    };

    try {
      const response = await api.post('/pedidos/', payload);
      // SUCESSO
      clearCart(); // Limpa o carrinho
      alert(`PEDIDO #${response.data.id} CONFIRMADO!\n\nGuarde este ID para rastreio.`);
      navigate('/'); // Futuramente mandaremos para uma página de sucesso
    } catch (error) {
      console.error(error);
      alert("ERRO AO PROCESSAR PEDIDO. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-tech text-white mb-8 flex items-center gap-3">
        <Lock className="text-bs-jade" /> CHECKOUT SEGURO
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* COLUNA 1: Formulário */}
        <div className="lg:col-span-2">
          <div className="bg-bs-card border border-bs-border p-8 mb-8">
            <div className="flex items-center gap-2 mb-6 text-red-500 bg-red-900/10 p-4 border border-red-900/30">
              <ShieldAlert size={20} />
              <p className="text-xs font-mono uppercase tracking-wider">
                AVISO: SEUS DADOS PESSOAIS SERÃO DESTRUÍDOS APÓS A ENTREGA.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-bs-jade text-xs font-bold mb-2 uppercase">Nome Completo</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full bg-black border border-bs-border text-white p-3 focus:border-bs-jade outline-none font-mono"
                    placeholder="Satoshi Nakamoto"
                    onChange={e => setFormData({...formData, full_name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-bs-jade text-xs font-bold mb-2 uppercase">CPF (Para Nota Fiscal)</label>
                  <input 
                    required 
                    type="text" 
                    className="w-full bg-black border border-bs-border text-white p-3 focus:border-bs-jade outline-none font-mono"
                    placeholder="000.000.000-00"
                    onChange={e => setFormData({...formData, cpf: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-bs-jade text-xs font-bold mb-2 uppercase">E-mail (Para Rastreio)</label>
                <input 
                  required 
                  type="email" 
                  className="w-full bg-black border border-bs-border text-white p-3 focus:border-bs-jade outline-none font-mono"
                  placeholder="email@seguro.com"
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-bs-jade text-xs font-bold mb-2 uppercase">Endereço de Entrega</label>
                <textarea 
                  required 
                  rows="3"
                  className="w-full bg-black border border-bs-border text-white p-3 focus:border-bs-jade outline-none font-mono"
                  placeholder="Rua, Número, Bairro, Cidade, CEP..."
                  onChange={e => setFormData({...formData, address: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-6 border-t border-bs-border">
                <h3 className="text-white font-tech text-lg mb-4 flex items-center gap-2">
                  <CreditCard size={20} /> PAGAMENTO
                </h3>
                <div className="bg-black p-4 border border-bs-border text-gray-500 text-sm font-mono text-center">
                  INTEGRAÇÃO PIX / BITCOIN EM BREVE.
                  <br/>
                  <span className="text-bs-jade">Por enquanto, o pedido será criado como PENDENTE.</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-bs-jade hover:bg-[#00ffa3]/90 text-black font-bold py-4 uppercase tracking-[0.2em] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'CRIPTOGRAFANDO...' : 'CONFIRMAR PEDIDO'}
              </button>
            </form>
          </div>
        </div>

        {/* COLUNA 2: Resumo */}
        <div className="h-fit sticky top-24">
          <div className="bg-bs-card border border-bs-border p-6">
            <h3 className="text-white font-tech text-xl mb-6">RESUMO</h3>
            <div className="space-y-4 mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm font-mono text-gray-400">
                  <span>{item.quantity}x {item.nome}</span>
                  <span className="text-white">R$ {(item.preco_venda * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-bs-border pt-4 flex justify-between items-center">
              <span className="text-white font-bold">TOTAL</span>
              <span className="text-bs-jade text-xl font-mono">R$ {cartTotal.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-600 text-xs font-mono">
            <Truck size={14} /> Envios via Melhor Envio
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;