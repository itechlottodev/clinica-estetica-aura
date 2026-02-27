import { auth } from '../utils/auth.js';

export default {
  render(content) {
    const user = auth.getUser();
    const empresa = auth.getEmpresa();

    return `
      <div class="flex flex-col lg:flex-row h-screen bg-gray-50">
        <!-- Header Mobile -->
        <header class="lg:hidden bg-gradient-to-r from-aura-lightpink to-[#FFC2B4] p-4 shadow-md">
          <h1 class="text-xl font-playfair text-aura-neutral">${empresa?.nome || 'Clínica'}</h1>
          <p class="text-sm text-aura-neutral/70">${user?.nome || ''}</p>
        </header>

        <!-- Sidebar Desktop -->
        <aside class="hidden lg:flex lg:flex-col w-64 bg-gradient-to-b from-aura-neutral to-[#5a3d2e] text-white">
          <div class="p-6 border-b border-white/10">
            <h1 class="text-2xl font-playfair">${empresa?.nome || 'Clínica'}</h1>
            <p class="text-sm text-white/70 mt-1">${user?.nome || ''}</p>
          </div>
          
          <nav class="flex-1 p-4 space-y-2">
            <a href="#/dashboard" class="nav-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
              </svg>
              <span>Dashboard</span>
            </a>
            
            <a href="#/pacientes" class="nav-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <span>Pacientes</span>
            </a>
            
            <a href="#/agendamentos" class="nav-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
              <span>Agendamentos</span>
            </a>
            
            <a href="#/procedimentos" class="nav-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
              <span>Procedimentos</span>
            </a>
            
            <a href="#/produtos" class="nav-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <span>Produtos</span>
            </a>
            
            <a href="#/fornecedores" class="nav-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
              </svg>
              <span>Fornecedores</span>
            </a>
            
            <a href="#/financeiro" class="nav-link">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <span>Financeiro</span>
            </a>
          </nav>
          
          <div class="p-4 border-t border-white/10">
            <button id="btn-logout" class="w-full flex items-center gap-3 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
              <span>Sair</span>
            </button>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 overflow-y-auto pb-16 lg:pb-0">
          <div class="aura-container py-8">
            ${content}
          </div>
        </main>

        <!-- Bottom Navigation Mobile -->
        <nav class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-aura-lightpink shadow-lg flex justify-around py-3 z-50">
          <a href="#/dashboard" class="nav-link-mobile">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span class="text-xs">Home</span>
          </a>
          <a href="#/pacientes" class="nav-link-mobile">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <span class="text-xs">Pacientes</span>
          </a>
          <a href="#/agendamentos" class="nav-link-mobile">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <span class="text-xs">Agenda</span>
          </a>
          <a href="#/financeiro" class="nav-link-mobile">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="text-xs">Financeiro</span>
          </a>
        </nav>
      </div>

      <div id="modal-container"></div>

      <style>
        .nav-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          color: rgba(255, 255, 255, 0.8);
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        .nav-link:hover, .nav-link.active {
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .nav-link-mobile {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
          padding: 0.5rem;
          color: #6B4E3D;
          transition: all 0.2s;
          min-width: 70px;
        }
        .nav-link-mobile.active {
          color: #F5B5C1;
          font-weight: 600;
        }
        .nav-link-mobile:hover {
          color: #F5B5C1;
        }
      </style>
    `;
  },

  afterRender() {
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Deseja realmente sair?')) {
          auth.logout();
        }
      });
    }

    this.highlightActiveLink();
  },

  highlightActiveLink() {
    const hash = window.location.hash;
    document.querySelectorAll('.nav-link, .nav-link-mobile').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === hash) {
        link.classList.add('active');
      }
    });
  }
};
