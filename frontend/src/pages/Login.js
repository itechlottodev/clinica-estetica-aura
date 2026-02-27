import { auth } from '../utils/auth.js';
import Toast from '../components/Toast.js';

export default {
  render() {
    return `
      <div class="min-h-screen flex items-center justify-center" style="background-color: #f5f0eb;">
        <div class="w-full max-w-6xl mx-4 flex rounded-3xl overflow-hidden shadow-2xl bg-white" style="min-height: 600px;">
          
          <!-- Lado Esquerdo - Formulário -->
          <div class="w-full lg:w-1/2 p-12 flex flex-col justify-center">
            <div class="mb-8">
              <h1 class="text-4xl font-playfair text-gray-800 mb-2">Bem-vindo de volta</h1>
              <p class="text-gray-600">Entre com seus dados para acessar sua conta</p>
            </div>

            <!-- Form Login -->
            <form id="form-login" class="space-y-5">
              <div>
                <label class="block text-sm font-medium text-gray-800 mb-2">Email</label>
                <input 
                  type="email" 
                  id="login-email" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aura-lightpink focus:border-transparent transition-all"
                  placeholder="seu@email.com"
                  required
                >
              </div>
              
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="block text-sm font-medium text-gray-800">Senha</label>
                  <a href="#" class="text-sm text-gray-600 hover:text-aura-lightpink transition-colors">Esqueceu a senha?</a>
                </div>
                <input 
                  type="password" 
                  id="login-senha" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aura-lightpink focus:border-transparent transition-all"
                  placeholder="••••••"
                  required
                >
              </div>

              <div class="flex items-center">
                <input 
                  type="checkbox" 
                  id="lembrar-me" 
                  class="w-4 h-4 text-aura-lightpink border-gray-300 rounded focus:ring-aura-lightpink"
                >
                <label for="lembrar-me" class="ml-2 text-sm text-gray-700">Lembrar-me</label>
              </div>

              <button 
                type="submit" 
                class="w-full py-3 rounded-lg font-medium transition-all"
                style="background-color: #F5B5C1; color: #6B4E3D;"
              >
                Entrar
              </button>

              <div class="text-center mt-6">
                <span class="text-gray-600">Não possui uma conta? </span>
                <button 
                  type="button"
                  id="btn-mostrar-cadastro" 
                  class="font-semibold text-gray-800 hover:text-aura-lightpink transition-colors"
                >
                  Registre-se
                </button>
              </div>
            </form>

            <!-- Form Cadastro -->
            <form id="form-cadastro" class="space-y-4 hidden">
              <div class="mb-6">
                <h1 class="text-4xl font-playfair text-gray-800 mb-2">Criar conta</h1>
                <p class="text-gray-600">Preencha os dados para criar sua conta</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-800 mb-2">Nome da Clínica</label>
                <input 
                  type="text" 
                  id="cadastro-empresa" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aura-lightpink focus:border-transparent"
                  required
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-800 mb-2">Seu Nome</label>
                <input 
                  type="text" 
                  id="cadastro-nome" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aura-lightpink focus:border-transparent"
                  required
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-800 mb-2">Email</label>
                <input 
                  type="email" 
                  id="cadastro-email" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aura-lightpink focus:border-transparent"
                  required
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-800 mb-2">Telefone</label>
                <input 
                  type="tel" 
                  id="cadastro-telefone" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aura-lightpink focus:border-transparent"
                  placeholder="(00) 00000-0000"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-800 mb-2">Senha</label>
                <input 
                  type="password" 
                  id="cadastro-senha" 
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-aura-lightpink focus:border-transparent"
                  required 
                  minlength="6"
                >
              </div>

              <button 
                type="submit" 
                class="w-full py-3 rounded-lg font-medium transition-all"
                style="background-color: #F5B5C1; color: #6B4E3D;"
              >
                Criar Conta
              </button>

              <div class="text-center mt-4">
                <span class="text-gray-600">Já possui uma conta? </span>
                <button 
                  type="button"
                  id="btn-mostrar-login" 
                  class="font-semibold text-gray-800 hover:text-aura-lightpink transition-colors"
                >
                  Entrar
                </button>
              </div>
            </form>
          </div>

          <!-- Lado Direito - Imagem/Card -->
          <div class="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12" style="background: linear-gradient(135deg, #d4a5a5 0%, #e8c4b8 100%);">
            <div class="absolute inset-0 opacity-20" style="background-image: url('/Fundo.png'); background-size: cover; background-position: center;"></div>
            
            <div class="relative z-10 text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
              <h2 class="text-4xl font-playfair text-gray-800 mb-4">Aura</h2>
              <p class="text-gray-700 text-lg">Sistema de gerenciamento para<br>clínicas estéticas</p>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  afterRender() {
    const formLogin = document.getElementById('form-login');
    const formCadastro = document.getElementById('form-cadastro');
    const btnMostrarCadastro = document.getElementById('btn-mostrar-cadastro');
    const btnMostrarLogin = document.getElementById('btn-mostrar-login');

    btnMostrarCadastro.addEventListener('click', () => {
      formLogin.classList.add('hidden');
      formCadastro.classList.remove('hidden');
    });

    btnMostrarLogin.addEventListener('click', () => {
      formCadastro.classList.add('hidden');
      formLogin.classList.remove('hidden');
    });

    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const senha = document.getElementById('login-senha').value;

      try {
        await auth.login(email, senha);
        Toast.success('Login realizado com sucesso!');
        window.location.hash = '#/dashboard';
      } catch (error) {
        Toast.error(error.message);
      }
    });

    formCadastro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dados = {
        nomeEmpresa: document.getElementById('cadastro-empresa').value,
        nomeUsuario: document.getElementById('cadastro-nome').value,
        email: document.getElementById('cadastro-email').value,
        telefone: document.getElementById('cadastro-telefone').value,
        senha: document.getElementById('cadastro-senha').value
      };

      try {
        await auth.cadastro(dados);
        Toast.success('Conta criada com sucesso!');
        window.location.hash = '#/dashboard';
      } catch (error) {
        Toast.error(error.message);
      }
    });
  }
};
