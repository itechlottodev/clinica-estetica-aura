import './style.css';
import { auth } from './utils/auth.js';
import Layout from './components/Layout.js';

import Login from './pages/Login.js';
import Dashboard from './pages/Dashboard.js';
import Pacientes from './pages/Pacientes.js';
import Procedimentos from './pages/Procedimentos.js';
import Agendamentos from './pages/Agendamentos.js';
import Produtos from './pages/Produtos.js';
import Fornecedores from './pages/Fornecedores.js';
import Financeiro from './pages/Financeiro.js';

const routes = {
  '/login': Login,
  '/dashboard': Dashboard,
  '/pacientes': Pacientes,
  '/procedimentos': Procedimentos,
  '/agendamentos': Agendamentos,
  '/produtos': Produtos,
  '/fornecedores': Fornecedores,
  '/financeiro': Financeiro
};

class Router {
  constructor() {
    this.currentPage = null;
    window.addEventListener('hashchange', () => this.loadRoute());
    window.addEventListener('load', () => this.loadRoute());
  }

  async loadRoute() {
    let path = window.location.hash.slice(1) || '/dashboard';

    if (!auth.isAuthenticated() && path !== '/login') {
      window.location.hash = '#/login';
      return;
    }

    if (auth.isAuthenticated() && path === '/login') {
      window.location.hash = '#/dashboard';
      return;
    }

    const page = routes[path];
    
    if (!page) {
      window.location.hash = '#/dashboard';
      return;
    }

    this.currentPage = page;

    try {
      const content = await page.render();
      
      const app = document.getElementById('app');
      
      if (path === '/login') {
        app.innerHTML = content;
      } else {
        app.innerHTML = Layout.render(content);
        Layout.afterRender();
      }

      if (page.afterRender) {
        await page.afterRender();
      }
    } catch (error) {
      console.error('Erro ao carregar página:', error);
      document.getElementById('app').innerHTML = `
        <div class="min-h-screen flex items-center justify-center">
          <div class="text-center">
            <h1 class="text-2xl font-bold text-red-600 mb-4">Erro ao carregar página</h1>
            <p class="text-gray-600">${error.message}</p>
            <button onclick="window.location.reload()" class="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg">
              Recarregar
            </button>
          </div>
        </div>
      `;
    }
  }
}

new Router();
