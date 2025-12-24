import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldAlert, Lock, Truck, CreditCard, Search, Loader2 } from 'lucide-react';

const api = axios.create({ baseURL: '/api' });

// --- MÁSCARAS E VALIDAÇÃO (Novas Funções) ---
const maskCPF = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

const maskPhone = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})\d+?$/, '$1');
};

const maskCEP = (value) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{3})\d+?$/, '$1');
};

const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf === '') return false;
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let add = 0;
  for (let i = 0; i < 9; i++) add += parseInt(cpf.charAt(i)) * (10 - i);
  let rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(9))) return false;

  add = 0;
  for (let i = 0; i < 10; i++) add += parseInt(cpf.charAt(i)) * (11 - i);
  rev = 11 - (add % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(cpf.charAt(10))) return false;

  return true;
};
// ----------------------------------------------

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cpfError, setCpfError] = useState(false); // Estado para erro visual do CPF

  // Estado granular para os campos do Melhor Envio
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    cpf: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: ''
  });

  if (cartItems.length === 0) {
    setTimeout(() => navigate('/'), 3000);
    return <div className="text-center py-20 text-bs-jade font-mono">CARRINHO VAZIO. REDIRECIONANDO...</div>;
  }

  // Função para buscar CEP
  const handleCepBlur = async (e) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length === 8) {
      setLoadingCep(true);
      try {
        const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            district: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
          document.getElementById('numero-input').focus(); // Pula pro número
        }
      } catch (error) {
        console.error("Erro CEP");
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Alterado para aplicar máscaras
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === 'cpf') {
      value = maskCPF(value);
      setCpfError(false); // Limpa erro ao digitar
    }
    if (name === 'phone') value = maskPhone(value);
    if (name === 'cep') value = maskCEP(value);

    setFormData({ ...formData, [name]: value });
  };

  // Valida CPF ao sair do campo
  const handleCpfBlur = () => {
    if (formData.cpf.length > 0) {
      setCpfError(!validateCPF(formData.cpf));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Bloqueia envio se CPF for inválido
    if (!validateCPF(formData.cpf)) {
      setCpfError(true);
      alert("CPF Inválido. Verifique os números.");
      return;
    }

    setLoading(true);

    // Junta os campos numa string única para o Backend (que espera 'address' texto)
    const formattedAddress = `Logradouro: ${formData.street}, ${formData.number} ${formData.complement}
    Bairro: ${formData.district}
    Cidade: ${formData.city}/${formData.state}
    CEP: ${formData.cep} | Tel: ${formData.phone}`;

    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      cpf: formData.cpf,
      address: formattedAddress, // Backend recebe o blocão de texto
      items: cartItems.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price_at_purchase: item.preco_venda
      }))
    };

    try {
      const response = await api.post('/pedidos/', payload);
      // SUCESSO
      clearCart(); // Limpa o carrinho
      alert(`PEDIDO #${response.data.id} CONFIRMADO!\n\nGuarde este ID para rastreio.`);
      navigate('/'); // Futuramente mandaremos para uma página de sucesso
    } catch (error) {
      console.error(error);
      alert("ERRO AO PROCESSAR PEDIDO. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Styles helpers para não poluir o JSX
  const inputStyle = "w-full bg-black border border-bs-border text-white p-3 focus:border-bs-jade outline-none font-mono";
  
  // Estilo condicional para erro
  const errorInputStyle = "w-full bg-black border border-red-500 text-red-500 p-3 focus:border-red-500 outline-none font-mono";
  const labelStyle = "block text-bs-jade text-xs font-bold mb-2 uppercase";

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in">
      <h1 className="text-3xl font-tech text-white mb-8 flex items-center gap-3">
        <Lock className="text-bs-jade" /> CHECKOUT SEGURO
      </h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

        {/* COLUNA 1: Formulário */}
        <div className="lg:col-span-2">
          <div className="bg-bs-card border border-bs-border p-8 mb-8">
            <div className="flex items-center gap-2 mb-6 text-red-500 bg-red-900/10 p-4 border border-red-900/30">
              <ShieldAlert size={20} />
              <p className="text-xs font-mono uppercase tracking-wider">
                AVISO: SEUS DADOS PESSOAIS SERÃO DESTRUÍDOS APÓS A ENTREGA.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* Dados Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>Nome Completo</label>
                  <input 
                    required 
                    name="full_name" 
                    value={formData.full_name} // Adicionado value
                    onChange={handleChange} 
                    type="text" 
                    className={inputStyle} 
                    placeholder="Satoshi Nakamoto" 
                  />
                </div>
                <div>
                  <label className={labelStyle}>CPF (Exigência Envio)</label>
                  <input 
                    required 
                    name="cpf" 
                    value={formData.cpf} // Adicionado value para máscara
                    onChange={handleChange} 
                    onBlur={handleCpfBlur} // Valida ao sair
                    type="text" 
                    className={cpfError ? errorInputStyle : inputStyle} 
                    placeholder="000.000.000-00" 
                    maxLength="14" 
                  />
                  {cpfError && <span className="text-red-500 text-[10px] font-mono mt-1">CPF INVÁLIDO</span>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelStyle}>E-mail</label>
                  <input 
                    required 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    type="email" 
                    className={inputStyle} 
                    placeholder="email@seguro.com" 
                  />
                </div>
                <div>
                  <label className={labelStyle}>Telefone (SMS Entrega)</label>
                  <input 
                    required 
                    name="phone" 
                    value={formData.phone} // Adicionado value para máscara
                    onChange={handleChange} 
                    type="tel" 
                    className={inputStyle} 
                    placeholder="(11) 99999-9999" 
                    maxLength="15" 
                  />
                </div>
              </div>

              {/* Endereço Completo */}
              <div className="pt-4 border-t border-bs-border/30">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                      <label className={labelStyle}>CEP</label>
                      <div className="relative">
                        <input 
                          required 
                          name="cep" 
                          value={formData.cep} // Adicionado value para máscara
                          onChange={handleChange} 
                          onBlur={handleCepBlur} 
                          type="text" 
                          maxLength="9" 
                          className={inputStyle} 
                          placeholder="00000-000" 
                        />
                        {loadingCep && (
                          <div className="absolute right-3 top-3">
                            <Loader2 size={18} className="animate-spin text-bs-jade" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelStyle}>Rua / Logradouro</label>
                      <input 
                        required 
                        name="street" 
                        value={formData.street} 
                        onChange={handleChange} 
                        type="text" 
                        className={inputStyle} 
                      />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    <div>
                       <label className={labelStyle}>Número</label>
                       <input 
                        required 
                        id="numero-input" 
                        name="number" 
                        value={formData.number} 
                        onChange={handleChange} 
                        type="text" 
                        className={inputStyle} 
                      />
                    </div>
                    <div>
                       <label className={labelStyle}>Complemento</label>
                       <input 
                        name="complement" 
                        value={formData.complement} 
                        onChange={handleChange} 
                        type="text" 
                        className={inputStyle} 
                      />
                    </div>
                    <div>
                       <label className={labelStyle}>Bairro</label>
                       <input 
                        required 
                        name="district" 
                        value={formData.district} 
                        onChange={handleChange} 
                        type="text" 
                        className={inputStyle} 
                      />
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                       <label className={labelStyle}>Cidade</label>
                       <input 
                        required 
                        name="city" 
                        value={formData.city} 
                        onChange={handleChange} 
                        type="text" 
                        className={inputStyle} 
                      />
                    </div>
                    <div>
                       <label className={labelStyle}>UF</label>
                       <input 
                        required 
                        name="state" 
                        value={formData.state} 
                        onChange={handleChange} 
                        type="text" 
                        maxLength="2" 
                        className={inputStyle} 
                      />
                    </div>
                 </div>
              </div>

              {/* Rodapé do FORM */}
              <div className="pt-6 border-t border-bs-border">
                <h3 className="text-white font-tech text-lg mb-4 flex items-center gap-2">
                  <CreditCard size={20} /> PAGAMENTO
                </h3>
                <div className="bg-black p-4 border border-bs-border text-gray-500 text-sm font-mono text-center">
                  INTEGRAÇÃO PIX / BITCOIN EM BREVE.
                  <br/>
                  <span className="text-bs-jade">Por enquanto, o pedido será criado como PENDENTE.</span>
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading || cpfError} 
                className="w-full bg-bs-jade hover:bg-[#00ffa3]/90 text-black font-bold py-4 uppercase tracking-[0.2em] transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'CRIPTOGRAFANDO...' : 'CONFIRMAR PEDIDO'}
              </button>
            </form>
          </div>
        </div>

        {/* COLUNA 2: Resumo */}
        <div className="h-fit sticky top-24">
          <div className="bg-bs-card border border-bs-border p-6">
            <h3 className="text-white font-tech text-xl mb-6">RESUMO</h3>
            <div className="space-y-4 mb-6">
              {cartItems.map(item => (
                <div key={item.id} className="flex justify-between text-sm font-mono text-gray-400">
                  <span>{item.quantity}x {item.nome}</span>
                  <span className="text-white">R$ {(item.preco_venda * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-bs-border pt-4 flex justify-between items-center">
              <span className="text-white font-bold">TOTAL</span>
              <span className="text-bs-jade text-xl font-mono">R$ {cartTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-600 text-xs font-mono">
            <Truck size={14} /> Envios via Carrier
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;