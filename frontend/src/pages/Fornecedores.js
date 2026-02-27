import api from '../utils/api.js';
import Toast from '../components/Toast.js';
import Modal from '../components/Modal.js';
import { formatCNPJ, formatPhone } from '../utils/format.js';

export default {
  data: {
    fornecedores: []
  },

  async render() {
    return `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 class="text-3xl font-playfair text-aura-neutral">Fornecedores</h1>
          <button id="btn-novo-fornecedor" class="aura-btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Novo Fornecedor
          </button>
        </div>

        <div class="aura-card">
          <div id="fornecedores-list" class="space-y-3">
            <div class="text-center py-8 text-gray-500">Carregando...</div>
          </div>
        </div>
      </div>

      <div id="modal-container"></div>
    `;
  },

  async afterRender() {
    await this.loadFornecedores();
    this.setupEventListeners();
  },

  setupEventListeners() {
    document.getElementById('btn-novo-fornecedor').addEventListener('click', () => {
      this.showModal();
    });
  },

  async loadFornecedores() {
    try {
      const response = await api.get('/fornecedores');
      this.data.fornecedores = response.data;
      this.renderFornecedores();
    } catch (error) {
      Toast.error('Erro ao carregar fornecedores: ' + error.message);
    }
  },

  renderFornecedores() {
    const container = document.getElementById('fornecedores-list');
    
    if (this.data.fornecedores.length === 0) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500">Nenhum fornecedor encontrado</div>';
      return;
    }

    const html = this.data.fornecedores.map(forn => `
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <div class="flex-shrink-0 w-12 h-12 bg-aura-lightpink/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-aura-lightpink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-aura-neutral truncate">${forn.nome}</h3>
            ${forn.razao_social ? `<p class="text-sm text-gray-600 truncate">${forn.razao_social}</p>` : ''}
            <div class="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
              ${forn.cnpj ? `<span>${formatCNPJ(forn.cnpj)}</span>` : ''}
              ${forn.telefone ? `<span>${formatPhone(forn.telefone)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button class="btn-editar p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-id="${forn.id}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button class="btn-excluir p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-id="${forn.id}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
            </svg>
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;

    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const fornecedor = this.data.fornecedores.find(f => f.id == id);
        this.showModal(fornecedor);
      });
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.deleteFornecedor(id);
      });
    });
  },

  showModal(fornecedor = null) {
    const isEdit = !!fornecedor;
    const title = isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor';

    const content = `
      <form id="form-fornecedor" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" id="nome" class="aura-input" value="${fornecedor?.nome || ''}" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Razão Social</label>
            <input type="text" id="razao_social" class="aura-input" value="${fornecedor?.razao_social || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
            <input type="text" id="cnpj" class="aura-input" value="${fornecedor?.cnpj || ''}" placeholder="00.000.000/0000-00">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input type="tel" id="telefone" class="aura-input" value="${fornecedor?.telefone || ''}" placeholder="(00) 00000-0000">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" class="aura-input" value="${fornecedor?.email || ''}">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input type="text" id="endereco" class="aura-input" value="${fornecedor?.endereco || ''}">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea id="observacoes" class="aura-input" rows="3">${fornecedor?.observacoes || ''}</textarea>
          </div>
        </div>
      </form>
    `;

    const modal = new Modal(title, content, async () => {
      await this.saveFornecedor(fornecedor?.id);
    });

    modal.show();
  },

  async saveFornecedor(id = null) {
    const dados = {
      nome: document.getElementById('nome').value,
      razao_social: document.getElementById('razao_social').value,
      cnpj: document.getElementById('cnpj').value,
      telefone: document.getElementById('telefone').value,
      email: document.getElementById('email').value,
      endereco: document.getElementById('endereco').value,
      observacoes: document.getElementById('observacoes').value
    };

    try {
      if (id) {
        await api.put(`/fornecedores/${id}`, dados);
        Toast.success('Fornecedor atualizado com sucesso!');
      } else {
        await api.post('/fornecedores', dados);
        Toast.success('Fornecedor cadastrado com sucesso!');
      }
      
      Modal.close();
      await this.loadFornecedores();
    } catch (error) {
      Toast.error(error.message);
    }
  },

  async deleteFornecedor(id) {
    if (!confirm('Deseja realmente excluir este fornecedor?')) return;

    try {
      await api.delete(`/fornecedores/${id}`);
      Toast.success('Fornecedor excluído com sucesso!');
      await this.loadFornecedores();
    } catch (error) {
      Toast.error(error.message);
    }
  }
};
