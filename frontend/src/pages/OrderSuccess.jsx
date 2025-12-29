import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Copy, Clock, AlertTriangle, QrCode, Bitcoin, Zap, Info, XCircle } from 'lucide-react';

const api = axios.create({ baseURL: '/api' });

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loadingPay, setLoadingPay] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  
  // Estado para notificações na tela (substitui alerts)
  const [notification, setNotification] = useState(null);

  // 1. Busca dados do pedido
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/public/pedido/${id}/`);
        setOrder(data);
      } catch (error) {
        console.error("Erro ao buscar pedido:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  // 2. Timer
  useEffect(() => {
    if (paymentData && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [paymentData, timeLeft]);

  // Função para mostrar notificação
  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePayment = async (method) => {
    setSelectedMethod(method);
    setLoadingPay(true);
    setPaymentData(null); // Limpa dados anteriores

    try {
      const { data } = await api.post(`/public/pedido/${id}/pagar/`, { method });
      setPaymentData(data);
      if (data.seconds_remaining) {
        setTimeLeft(data.seconds_remaining);
      }
    } catch (error) {
      console.error("Erro pagamento:", error);
      const errorMsg = error.response?.data?.error || "Falha ao conectar com o provedor de pagamento.";
      showNotification(errorMsg, 'error');
    } finally {
      setLoadingPay(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification("Copiado para a área de transferência!");
  };

  if (loading) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center font-tech">CARREGANDO...</div>;
  if (!order) return <div className="min-h-screen bg-[#121212] text-white flex items-center justify-center font-tech">PEDIDO NÃO ENCONTRADO</div>;

  return (
    <div className="min-h-screen bg-bs-black text-white font-tech py-8 px-4 relative">
      
      {/* NOTIFICAÇÃO FLUTUANTE (TOAST) */}
      {notification && (
        <div className={`fixed top-5 right-5 p-4 rounded shadow-lg z-50 flex items-center gap-3 animate-fade-in ${notification.type === 'error' ? 'bg-red-900 border border-red-500' : 'bg-bs-jade text-black'}`}>
          {notification.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
          <span className="font-bold text-sm">{notification.msg}</span>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-bs-jade/10 mb-4 border border-bs-jade/30">
            <CheckCircle className="w-10 h-10 text-bs-jade" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-wide text-white">PEDIDO CONFIRMADO!</h1>
          <p className="text-gray-400">ID do Pedido: <span className="text-white font-bold">#{order.id}</span></p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* COLUNA ESQUERDA: Métodos */}
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] p-6 rounded border border-gray-800">
                <h3 className="text-lg font-bold border-b border-gray-800 pb-4 mb-6 flex items-center gap-2">
                    <span className="w-2 h-6 bg-bs-jade rounded-sm"></span>
                    ESCOLHA O MÉTODO
                </h3>
                
                <div className="space-y-3">
                    {/* BITCOIN */}
                    <button 
                    onClick={() => handlePayment('BTC')}
                    disabled={loadingPay}
                    className={`w-full p-4 rounded border flex items-center justify-between transition-all group ${selectedMethod === 'BTC' ? 'border-orange-500 bg-orange-500/10' : 'border-gray-700 bg-black hover:border-orange-500/50'}`}
                    >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded ${selectedMethod === 'BTC' ? 'bg-orange-500 text-black' : 'bg-gray-800 text-orange-500'}`}><Bitcoin size={24} /></div>
                        <div className="text-left">
                            <span className={`block font-bold ${selectedMethod === 'BTC' ? 'text-orange-500' : 'text-gray-300'}`}>BITCOIN</span>
                            <span className="text-xs text-gray-500">Rede Principal (On-chain)</span>
                        </div>
                    </div>
                    {loadingPay && selectedMethod === 'BTC' && <Zap className="animate-spin text-orange-500" />}
                    </button>

                    {/* LIQUID BTC */}
                    <button 
                    onClick={() => handlePayment('LBTC')}
                    disabled={loadingPay}
                    className={`w-full p-4 rounded border flex items-center justify-between transition-all group ${selectedMethod === 'LBTC' ? 'border-blue-400 bg-blue-400/10' : 'border-gray-700 bg-black hover:border-blue-400/50'}`}
                    >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded ${selectedMethod === 'LBTC' ? 'bg-blue-400 text-black' : 'bg-gray-800 text-blue-400'}`}><Zap size={24} /></div>
                        <div className="text-left">
                            <span className={`block font-bold ${selectedMethod === 'LBTC' ? 'text-blue-400' : 'text-gray-300'}`}>LIQUID BTC</span>
                            <span className="text-xs text-gray-500">Transação Rápida & Confidencial</span>
                        </div>
                    </div>
                    {loadingPay && selectedMethod === 'LBTC' && <Zap className="animate-spin text-blue-400" />}
                    </button>

                    {/* DEPIX */}
                    <button 
                    onClick={() => handlePayment('DEPIX')}
                    disabled={loadingPay}
                    className={`w-full p-4 rounded border flex items-center justify-between transition-all group ${selectedMethod === 'DEPIX' ? 'border-green-400 bg-green-400/10' : 'border-gray-700 bg-black hover:border-green-400/50'}`}
                    >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded ${selectedMethod === 'DEPIX' ? 'bg-green-400 text-black' : 'bg-gray-800 text-green-400'}`}><QrCode size={24} /></div>
                        <div className="text-left">
                            <span className={`block font-bold ${selectedMethod === 'DEPIX' ? 'text-green-400' : 'text-gray-300'}`}>DePix (Liquid)</span>
                            <span className="text-xs text-gray-500">Stablecoin via Liquid Network</span>
                        </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-green-900/50 text-green-400 rounded border border-green-900">Sem Taxas</span>
                    </button>

                    {/* PIX */}
                    <button 
                    onClick={() => handlePayment('PIX')}
                    disabled={loadingPay}
                    className={`w-full p-4 rounded border flex items-center justify-between transition-all group ${selectedMethod === 'PIX' ? 'border-bs-jade bg-bs-jade/10' : 'border-gray-700 bg-black hover:border-bs-jade/50'}`}
                    >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded ${selectedMethod === 'PIX' ? 'bg-bs-jade text-black' : 'bg-gray-800 text-bs-jade'}`}><QrCode size={24} /></div>
                        <div className="text-left">
                            <span className={`block font-bold ${selectedMethod === 'PIX' ? 'text-bs-jade' : 'text-gray-300'}`}>PIX (BRL)</span>
                            <span className="text-xs text-gray-500">Pagamento Instantâneo</span>
                        </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold px-2 py-1 bg-red-900/50 text-red-400 rounded border border-red-900">+15% Taxas</span>
                    </button>
                </div>

                {/* INFO BOX DO PIX */}
                {selectedMethod === 'PIX' && (
                    <div className="mt-4 p-3 bg-gray-900 border-l-4 border-red-500 text-gray-400 text-xs leading-relaxed animate-fade-in">
                        <strong className="text-red-500 block mb-1">⚠️ Sobre a taxa de 15%:</strong>
                        Para cobrir custos de conformidade fiscal e impostos governamentais em transações Fiat, aplicamos um acréscimo de 15%. Para isenção, utilize Crypto.
                    </div>
                )}
            </div>
          </div>

          {/* COLUNA DIREITA: Área do QR Code */}
          <div className="bg-[#1a1a1a] p-1 rounded border border-gray-800 relative min-h-[450px] flex flex-col">
            
            {!paymentData ? (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-600 p-8 text-center">
                    {loadingPay ? (
                        <>
                            <Loader2 className="w-12 h-12 text-bs-jade animate-spin mb-4" />
                            <p className="animate-pulse">Gerando endereço único...</p>
                        </>
                    ) : (
                        <>
                            <QrCode className="w-16 h-16 mb-4 opacity-20" />
                            <p>Selecione um método de pagamento ao lado para gerar o endereço.</p>
                        </>
                    )}
                </div>
            ) : (
                <div className="p-6 animate-fade-in flex flex-col h-full">
                    
                    {/* Timer */}
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-400 text-sm">Expira em:</span>
                        <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 px-3 py-1 rounded font-tech font-bold">
                            <Clock size={16} /> {formatTime(timeLeft)}
                        </div>
                    </div>

                    {/* Valor */}
                    <div className="text-center mb-6">
                        <p className="text-sm text-gray-500 uppercase tracking-widest mb-1">Total a enviar</p>
                        <div className="text-3xl font-bold text-white break-all">
                            {paymentData.method === 'PIX' ? (
                                <span className="text-bs-jade">R$ {paymentData.amount_brl}</span>
                            ) : (
                                <span>{paymentData.amount_crypto} <span className="text-sm text-gray-500">{paymentData.method}</span></span>
                            )}
                        </div>
                        {paymentData.rate && paymentData.method !== 'PIX' && (
                            <p className="text-xs text-gray-600 mt-2">1 {paymentData.method} ≈ R$ {paymentData.rate}</p>
                        )}
                    </div>

                    {/* QR Code Imagem (Usando API Externa para Garantir que Funciona) */}
                    <div className="bg-white p-4 rounded-lg mx-auto mb-6 shadow-xl shadow-black/50">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentData.qr_code)}`} 
                            alt="QR Code Pagamento" 
                            className="w-48 h-48 object-contain"
                        />
                    </div>

                    {/* Endereço Texto */}
                    <div className="bg-black border border-gray-700 rounded p-3 relative group mt-auto">
                        <p className="text-[10px] text-gray-500 mb-1 uppercase">
                            {paymentData.method === 'PIX' ? 'Código Pix (Copia e Cola)' : 'Endereço da Carteira'}
                        </p>
                        <p className="text-xs text-bs-jade break-all font-tech pr-8 leading-relaxed">
                            {paymentData.qr_code}
                        </p>
                        <button 
                            onClick={() => copyToClipboard(paymentData.qr_code)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-white transition-colors"
                            title="Copiar"
                        >
                            <Copy size={18} />
                        </button>
                    </div>

                    <div className="mt-4 flex items-start gap-2 text-[10px] text-yellow-600 bg-yellow-900/10 p-2 rounded border border-yellow-900/20">
                        <AlertTriangle size={14} className="shrink-0 top-0.5 relative" />
                        <p>Envie o valor exato. Valores diferentes podem não ser reconhecidos automaticamente.</p>
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="text-center mt-16 pt-8 border-t border-gray-900">
            <Link to="/" className="text-gray-500 hover:text-bs-jade text-sm transition-colors">
                ← Voltar para a Loja
            </Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;