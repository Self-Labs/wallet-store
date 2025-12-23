import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

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
      const response = await fetch(`/api/sales/public/rastreio/?code=${code}`);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'ID not found in the mempool.');
      }
    } catch (err) {
      setError('Connection failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
       {/* HEADER PADRÃO */}
      <h1 className="text-3xl font-tech text-white mb-8 flex items-center gap-3">
            <span className="text-bs-jade">///</span> TRACKING
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Coluna de Busca */}
        <div className="lg:col-span-2">
            <div className="bg-bs-card border border-bs-border p-6">
                <form onSubmit={handleTrack} className="flex flex-col gap-4">
                    <label className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                        Shipment UUID / Tracking Code
                    </label>
                    <div className="flex gap-2">
                        <div className="flex-grow relative">
                            <input 
                                type="text" 
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="OJ123456789BR"
                                className="w-full bg-black border border-bs-border text-white p-4 font-mono uppercase focus:border-bs-jade outline-none transition-colors"
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="bg-bs-jade text-black font-bold px-8 uppercase tracking-widest hover:bg-[#00ffa3]/90 disabled:opacity-50 transition-colors flex items-center gap-2"
                        >
                            {loading ? '...' : <ArrowRight />}
                        </button>
                    </div>
                </form>

                {error && (
                    <div className="mt-6 p-4 border border-red-900/50 bg-red-900/10 text-red-500 font-mono text-sm flex items-center gap-3">
                        <XCircle size={16} /> {error}
                    </div>
                )}
            </div>
        </div>

        {/* Coluna de Resultado */}
        <div className="lg:col-span-1">
            {result ? (
                <div className="bg-bs-card border border-bs-jade p-6 animate-fade-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-bs-jade"></div>
                    
                    <h2 className="text-white font-tech text-2xl mb-1">{result.tracking_code}</h2>
                    <p className={`font-mono text-xs font-bold uppercase mb-6 
                        ${result.status === 'DELIVERED' ? 'text-bs-jade' : 'text-bs-blue'}`}>
                        STATUS: {result.status}
                    </p>

                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <CheckCircle className="text-gray-600 mt-1" size={16} />
                            <div>
                                <p className="text-gray-300 font-mono text-sm uppercase leading-relaxed">
                                    {result.message}
                                </p>
                            </div>
                        </div>
                    </div>

                    {result.status === 'DELIVERED' && (
                        <div className="mt-8 pt-4 border-t border-bs-border text-[10px] font-mono text-gray-600 uppercase text-center">
                            /// DATA PURGED FROM SERVERS
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-full border border-dashed border-bs-border flex items-center justify-center text-gray-700 font-mono text-xs uppercase p-8 text-center">
                    Awaiting Input Signal...
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Tracking;