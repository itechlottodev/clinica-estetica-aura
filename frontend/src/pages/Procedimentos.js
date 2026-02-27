import api from '../utils/api.js';
import Toast from '../components/Toast.js';
import Modal from '../components/Modal.js';
import { formatCurrency } from '../utils/format.js';

export default {
  data: {
    procedimentos: [],
    searchTerm: ''
  },

  async render() {
    return `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 class="text-3xl font-playfair text-aura-neutral">Procedimentos</h1>
          <button id="btn-novo-procedimento" class="aura-btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Novo Procedimento
          </button>
        </div>

        <div class="aura-card">
          <div class="mb-4">
            <input 
              type="text" 
              id="search-procedimentos" 
              placeholder="Buscar procedimentos..." 
              class="aura-input"
            >
          </div>

          <div id="procedimentos-list" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div class="text-center py-8 text-gray-500 col-span-full">Carregando...</div>
          </div>
        </div>
      </div>

      <div id="modal-container"></div>
    `;
  },

  async afterRender() {
    await this.loadProcedimentos();
    this.setupEventListeners();
  },

  setupEventListeners() {
    document.getElementById('btn-novo-procedimento').addEventListener('click', () => {
      this.showModal();
    });

    document.getElementById('search-procedimentos').addEventListener('input', (e) => {
      this.data.searchTerm = e.target.value;
      this.loadProcedimentos();
    });
  },

  async loadProcedimentos() {
    try {
      const params = this.data.searchTerm ? `?search=${this.data.searchTerm}` : '';
      const response = await api.get(`/procedimentos${params}`);
      this.data.procedimentos = response.data;
      this.renderProcedimentos();
    } catch (error) {
      Toast.error('Erro ao carregar procedimentos: ' + error.message);
    }
  },

  renderProcedimentos() {
    const container = document.getElementById('procedimentos-list');
    
    if (this.data.procedimentos.length === 0) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500 col-span-full">Nenhum procedimento encontrado</div>';
      return;
    }

    const html = this.data.procedimentos.map(proc => `
      <div class="bg-white border border-aura-beige rounded-lg p-4 hover:shadow-md transition-shadow">
        <div class="flex justify-between items-start mb-3">
          <h3 class="font-medium text-aura-neutral text-lg">${proc.nome}</h3>
          <span class="px-2 py-1 bg-aura-lightpink/20 text-aura-neutral text-xs rounded-full">${proc.categoria || 'Geral'}</span>
        </div>
        
        ${proc.descricao ? `<p class="text-sm text-gray-600 mb-3">${proc.descricao}</p>` : ''}
        
        <div class="flex items-center justify-between text-sm text-gray-600 mb-3">
          <span>${proc.duracao_minutos ? `${proc.duracao_minutos} min` : 'Sem duração'}</span>
          <span class="text-lg font-bold text-green-600">${formatCurrency(proc.valor)}</span>
        </div>
        
        <div class="flex gap-2">
          <button class="btn-editar flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm" data-id="${proc.id}">
            Editar
          </button>
          <button class="btn-excluir flex-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm" data-id="${proc.id}">
            Excluir
          </button>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;

    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const procedimento = this.data.procedimentos.find(p => p.id == id);
        this.showModal(procedimento);
      });
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.deleteProcedimento(id);
      });
    });
  },

  showModal(procedimento = null) {
    const isEdit = !!procedimento;
    const title = isEdit ? 'Editar Procedimento' : 'Novo Procedimento';

    const categorias = ['Facial', 'Corporal', 'Sobrancelhas', 'Maquiagem', 'Outro'];

    const content = `
      <form id="form-procedimento" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <input type="text" id="nome" class="aura-input" value="${procedimento?.nome || ''}" required>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select id="categoria" class="aura-input">
              <option value="">Selecione</option>
              ${categorias.map(cat => `
                <option value="${cat}" ${procedimento?.categoria === cat ? 'selected' : ''}>${cat}</option>
              `).join('')}
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Duração (minutos)</label>
            <input type="number" id="duracao_minutos" class="aura-input" value="${procedimento?.duracao_minutos || ''}" min="0">
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
          <input type="number" id="valor" class="aura-input" value="${procedimento?.valor || ''}" step="0.01" min="0" required>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea id="descricao" class="aura-input" rows="3">${procedimento?.descricao || ''}</textarea>
        </div>
      </form>
    `;

    const modal = new Modal(title, content, async () => {
      await this.saveProcedimento(procedimento?.id);
    });

    modal.show();
  },

  async saveProcedimento(id = null) {
    const dados = {
      nome: document.getElementById('nome').value,
      categoria: document.getElementById('categoria').value,
      duracao_minutos: document.getElementById('duracao_minutos').value || null,
      valor: parseFloat(document.getElementById('valor').value),
      descricao: document.getElementById('descricao').value
    };

    try {
      if (id) {
        await api.put(`/procedimentos/${id}`, dados);
        Toast.success('Procedimento atualizado com sucesso!');
      } else {
        await api.post('/procedimentos', dados);
        Toast.success('Procedimento cadastrado com sucesso!');
      }
      
      Modal.close();
      await this.loadProcedimentos();
    } catch (error) {
      Toast.error(error.message);
    }
  },

  async deleteProcedimento(id) {
    if (!confirm('Deseja realmente excluir este procedimento?')) return;

    try {
      await api.delete(`/procedimentos/${id}`);
      Toast.success('Procedimento excluído com sucesso!');
      await this.loadProcedimentos();
    } catch (error) {
      Toast.error(error.message);
    }
  }
};
