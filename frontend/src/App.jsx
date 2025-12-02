import React, { useState, useEffect } from 'react';
import { ShoppingBag, Server, AlertCircle, Package } from 'lucide-react';
import axios from 'axios';

// Configuração do Axios
const api = axios.create({
  baseURL: '/api', // O Proxy do Vite redireciona isso para o Django
});

function App() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Busca dados ao carregar a página
  useEffect(() => {
    api.get('/produtos/')
      .then(response => {
        setProdutos(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Erro ao buscar produtos:", err);
        setError("Falha ao conectar com o servidor.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-bs-black text-white p-8">
      {/* Cabeçalho */}
      <header className="flex items-center justify-between mb-12 border-b border-bs-border pb-6">
        <h1 className="text-4xl font-tech font-bold text-bs-jade tracking-tighter">
          WALLET<span className="text-white">STORE</span>
        </h1>
        <div className="flex items-center gap-2 text-xs font-tech text-gray-500">
          <Server size={14} />
          <span>SYSTEM ONLINE</span>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main>
        {loading && <div className="text-bs-blue animate-pulse">Carregando dados do estoque...</div>}
        
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 p-4 rounded text-red-400 flex items-center gap-3">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <h2 className="text-2xl font-tech mb-6 flex items-center gap-2">
              <Package className="text-bs-jade" /> Estoque Atual
            </h2>

            {produtos.length === 0 ? (
              <p className="text-gray-500 italic">Nenhum produto cadastrado no banco de dados.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {produtos.map(produto => (
                  <div key={produto.id} className="bg-bs-card border border-bs-border p-6 hover:border-bs-jade transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold group-hover:text-bs-jade">{produto.nome}</h3>
                      <span className="bg-bs-dark px-2 py-1 text-xs font-mono border border-bs-border rounded">
                        ID: {produto.id}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-400">
                      <p className="flex justify-between">
                        <span>Preço Venda:</span>
                        <span className="text-white font-mono">R$ {produto.preco_venda}</span>
                      </p>
                      <p className="flex justify-between">
                        <span>Custo Peças:</span>
                        <span className="text-white font-mono">R$ {produto.custo_total || '0.00'}</span>
                      </p>
                      <div className="border-t border-bs-border my-2 pt-2 flex justify-between text-bs-jade font-bold">
                        <span>Lucro Est.:</span>
                        <span>R$ {produto.lucro || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;