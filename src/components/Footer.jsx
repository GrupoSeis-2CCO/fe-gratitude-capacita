function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-white px-6 py-6 md:px-8 md:py-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center justify-between">
        <div className="flex-1 flex justify-center md:justify-start">
          <img src="/GratitudeLogo.svg" alt="Gratitude Logo" className="w-16 h-16 md:w-20 md:h-20" />
        </div>

        <div className="flex-1 flex flex-col items-center gap-2 text-center">
          <button className="font-inter font-extrabold text-base md:text-lg text-gray-300 hover:text-white">
            Gerenciar Cursos
          </button>
          <button className="font-inter font-extrabold text-base md:text-lg text-gray-300 hover:text-white">
            Historico de Acesso
          </button>
          <button className="font-inter font-extrabold text-base md:text-lg text-gray-300 hover:text-white">
            Cadastrar Usuario
          </button>
        </div>

        <div className="flex-1 text-center md:text-right space-y-1 text-sm md:text-base text-gray-300">
          <h3 className="font-inter font-bold text-lg md:text-xl text-gray-200 mb-1">Contato</h3>
          <p>Email: <span className="underline text-gray-200">gratitude@gratitudeservicos.com.br</span></p>
          <p>Telefone: <span className="text-gray-200">(11) 98222-1092</span></p>
          <p>Endereco: <span className="text-gray-200">Rua Riachuelo, 326 - SP</span></p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
