function Footer() {
  return (
    <footer className="w-full h-27 bg-gray-800 flex justify-between items-start px-8">

      {/* Logo */}
      <div className="pt-5 flex-1 flex justify-start">
        <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center text-gray-400 text-xs font-medium">
          LOGO
        </div>
      </div>

      {/* Botões */}
      <div className="flex-1 flex flex-col items-center space-y-3">
        <button className="font-inter font-extrabold text-lg text-gray-400 hover:text-white">
          Gerenciar Cursos
        </button>
        <button className="font-inter font-extrabold text-lg text-gray-400 hover:text-white">
          Histórico de Acesso
        </button>
        <button className="font-inter font-extrabold text-lg text-gray-400 hover:text-white">
          Cadastrar Usuário
        </button>
      </div>

      {/* Contato */}
      <div className="flex-1 text-right">
        <h3 className="font-inter font-bold text-xl text-gray-400 mb-3">Contato</h3>
        <p className="text-sm text-gray-300 mb-1">Email: <span className="underline text-gray-400">gratitude@gratitudeservicos.com.br</span></p>
        <p className="text-sm text-gray-300 mb-1">Telefone: <span className="text-gray-400">(11) 98222-1092</span></p>
        <p className="text-sm text-gray-300">Endereço: <span className="text-gray-400">Rua Riachuelo, 326 - Sé, São Paulo - SP</span></p>
      </div>

    </footer>
  );
}

export default Footer;
