import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, Copy, ShieldCheck, ArrowRight, RefreshCw, QrCode, Wallet, Bitcoin } from 'lucide-react';

// Instância da API do seu Backend
const api = axios.create({ baseURL: '/api' });

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [btcPrice, setBtcPrice] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(true);
  const [activeTab, setActiveTab] = useState('pix'); // pix, depix, btc, lbtc
  const [atlasQrCode, setAtlasQrCode] = useState(null); // Para armazenar o QR Code da Atlas

  // Addresses
  const WALLETS = {
    depix: "lq1qq0a4y54p6s2eq4x7amyjj4wqv29fhfc43c4fsq6jfp88qjc390gqastyxnld54jcrwqyya02m5ahcahnfsas5c9vjkmn8g7lr",
    btc: "bc1q74lxm6tpam38qmuyyy4en23fuz5726cda6up78",
    lbtc: "lq1qq0a4y54p6s2eq4x7amyjj4wqv29fhfc43c4fsq6jfp88qjc390gqastyxnld54jcrwqyya02m5ahcahnfsas5c9vjkmn8g7lr"
  };

  // 1. Busca dados do Pedido no Backend
  useEffect(() => {
    // Usando a rota 'public/pedido' definida no urls.py, não a rota protegida 'pedidos'
    api.get(`/sales/public/pedido/${id}/`) // Ajuste a rota conforme seu backend
      .then(res => setOrder(res.data))
      .catch(err => console.error("Erro ao buscar pedido:", err));
  }, [id]);

  // 2. Busca Preço Binance + Spread 1%
  const fetchBinancePrice = async () => {
    setLoadingPrice(true);
    try {
      // API pública da Binance
      const res = await axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCBRL');
      const rawPrice = parseFloat(res.data.price);
      setBtcPrice(rawPrice * 1.01); // Aplica spread de 1%
    } catch (error) {
      console.error("Erro Binance:", error);
    } finally {
      setLoadingPrice(false);
    }
  };

  // Atualiza preço ao carregar e a cada 15 min (900000 ms)
  useEffect(() => {
    fetchBinancePrice();
    const interval = setInterval(fetchBinancePrice, 15 * 60 * 1000); 
    return () => clearInterval(interval);
  }, []);

  // 3. Simulação API Pix
  useEffect(() => {
    if (activeTab === 'pix' && order && !atlasQrCode) {
      // TODO: AQUI ENTRA A CHAMADA REAL DA ATLAS
      // Exemplo:
      // axios.post('https://api.atlasdao.com/pix/generate', { amount: order.total, webhook: ... })
      // .then(res => setAtlasQrCode(res.data.qrcode_text))

      // Mock temporário para você ver funcionando:
      setAtlasQrCode(`00020126580014BR.GOV.BCB.PIX0114+551199999999520400005303986540${order.total}5802BR5913WALLET STORE6008BRASILIA62070503***6304`);
    }
  }, [activeTab, order]);

  // Helpers
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copiado!');
  };

  const calculateBtcAmount = () => {
    if (!order || !btcPrice) return "0.00000000";
    return (parseFloat(order.total) / btcPrice).toFixed(8);
  };

  if (!order) return <div className="text-center py-20 text-bs-jade font-tech animate-pulse">CARREGANDO PEDIDO...</div>;

  const btcAmount = calculateBtcAmount();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'pix':
        return (
          <div className="text-center animate-fade-in">
            <div className="bg-white p-2 inline-block mb-4 border-2 border-bs-jade">
              {/* Aqui você usaria uma lib como 'qrcode.react' para renderizar o QR Code visualmente */}
              <QrCode size={150} className="text-black" />
            </div>
            <p className="text-gray-500 font-tech text-[10px] uppercase mb-2">Pix Copy & Paste</p>
            <div className="bg-black border border-bs-border p-3 flex items-center gap-2">
              <code className="text-bs-jade font-tech text-[10px] truncate flex-grow text-left opacity-80">
                {atlasQrCode || "Gerando Pix..."}
              </code>
              <button
                onClick={() => copyToClipboard(atlasQrCode)}
                className="text-gray-500 hover:text-white"
              >
                <Copy size={16}/>
              </button>
            </div>
          </div>
        );
      case 'depix':
        return (
          <div className="text-left animate-fade-in">
            <div className="mb-4 p-4 bg-blue-900/10 border border-blue-500/30 text-blue-400 font-tech text-xs">
              <strong>Liquid Network</strong><br/>
              Envie tokens DePix (1:1 BRL).
            </div>
            <p className="text-gray-500 font-tech text-[10px] uppercase mb-1">Endereço Liquid</p>
            <div className="bg-black border border-bs-border p-3 flex items-center gap-2 mb-4">
              <code className="text-blue-400 font-tech text-xs truncate flex-grow">{WALLETS.depix}</code>
              <button
                onClick={() => copyToClipboard(WALLETS.depix)}
                className="text-gray-500 hover:text-white"
              >
                <Copy size={16}/>
              </button>
            </div>
            <div className="text-right">
              <p className="text-gray-500 font-tech text-[10px] uppercase">Valor Exato</p>
              <div className="text-2xl font-tech text-white">{order.total} DePix</div>
            </div>
          </div>
        );
      case 'btc':
      case 'lbtc':
        const isLiquid = activeTab === 'lbtc';
        const wallet = isLiquid ? WALLETS.lbtc : WALLETS.btc;
        const color = isLiquid ? 'text-blue-300' : 'text-[#F7931A]';
        return (
          <div className="animate-fade-in text-left">
            <div className={`mb-4 p-4 ${isLiquid ? 'bg-blue-900/10 border-blue-500/30' : 'bg-orange-900/10 border-orange-500/30'} font-tech text-xs text-gray-300`}>
              <strong>{isLiquid ? 'Liquid Network' : 'Bitcoin Mainnet'}</strong><br/>
              1 BTC = R$ {btcPrice.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </div>
            <p className="text-gray-500 font-tech text-[10px] uppercase mb-1">
              Endereço de Destino
            </p>
            <div className="bg-black border border-bs-border p-3 flex items-center gap-2 mb-4">
              <code className={`${color} font-tech text-xs truncate flex-grow`}>
                {wallet}
              </code>
              <button
                onClick={() => copyToClipboard(wallet)}
                className="text-gray-500 hover:text-white"
              >
                <Copy size={16}/>
              </button>
            </div>

            <div className="text-right border-t border-bs-border pt-2">
              <p className="text-gray-500 font-tech text-[10px] uppercase">
                Total a Enviar
              </p>
              <div className={`text-2xl font-tech ${color}`}>
                {btcAmount} BTC
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 text-center animate-fade-in">
      <div className="mb-6 flex justify-center">
        <CheckCircle className="text-bs-jade w-16 h-16" />
      </div>
      <h1 className="text-3xl font-tech text-white mb-2">
        ORDER <span className="text-bs-jade">CONFIRMED</span>
      </h1>
      <p className="text-gray-500 font-tech text-xs mb-8 uppercase tracking-widest">
        ID: <span className="text-white font-bold">#{id}</span>
      </p>

      <div className="bg-bs-card border border-bs-border">
        <div className="flex border-b border-bs-border bg-black">
          {['pix', 'depix', 'btc', 'lbtc'].map(tab => (
            <button
              key={tab} 
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 font-tech text-[10px] font-bold uppercase
              ${activeTab === tab ? 'text-bs-jade border-b-2 border-bs-jade' : 'text-gray-600'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-8 min-h-[300px] flex flex-col justify-center">
          {renderTabContent()}
        </div>
      </div>

      <div className="mt-8 opacity-70 flex flex-col items-center gap-4">
        <div className="inline-flex items-center gap-2 text-red-500 font-tech text-[10px] uppercase border border-red-900/30 bg-red-900/10 px-3 py-1">
          <ShieldCheck size={12} /> Dados Criptografados
        </div>
        <Link to="/" className="text-bs-jade hover:text-white font-tech text-sm uppercase flex items-center gap-2">
          Voltar à Loja <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;