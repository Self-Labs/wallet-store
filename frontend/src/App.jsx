import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';

// Componentes Placeholder (Para não dar erro 404 agora)
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-[60vh] text-bs-jade font-tech text-2xl">
    // {title} // EM DESENVOLVIMENTO
  </div>
);

function App() {
  return (
    <div className="min-h-screen bg-bs-black text-white font-sans flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produto/:id" element={<Placeholder title="DETALHES DO PRODUTO" />} />
          <Route path="/sobre" element={<Placeholder title="SOBRE NÓS" />} />
          <Route path="/rastreio" element={<Placeholder title="RASTREIO" />} />
          <Route path="/carrinho" element={<Placeholder title="CARRINHO" />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;