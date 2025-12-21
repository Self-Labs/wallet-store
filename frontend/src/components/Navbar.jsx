import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Menu } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="border-b border-bs-border bg-bs-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-2 h-8 bg-bs-jade group-hover:shadow-[0_0_10px_#00FFA3] transition-all"></div>
            <h1 className="text-2xl font-tech font-bold text-white tracking-tighter">
              WALLET<span className="text-bs-jade">STORE</span>
            </h1>
          </Link>

          {/* Links Desktop */}
          <div className="hidden md:flex items-center gap-8 text-sm font-mono text-gray-400">
            <Link to="/" className="hover:text-bs-jade transition-colors">PRODUTOS</Link>
            <Link to="/sobre" className="hover:text-bs-jade transition-colors">SOBRE</Link>
            <Link to="/rastreio" className="hover:text-bs-jade transition-colors">RASTREIO</Link>
          </div>

          {/* Carrinho */}
          <div className="flex items-center gap-4">
            <Link to="/carrinho" className="relative p-2 text-white hover:text-bs-jade transition-colors">
              <ShoppingCart size={24} />
              <span className="absolute top-0 right-0 bg-bs-jade text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                0
              </span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;