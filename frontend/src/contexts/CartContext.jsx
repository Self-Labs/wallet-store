import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // 1. Inicialização BLINDADA (Try/Catch)
  // Se o JSON estiver quebrado, não derruba o site
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('walletStore_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Carrinho corrompido detectado. Resetando...", error);
      localStorage.removeItem('walletStore_cart'); // Limpa o lixo
      return [];
    }
  });

  // Salva no LocalStorage sempre que o carrinho mudar
  useEffect(() => {
    localStorage.setItem('walletStore_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Adicionar Item
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  // Remover Item
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Atualizar Quantidade (+/-)
  const updateQuantity = (productId, amount) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === productId) {
          const newQuantity = item.quantity + amount;
          return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
        }
        return item;
      });
    });
  };

  // Limpar Tudo
  const clearCart = () => setCartItems([]);

  // Cálculos Derivados (Total de Itens e Valor Total)
  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.preco_venda) * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      totalItems,
      cartTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);