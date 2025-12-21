import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// Placeholder simples apenas para o que ainda falta
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-[60vh] text-bs-jade font-tech text-2xl border border-dashed border-bs-border m-8 bg-bs-card/20">
    // {title} // EM BREVE
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-bs-black text-white font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          
          <Route path="/rastreio" element={<Placeholder title="SISTEMA DE RASTREIO" />} />
          <Route path="/conta" element={<Placeholder title="ÁREA DO CLIENTE" />} />
          <Route path="/admin" element={<Placeholder title="PAINEL ADMINISTRATIVO" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;