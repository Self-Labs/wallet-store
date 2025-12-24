import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Tracking from './pages/Tracking';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';

function App() {
  return (
    <div className="min-h-screen bg-bs-black text-white font-sans flex flex-col selection:bg-bs-jade selection:text-black">
      <Navbar />
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Products />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/rastreio" element={<Tracking />} />
          <Route path="/contato" element={<Contact />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/sucesso/:id" element={<OrderSuccess />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;