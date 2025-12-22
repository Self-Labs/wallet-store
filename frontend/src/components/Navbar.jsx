import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, X, ChevronRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const { totalItems } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="border-b border-bs-border bg-bs-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* 1. Logo */}
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setIsMenuOpen(false)}>
            <div className="w-2 h-8 bg-bs-jade group-hover:shadow-[0_0_10px_#00FFA3] transition-all"></div>
            <h1 className="text-2xl font-tech font-bold text-white tracking-tighter">
              WALLET<span className="text-bs-jade">STORE</span>
            </h1>
          </Link>

          {/* 2. Links Desktop (Hidden no Mobile) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-mono text-gray-400">
            <Link to="/" className="hover:text-bs-jade transition-colors">PRODUTOS</Link>
            <Link to="/sobre" className="hover:text-bs-jade transition-colors">SOBRE</Link>
            <Link to="/rastreio" className="hover:text-bs-jade transition-colors">RASTREIO</Link>
          </div>

          {/* 3. Ações (Carrinho + Menu Mobile) */}
          <div className="flex items-center gap-4">
            
            {/* Carrinho */}
            <Link to="/carrinho" className="relative p-2 text-white hover:text-bs-jade transition-colors" onClick={() => setIsMenuOpen(false)}>
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-bs-jade text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Botão Menu Hambúrguer (Só aparece no Mobile) */}
            <button 
              className="md:hidden text-white hover:text-bs-jade transition-colors p-1"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Menu Mobile Dropdown (Lógica de exibição) */}
      {isMenuOpen && (
        <div className="md:hidden bg-black border-b border-bs-border absolute w-full left-0 animate-in slide-in-from-top-5 duration-200">
          <div className="px-4 py-4 space-y-2 font-mono">
            
            <Link 
              to="/" 
              className="block px-4 py-3 text-gray-300 hover:text-black hover:bg-bs-jade transition-colors border-l-2 border-transparent hover:border-white flex justify-between items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              CATÁLOGO DE PRODUTOS
              <ChevronRight size={16} />
            </Link>

            <Link 
              to="/sobre" 
              className="block px-4 py-3 text-gray-300 hover:text-black hover:bg-bs-jade transition-colors border-l-2 border-transparent hover:border-white flex justify-between items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              SOBRE NÓS
              <ChevronRight size={16} />
            </Link>

            <Link 
              to="/rastreio" 
              className="block px-4 py-3 text-gray-300 hover:text-black hover:bg-bs-jade transition-colors border-l-2 border-transparent hover:border-white flex justify-between items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              RASTREAR PEDIDO
              <ChevronRight size={16} />
            </Link>

            {/* Link extra útil no mobile */}
            <Link 
              to="/checkout" 
              className="block px-4 py-3 text-bs-jade border border-bs-jade/30 text-center mt-4 font-bold tracking-widest uppercase hover:bg-bs-jade hover:text-black transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              IR PARA CHECKOUT
            </Link>
            
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;