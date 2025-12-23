import React from 'react';

const Contact = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white" style={{ fontFamily: 'Rigid Square' }}>
        Canal de Contato
      </h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Para questões sobre soberania, suporte técnico da Jade Wallet ou dúvidas sobre envios.
        </p>

        <div className="space-y-4">
          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded">
            <span className="text-2xl mr-4">📧</span>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">E-mail Geral</h3>
              <p className="text-indigo-600 dark:text-indigo-400">contato@jadewallet.com.br</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-900 rounded">
            <span className="text-2xl mr-4">📦</span>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-white">Dúvidas de Envio</h3>
              <p className="text-indigo-600 dark:text-indigo-400">rastreio@jadewallet.com.br</p>
            </div>
          </div>
        </div>

        {/* Formulário Simples (Visual) */}
        <form className="mt-8 space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Seu E-mail</label>
                <input type="email" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2" placeholder="email@seguro.com" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Mensagem</label>
                <textarea rows="4" className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2"></textarea>
            </div>
            <button type="button" className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 transition">
                Enviar Mensagem
            </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;