import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Copy, Clock, AlertTriangle, QrCode, Bitcoin, Zap } from 'lucide-react';

const api = axios.create({ baseURL: '/api' });

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null); // Dados da transação (QR code, address)
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loadingPay, setLoadingPay] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos em segundos

  // 1. Busca dados básicos do pedido
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

  // 2. Timer de 15 minutos (Regressiva)
  useEffect(() => {
    if (paymentData && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [paymentData, timeLeft]);

  // 3. Inicia o Pagamento (Gera QR/Endereço)
  const handlePayment = async (method) => {
    setSelectedMethod(method);
    setLoadingPay(true);
    setPaymentData(null); // Limpa anterior

    try {
      // Chama o endpoint start-payment que criamos no backend
      const { data } = await api.post(`/public/pedido/${id}/pagar/`, { method });
      setPaymentData(data);
      
      // Ajusta o timer baseado no expires_at do backend
      if (data.seconds_remaining) {
        setTimeLeft(data.seconds_remaining);
      }
    } catch (error) {
      console.error("Erro ao gerar pagamento:", error);
      alert("Erro ao gerar pagamento. Tente novamente.");
    } finally {
      setLoadingPay(false);
    }
  };

  // Formata segundos em MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Copiar para área de transferência
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copiado!");
  };

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-tech">CARREGANDO...</div>;

  if (!order) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-tech">PEDIDO NÃO ENCONTRADO</div>;

  return (
    <div className="min-h-screen bg-black text-white font-tech py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* CABEÇALHO */}
        <div className="text-center mb-12 animate-fade-in">
          <CheckCircle className="w-20 h-20 text-bs-jade mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">PEDIDO CONFIRMADO!</h1>
          <p className="text-gray-400">ID do Pedido: <span className="text-white font-bold">#{order.id}</span></p>
          <div className="mt-4 p-4 border border-bs-border inline-block rounded bg-bs-card">
            <span className="text-gray-400 text-sm">TOTAL A PAGAR</span>
            <div className="text-3xl text-bs-jade font-bold">R$ {order.total.toFixed(2)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* SELEÇÃO DE PAGAMENTO */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold border-b border-gray-800 pb-2 mb-4">ESCOLHA O MÉTODO</h3>
            
            <button 
              onClick={() => handlePayment('PIX')}
              disabled={loadingPay}
              className={`w-full p-4 border rounded flex items-center justify-between transition-all ${selectedMethod === 'PIX' ? 'border-bs-jade bg-bs-jade/10 text-bs-jade' : 'border-gray-700 hover:border-gray-500'}`}
            >
              <div className="flex items-center gap-3"><QrCode /> <span>PIX (Instantâneo)</span></div>
              {loadingPay && selectedMethod === 'PIX' && <Zap className="animate-spin" />}
            </button>

            <button 
              onClick={() => handlePayment('BTC')}
              disabled={loadingPay}
              className={`w-full p-4 border rounded flex items-center justify-between transition-all ${selectedMethod === 'BTC' ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-gray-700 hover:border-gray-500'}`}
            >
              <div className="flex items-center gap-3"><Bitcoin /> <span>BITCOIN (On-chain)</span></div>
              {loadingPay && selectedMethod === 'BTC' && <Zap className="animate-spin" />}
            </button>

            <button 
              onClick={() => handlePayment('LBTC')}
              disabled={loadingPay}
              className={`w-full p-4 border rounded flex items-center justify-between transition-all ${selectedMethod === 'LBTC' ? 'border-blue-400 bg-blue-400/10 text-blue-400' : 'border-gray-700 hover:border-gray-500'}`}
            >
              <div className="flex items-center gap-3"><Zap /> <span>LIQUID BTC (Rápido/Privado)</span></div>
              {loadingPay && selectedMethod === 'LBTC' && <Zap className="animate-spin" />}
            </button>
          </div>

          {/* ÁREA DE PAGAMENTO (QR CODE / DADOS) */}
          <div className="bg-bs-card border border-bs-border p-6 rounded min-h-[300px] flex flex-col items-center justify-center relative">
            
            {!paymentData && !loadingPay && (
              <p className="text-gray-500 text-center">Selecione um método ao lado para gerar o pagamento.</p>
            )}

            {loadingPay && (
              <div className="text-center animate-pulse">
                <Zap className="w-12 h-12 text-bs-jade mx-auto mb-4 animate-bounce" />
                <p>Gerando endereço seguro...</p>
              </div>
            )}

            {paymentData && !loadingPay && (
              <div className="w-full animate-fade-in text-center">
                
                {/* Timer */}
                <div className="absolute top-4 right-4 flex items-center gap-2 text-orange-500 text-sm font-bold bg-orange-900/20 px-3 py-1 rounded">
                  <Clock size={16} /> {formatTime(timeLeft)}
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-1">Valor em {paymentData.method}</p>
                  <p className="text-2xl font-bold text-white">
                    {paymentData.method === 'PIX' ? `R$ ${paymentData.amount_brl}` : paymentData.amount_crypto}
                  </p>
                  {paymentData.rate && <p className="text-xs text-gray-500">Cotação: 1 {paymentData.method} = R$ {paymentData.rate}</p>}
                </div>

                {/* Exibição QR Code */}
                {paymentData.qr_code && (paymentData.method === 'PIX' || paymentData.method === 'BTC') && (
                   <div className="bg-white p-2 inline-block rounded mb-4">
                      {/* Nota: Para BTC/Pix real, usar biblioteca qrcode.react. Aqui simulo imagem ou texto */}
                      {paymentData.method === 'PIX' ? (
                          <img src={`data:image/png;base64,${paymentData.qr_code_base64 || ''}`} alt="QR Pix" className="w-48 h-48 object-contain" onError={(e) => e.target.style.display='none'} />
                      ) : (
                          // Para BTC, idealmente usar lib de QR. Se não tiver, exibe só o endereço
                          <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-black text-xs">QR Code Component</div>
                      )}
                   </div>
                )}

                {/* Endereço / Copia e Cola */}
                <div className="text-left w-full bg-black border border-gray-700 p-3 rounded mb-4 relative group">
                  <p className="text-xs text-gray-500 mb-1 uppercase">
                    {paymentData.method === 'PIX' ? 'Código Copia e Cola' : 'Endereço da Carteira'}
                  </p>
                  <p className="text-xs text-bs-jade break-all font-tech pr-8">
                    {paymentData.method === 'PIX' ? paymentData.qr_code : paymentData.address}
                  </p>
                  <button 
                    onClick={() => copyToClipboard(paymentData.method === 'PIX' ? paymentData.qr_code : paymentData.address)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:text-white text-gray-500"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-yellow-500 bg-yellow-900/10 p-2 rounded border border-yellow-900/30">
                  <AlertTriangle size={16} />
                  <span>Envie o valor exato. O pagamento expira em 15 minutos.</span>
                </div>

              </div>
            )}
          </div>
        </div>

        <div className="text-center mt-12">
            <Link to="/" className="text-bs-jade hover:underline text-sm">Voltar para a Loja</Link>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;