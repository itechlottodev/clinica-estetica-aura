import api from '../utils/api.js';
import Toast from '../components/Toast.js';
import Modal from '../components/Modal.js';
import { Loading } from '../components/Loading.js';
import { formatCPF, formatPhone } from '../utils/format.js';

export default {
  data: {
    pacientes: [],
    searchTerm: ''
  },

  async render() {
    return `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 class="text-3xl font-playfair text-aura-neutral">Pacientes</h1>
          <button id="btn-novo-paciente" class="aura-btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Novo Paciente
          </button>
        </div>

        <div class="aura-card">
          <div class="mb-4">
            <input 
              type="text" 
              id="search-pacientes" 
              placeholder="Buscar por nome, CPF ou telefone..." 
              class="aura-input"
            >
          </div>

          <div id="pacientes-list" class="space-y-3">
            <div class="text-center py-8 text-gray-500">Carregando...</div>
          </div>
        </div>
      </div>

      <div id="modal-container"></div>
    `;
  },

  async afterRender() {
    await this.loadPacientes();
    this.setupEventListeners();
  },

  setupEventListeners() {
    document.getElementById('btn-novo-paciente').addEventListener('click', () => {
      this.showModal();
    });

    document.getElementById('search-pacientes').addEventListener('input', (e) => {
      this.data.searchTerm = e.target.value;
      this.loadPacientes();
    });
  },

  async loadPacientes() {
    try {
      const params = this.data.searchTerm ? `?search=${this.data.searchTerm}` : '';
      const response = await api.get(`/pacientes${params}`);
      this.data.pacientes = response.data;
      this.renderPacientes();
    } catch (error) {
      Toast.error('Erro ao carregar pacientes: ' + error.message);
    }
  },

  renderPacientes() {
    const container = document.getElementById('pacientes-list');
    
    if (this.data.pacientes.length === 0) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500">Nenhum paciente encontrado</div>';
      return;
    }

    const html = this.data.pacientes.map(paciente => `
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <div class="flex-shrink-0 w-12 h-12 bg-aura-lightpink/20 rounded-full flex items-center justify-center">
            <svg class="w-6 h-6 text-aura-lightpink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-aura-neutral truncate">${paciente.nome}</h3>
            <div class="flex flex-wrap gap-3 text-sm text-gray-600 mt-1">
              ${paciente.telefone ? `<span>${formatPhone(paciente.telefone)}</span>` : ''}
              ${paciente.cpf ? `<span>${formatCPF(paciente.cpf)}</span>` : ''}
              ${paciente.email ? `<span class="truncate">${paciente.email}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button class="btn-editar p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-id="${paciente.id}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button class="btn-excluir p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-id="${paciente.id}">
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
        const paciente = this.data.pacientes.find(p => p.id == id);
        this.showModal(paciente);
      });
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.deletePaciente(id);
      });
    });
  },

  showModal(paciente = null) {
    const isEdit = !!paciente;
    const title = isEdit ? 'Editar Paciente' : 'Novo Paciente';

    const content = `
      <form id="form-paciente" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" id="nome" class="aura-input" value="${paciente?.nome || ''}" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" class="aura-input" value="${paciente?.email || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input type="tel" id="telefone" class="aura-input" value="${paciente?.telefone || ''}" placeholder="(00) 00000-0000">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <input type="text" id="cpf" class="aura-input" value="${paciente?.cpf || ''}" placeholder="000.000.000-00">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
            <input type="text" id="cnpj" class="aura-input" value="${paciente?.cnpj || ''}" placeholder="00.000.000/0000-00">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
            <input type="date" id="data_nascimento" class="aura-input" value="${paciente?.data_nascimento || ''}">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Gênero</label>
            <select id="genero" class="aura-input">
              <option value="">Selecione</option>
              <option value="Feminino" ${paciente?.genero === 'Feminino' ? 'selected' : ''}>Feminino</option>
              <option value="Masculino" ${paciente?.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
              <option value="Outro" ${paciente?.genero === 'Outro' ? 'selected' : ''}>Outro</option>
            </select>
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
            <input type="text" id="endereco" class="aura-input" value="${paciente?.endereco || ''}">
          </div>
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea id="observacoes" class="aura-input" rows="3">${paciente?.observacoes || ''}</textarea>
          </div>
        </div>
      </form>
    `;

    const modal = new Modal(title, content, async () => {
      await this.savePaciente(paciente?.id);
    });

    modal.show();
  },

  async savePaciente(id = null) {
    const dados = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      telefone: document.getElementById('telefone').value,
      cpf: document.getElementById('cpf').value,
      cnpj: document.getElementById('cnpj').value,
      data_nascimento: document.getElementById('data_nascimento').value || null,
      genero: document.getElementById('genero').value,
      endereco: document.getElementById('endereco').value,
      observacoes: document.getElementById('observacoes').value
    };

    Loading.show();
    try {
      if (id) {
        await api.put(`/pacientes/${id}`, dados);
        Toast.success('Paciente atualizado com sucesso!');
      } else {
        await api.post('/pacientes', dados);
        Toast.success('Paciente cadastrado com sucesso!');
      }
      
      Modal.close();
      await this.loadPacientes();
    } catch (error) {
      Toast.error(error.message);
    } finally {
      Loading.hide();
    }
  },

  async deletePaciente(id) {
    if (!confirm('Deseja realmente excluir este paciente?')) return;

    Loading.show();
    try {
      await api.delete(`/pacientes/${id}`);
      Toast.success('Paciente excluído com sucesso!');
      await this.loadPacientes();
    } catch (error) {
      Toast.error(error.message);
    } finally {
      Loading.hide();
    }
  }
};
