import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import { CartProvider } from './contexts/CartContext';

// Placeholder simples apenas para o que ainda falta
const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center h-[60vh] text-bs-jade font-tech text-2xl border border-dashed border-bs-border m-8 bg-bs-card/20">
    // {title} // EM BREVE
  </div>
);

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter flex flex-col">
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
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;