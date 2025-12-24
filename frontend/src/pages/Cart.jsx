import React from 'react';
import { useCart } from '../contexts/CartContext';
import { Trash2, Plus, Minus, ArrowRight, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Package size={64} className="text-gray-700 mb-4" />
        <h2 className="text-2xl font-tech text-white mb-2">CARRINHO VAZIO</h2>
        <p className="text-gray-500 font-tech mb-8">Seu kit de soberania ainda não foi montado.</p>
        <Link to="/" className="bg-bs-jade text-black font-bold px-8 py-3 uppercase tracking-widest hover:bg-[#00ffa3]/90 transition-colors">
          Explorar Hardware
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-tech text-white mb-8 flex items-center gap-3">
        <span className="text-bs-jade">///</span> ORDER MANIFEST
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Lista de Itens */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map(item => (
            <div key={item.id} className="bg-bs-card border border-bs-border p-4 flex gap-4 items-center group hover:border-bs-jade/50 transition-colors">
              <div className="w-20 h-20 bg-black border border-bs-border flex items-center justify-center text-gray-600">
                <Package size={24} />
              </div>
              <div className="flex-grow">
                <h3 className="text-white font-tech text-lg">{item.nome}</h3>
                <p className="text-gray-500 text-xs font-tech">SKU: DIY-{item.id}</p>
                <div className="text-bs-jade font-tech mt-1">R$ {item.preco_venda}</div>
              </div>
              {/* Controles de Quantidade */}
              <div className="flex items-center gap-3 bg-black border border-bs-border px-2 py-1">
                <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-white p-1">
                  <Minus size={14} />
                </button>
                <span className="text-white font-tech w-4 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-white p-1">
                  <Plus size={14} />
                </button>
              </div>
              <button 
                onClick={() => removeFromCart(item.id)}
                className="text-red-900 hover:text-red-500 p-2 transition-colors"
                title="Remover Item"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
        {/* Resumo do Pedido */}
        <div className="bg-bs-card border border-bs-border p-6 h-fit sticky top-24">
          <h3 className="text-white font-tech text-xl mb-6 border-b border-bs-border pb-4">RESUMO</h3>
          <div className="flex justify-between text-gray-400 font-tech mb-2">
            <span>Subtotal</span>
            <span>R$ {cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-400 font-tech mb-6">
            <span>Frete</span>
            <span className="text-xs self-center">CALCULADO NO CHECKOUT</span>
          </div>
          <div className="flex justify-between text-white font-bold font-tech text-xl mb-8 pt-4 border-t border-bs-border">
            <span>TOTAL</span>
            <span className="text-bs-jade">R$ {cartTotal.toFixed(2)}</span>
          </div>
          {/* Link para Checkout */}
          <Link 
            to="/checkout" 
            className="w-full bg-bs-jade hover:bg-[#00ffa3]/90 text-black font-bold py-4 uppercase tracking-[0.2em] text-sm transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Checkout Seguro <ArrowRight size={16} />
          </Link>
          <p className="text-xs text-gray-600 text-center mt-4 font-tech">
            Dados criptografados e destruídos após o envio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cart;