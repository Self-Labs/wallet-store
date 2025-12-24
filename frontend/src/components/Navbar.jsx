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
          <div className="hidden md:flex items-center gap-8 text-sm font-tech text-gray-400">
            <Link to="/produtos" className="hover:text-bs-jade transition-colors">PRODUTOS</Link>
            <Link to="/sobre" className="hover:text-bs-jade transition-colors">SOBRE</Link>
            <Link to="/rastreio" className="hover:text-bs-jade transition-colors">RASTREIO</Link>
            <Link to="/contato" className="hover:text-bs-jade transition-colors">CONTATO</Link>
          </div>

          {/* 3. Carrinho e Menu Mobile Icon */}
          <div className="flex items-center gap-6">
            <Link to="/carrinho" className="relative group" onClick={() => setIsMenuOpen(false)}>
              <ShoppingCart className="text-gray-400 group-hover:text-bs-jade transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-bs-jade text-black text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Botão Hamburger (Só aparece no Mobile) */}
            <button 
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Menu Mobile (Dropdown) */}
      {isMenuOpen && (
        <div className="md:hidden bg-bs-card border-b border-bs-border animate-fade-in font-tech text-sm">
           <Link 
              to="/produtos"
              className="block px-4 py-3 text-gray-300 hover:text-black hover:bg-bs-jade transition-colors border-l-2 border-transparent hover:border-white flex justify-between items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              PRODUTOS
              <ChevronRight size={16} />
            </Link>

            <Link 
              to="/sobre" 
              className="block px-4 py-3 text-gray-300 hover:text-black hover:bg-bs-jade transition-colors border-l-2 border-transparent hover:border-white flex justify-between items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              SOBRE
              <ChevronRight size={16} />
            </Link>

            <Link 
              to="/rastreio" 
              className="block px-4 py-3 text-gray-300 hover:text-black hover:bg-bs-jade transition-colors border-l-2 border-transparent hover:border-white flex justify-between items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              RASTREIO
              <ChevronRight size={16} />
            </Link>

            <Link 
              to="/contato" 
              className="block px-4 py-3 text-gray-300 hover:text-black hover:bg-bs-jade transition-colors border-l-2 border-transparent hover:border-white flex justify-between items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              CONTATO
              <ChevronRight size={16} />
            </Link>

            <Link 
              to="/checkout" 
              className="block px-4 py-3 text-bs-jade border border-bs-jade/30 text-center mt-4 font-bold tracking-widest uppercase hover:bg-bs-jade hover:text-black transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              IR PARA CHECKOUT
            </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;