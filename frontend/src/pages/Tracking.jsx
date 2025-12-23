import React, { useState } from 'react';

const Tracking = () => {
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Conecta na nossa API pública
      // Ajuste a URL se estiver em produção, aqui assume proxy ou localhost
      const response = await fetch(`http://192.168.68.9:8002/api/sales/public/rastreio/?code=${code}`);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Erro ao buscar rastreio');
      }
    } catch (err) {
      setError('Falha na conexão com o servidor de rastreio.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-xl">
      <h1 className="text-3xl font-bold mb-6 text-center" style={{ fontFamily: 'Rigid Square' }}>
        Rastreio Soberano
      </h1>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <form onSubmit={handleTrack} className="mb-8">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Código de Rastreio
          </label>
          <div className="flex gap-2">
            <input 
              type="text" 
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="OJ123456789BR"
              className="flex-1 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 p-3 uppercase tracking-wider font-mono"
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? '...' : 'Buscar'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4 border border-red-200">
            {error}
          </div>
        )}

        {result && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 animate-fade-in">
            <div className="text-center mb-6">
              <span className={`inline-block px-4 py-1 rounded-full text-sm font-bold 
                ${result.status === 'DELIVERED' ? 'bg-green-100 text-green-800' : 
                  result.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {result.status}
              </span>
              <p className="mt-2 text-xl font-mono">{result.tracking_code}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
              <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Status Atual:</h3>
              <p className="text-lg text-gray-800 dark:text-white">
                {result.message}
              </p>
            </div>

            {result.status === 'DELIVERED' && (
              <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded text-sm text-indigo-700 dark:text-indigo-300">
                🔒 Nota de Privacidade: Os dados pessoais associados a este envio já foram eliminados dos nossos servidores.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracking;