import api from '../utils/api.js';
import Toast from '../components/Toast.js';
import Modal from '../components/Modal.js';
import { Loading } from '../components/Loading.js';
import { formatDateTime } from '../utils/format.js';

export default {
  data: {
    agendamentos: [],
    pacientes: [],
    procedimentos: []
  },

  async render() {
    return `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 class="text-3xl font-playfair text-aura-neutral">Agendamentos</h1>
          <button id="btn-novo-agendamento" class="aura-btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Novo Agendamento
          </button>
        </div>

        <div class="aura-card">
          <div class="mb-4 flex gap-3">
            <input type="date" id="data-inicio" class="aura-input flex-1">
            <input type="date" id="data-fim" class="aura-input flex-1">
            <button id="btn-filtrar" class="aura-btn-secondary">Filtrar</button>
          </div>

          <div id="agendamentos-list" class="space-y-3">
            <div class="text-center py-8 text-gray-500">Carregando...</div>
          </div>
        </div>
      </div>

      <div id="modal-container"></div>
    `;
  },

  async afterRender() {
    window.agendamentosPage = this;
    await this.loadData();
    this.setupEventListeners();
  },

  setupEventListeners() {
    document.getElementById('btn-novo-agendamento').addEventListener('click', () => {
      this.showModal();
    });

    document.getElementById('btn-filtrar').addEventListener('click', () => {
      this.loadAgendamentos();
    });

    const hoje = new Date().toISOString().split('T')[0];
    const proximaSemana = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    document.getElementById('data-inicio').value = hoje;
    document.getElementById('data-fim').value = proximaSemana;
  },

  updateValorProcedimento() {
    const select = document.getElementById('procedimento_id');
    const selectedOption = select.options[select.selectedIndex];
    const valor = selectedOption?.dataset?.valor || 0;
    const infoDiv = document.getElementById('valor-procedimento-info');
    const valorInput = document.getElementById('valor_previsto');
    
    if (valor > 0) {
      infoDiv.innerHTML = `<span class="text-aura-lightpink font-medium">💰 Valor do procedimento: R$ ${parseFloat(valor).toFixed(2)}</span>`;
      if (!valorInput.value) {
        valorInput.value = parseFloat(valor).toFixed(2);
      }
    } else {
      infoDiv.innerHTML = '';
    }
  },

  async loadData() {
    try {
      const [pacientesRes, procedimentosRes] = await Promise.all([
        api.get('/pacientes?limit=1000'),
        api.get('/procedimentos?limit=1000')
      ]);
      
      this.data.pacientes = pacientesRes.data;
      this.data.procedimentos = procedimentosRes.data;
      
      await this.loadAgendamentos();
    } catch (error) {
      Toast.error('Erro ao carregar dados: ' + error.message);
    }
  },

  async loadAgendamentos() {
    try {
      const dataInicio = document.getElementById('data-inicio').value;
      const dataFim = document.getElementById('data-fim').value;
      
      let url = '/agendamentos';
      if (dataInicio && dataFim) {
        url += `?data_inicio=${dataInicio}&data_fim=${dataFim}`;
      }
      
      const response = await api.get(url);
      this.data.agendamentos = response.data;
      this.renderAgendamentos();
    } catch (error) {
      Toast.error('Erro ao carregar agendamentos: ' + error.message);
    }
  },

  renderAgendamentos() {
    const container = document.getElementById('agendamentos-list');
    
    if (this.data.agendamentos.length === 0) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500">Nenhum agendamento encontrado</div>';
      return;
    }

    const statusColors = {
      'agendado': 'bg-blue-100 text-blue-800',
      'confirmado': 'bg-green-100 text-green-800',
      'concluido': 'bg-gray-100 text-gray-800',
      'cancelado': 'bg-red-100 text-red-800'
    };

    const html = this.data.agendamentos.map(ag => `
      <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <div class="flex-shrink-0 w-16 text-center">
            <div class="text-2xl font-bold text-aura-neutral">${new Date(ag.data_hora).getDate()}</div>
            <div class="text-xs text-gray-600">${new Date(ag.data_hora).toLocaleDateString('pt-BR', { month: 'short' })}</div>
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-medium text-aura-neutral">${ag.paciente_nome}</h3>
            <p class="text-sm text-gray-600">${ag.procedimento_nome}</p>
            <div class="flex items-center gap-3 mt-1">
              <span class="text-xs text-gray-500">${formatDateTime(ag.data_hora)}</span>
              <span class="px-2 py-1 rounded-full text-xs ${statusColors[ag.status] || 'bg-gray-100 text-gray-800'}">${ag.status}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 flex-shrink-0">
          <button class="btn-editar p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" data-id="${ag.id}">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
          <button class="btn-excluir p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" data-id="${ag.id}">
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
        const agendamento = this.data.agendamentos.find(a => a.id == id);
        this.showModal(agendamento);
      });
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.deleteAgendamento(id);
      });
    });
  },

  showModal(agendamento = null) {
    const isEdit = !!agendamento;
    const title = isEdit ? 'Editar Agendamento' : 'Novo Agendamento';

    let dataValue = '';
    let horaValue = '';
    
    if (agendamento?.data_hora) {
      const dt = new Date(agendamento.data_hora);
      dataValue = dt.toISOString().slice(0, 10);
      horaValue = dt.toTimeString().slice(0, 5);
    }

    const content = `
      <form id="form-agendamento" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
          <select id="paciente_id" class="aura-input" required>
            <option value="">Selecione um paciente</option>
            ${this.data.pacientes.map(p => `
              <option value="${p.id}" ${agendamento?.paciente_id == p.id ? 'selected' : ''}>${p.nome}</option>
            `).join('')}
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Procedimento *</label>
          <select id="procedimento_id" class="aura-input" required onchange="window.agendamentosPage.updateValorProcedimento()">
            <option value="">Selecione um procedimento</option>
            ${this.data.procedimentos.map(p => {
              const valor = parseFloat(p.valor) || 0;
              return `<option value="${p.id}" data-valor="${valor}" ${agendamento?.procedimento_id == p.id ? 'selected' : ''}>${p.nome} - ${p.duracao_minutos || 0} min - R$ ${valor.toFixed(2)}</option>`;
            }).join('')}
          </select>
          <div id="valor-procedimento-info" class="mt-2 text-sm text-gray-600"></div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Valor Previsto <span class="text-xs text-gray-500">(opcional)</span></label>
          <input type="number" id="valor_previsto" class="aura-input" step="0.01" min="0" placeholder="0.00" value="${agendamento?.valor_previsto || ''}">
          <p class="mt-1 text-xs text-gray-500">Deixe em branco para usar o valor padrão do procedimento</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data *</label>
            <input type="date" id="data" class="aura-input" value="${dataValue}" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Hora * <span class="text-xs text-gray-500">(ex: 12:30)</span></label>
            <input type="time" id="hora" class="aura-input" value="${horaValue}" placeholder="12:30" required>
          </div>
        </div>
        
        ${isEdit ? `
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select id="status" class="aura-input">
            <option value="agendado" ${agendamento?.status === 'agendado' ? 'selected' : ''}>Agendado</option>
            <option value="confirmado" ${agendamento?.status === 'confirmado' ? 'selected' : ''}>Confirmado</option>
            <option value="concluido" ${agendamento?.status === 'concluido' ? 'selected' : ''}>Concluído</option>
            <option value="cancelado" ${agendamento?.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
          </select>
        </div>
        ` : ''}
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea id="observacoes" class="aura-input" rows="3">${agendamento?.observacoes || ''}</textarea>
        </div>
      </form>
    `;

    const modal = new Modal(title, content, async () => {
      await this.saveAgendamento(agendamento?.id);
    });

    modal.show();
  },

  async saveAgendamento(id = null) {
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    const dataHora = `${data}T${hora}:00`;

    const valorPrevisto = document.getElementById('valor_previsto').value;
    
    const dados = {
      paciente_id: parseInt(document.getElementById('paciente_id').value),
      procedimento_id: parseInt(document.getElementById('procedimento_id').value),
      data_hora: dataHora,
      valor_previsto: valorPrevisto ? parseFloat(valorPrevisto) : null,
      observacoes: document.getElementById('observacoes').value
    };

    if (id) {
      dados.status = document.getElementById('status').value;
    }

    Loading.show();
    try {
      if (id) {
        await api.put(`/agendamentos/${id}`, dados);
        Toast.success('Agendamento atualizado com sucesso!');
      } else {
        await api.post('/agendamentos', dados);
        Toast.success('Agendamento criado com sucesso!');
      }
      
      Modal.close();
      
      // Recarregar a lista de agendamentos
      await this.loadAgendamentos();
    } catch (error) {
      Toast.error(error.message);
    } finally {
      Loading.hide();
    }
  },

  async deleteAgendamento(id) {
    if (!confirm('Deseja realmente excluir este agendamento?')) return;

    Loading.show();
    try {
      await api.delete(`/agendamentos/${id}`);
      Toast.success('Agendamento excluído com sucesso!');
      
      // Recarregar a lista de agendamentos
      await this.loadAgendamentos();
    } catch (error) {
      Toast.error(error.message);
    } finally {
      Loading.hide();
    }
  }
};
