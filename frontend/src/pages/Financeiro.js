import api from '../utils/api.js';
import Toast from '../components/Toast.js';
import Modal from '../components/Modal.js';
import { formatCurrency, formatDate } from '../utils/format.js';

export default {
  data: {
    contasReceber: [],
    contasPagar: [],
    formasPagamento: [],
    activeTab: 'receber'
  },

  async render() {
    return `
      <div class="space-y-6">
        <h1 class="text-3xl font-playfair text-aura-neutral">Financeiro</h1>

        <div class="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button id="tab-receber" class="tab-btn active flex-1 py-2 rounded-md transition-all">Contas a Receber</button>
          <button id="tab-pagar" class="tab-btn flex-1 py-2 rounded-md transition-all">Contas a Pagar</button>
        </div>

        <!-- Contas a Receber -->
        <div id="content-receber" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="aura-card bg-green-50">
              <p class="text-sm text-gray-600 mb-1">Total a Receber</p>
              <p id="total-receber" class="text-2xl font-bold text-green-600">R$ 0,00</p>
            </div>
            <div class="aura-card bg-blue-50">
              <p class="text-sm text-gray-600 mb-1">Recebido</p>
              <p id="recebido" class="text-2xl font-bold text-blue-600">R$ 0,00</p>
            </div>
            <div class="aura-card bg-yellow-50">
              <p class="text-sm text-gray-600 mb-1">Pendente</p>
              <p id="pendente-receber" class="text-2xl font-bold text-yellow-600">R$ 0,00</p>
            </div>
          </div>

          <div class="aura-card">
            <div id="lista-receber" class="overflow-x-auto">
              <div class="text-center py-8 text-gray-500">Carregando...</div>
            </div>
          </div>
        </div>

        <!-- Contas a Pagar -->
        <div id="content-pagar" class="space-y-4 hidden">
          <div class="flex justify-between items-center">
            <div></div>
            <button id="btn-nova-conta-pagar" class="aura-btn-primary">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
              </svg>
              Nova Conta a Pagar
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="aura-card bg-red-50">
              <p class="text-sm text-gray-600 mb-1">Total a Pagar</p>
              <p id="total-pagar" class="text-2xl font-bold text-red-600">R$ 0,00</p>
            </div>
            <div class="aura-card bg-blue-50">
              <p class="text-sm text-gray-600 mb-1">Pago</p>
              <p id="pago" class="text-2xl font-bold text-blue-600">R$ 0,00</p>
            </div>
            <div class="aura-card bg-yellow-50">
              <p class="text-sm text-gray-600 mb-1">Pendente</p>
              <p id="pendente-pagar" class="text-2xl font-bold text-yellow-600">R$ 0,00</p>
            </div>
          </div>

          <div class="aura-card">
            <div id="lista-pagar" class="overflow-x-auto">
              <div class="text-center py-8 text-gray-500">Carregando...</div>
            </div>
          </div>
        </div>
      </div>

      <div id="modal-container"></div>

      <style>
        .tab-btn {
          font-weight: 500;
          color: #6B7280;
        }
        .tab-btn.active {
          background: linear-gradient(to right, #F5B5C1, #FFC2B4);
          color: #6B4E3D;
          font-weight: 600;
        }
      </style>
    `;
  },

  async afterRender() {
    await this.loadData();
    this.setupEventListeners();
  },

  setupEventListeners() {
    const tabReceber = document.getElementById('tab-receber');
    const tabPagar = document.getElementById('tab-pagar');
    const contentReceber = document.getElementById('content-receber');
    const contentPagar = document.getElementById('content-pagar');

    tabReceber.addEventListener('click', () => {
      this.data.activeTab = 'receber';
      tabReceber.classList.add('active');
      tabPagar.classList.remove('active');
      contentReceber.classList.remove('hidden');
      contentPagar.classList.add('hidden');
    });

    tabPagar.addEventListener('click', () => {
      this.data.activeTab = 'pagar';
      tabPagar.classList.add('active');
      tabReceber.classList.remove('active');
      contentPagar.classList.remove('hidden');
      contentReceber.classList.add('hidden');
    });

    document.getElementById('btn-nova-conta-pagar')?.addEventListener('click', () => {
      this.showModalContaPagar();
    });
  },

  async loadData() {
    try {
      const [receberRes, pagarRes, formasRes] = await Promise.all([
        api.get('/financeiro/contas-receber'),
        api.get('/financeiro/contas-pagar'),
        api.get('/financeiro/formas-pagamento')
      ]);

      this.data.contasReceber = receberRes.data;
      this.data.contasPagar = pagarRes.data;
      this.data.formasPagamento = formasRes.data;

      this.renderContasReceber();
      this.renderContasPagar();
    } catch (error) {
      Toast.error('Erro ao carregar dados financeiros: ' + error.message);
    }
  },

  renderContasReceber() {
    const container = document.getElementById('lista-receber');
    
    if (this.data.contasReceber.length === 0) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500">Nenhuma conta a receber</div>';
      return;
    }

    let totalReceber = 0;
    let totalRecebido = 0;
    let totalPendente = 0;

    this.data.contasReceber.forEach(conta => {
      const valor = parseFloat(conta.valor);
      const valorPago = parseFloat(conta.valor_pago);
      totalReceber += valor;
      totalRecebido += valorPago;
      if (conta.status !== 'pago') {
        totalPendente += (valor - valorPago);
      }
    });

    document.getElementById('total-receber').textContent = formatCurrency(totalReceber);
    document.getElementById('recebido').textContent = formatCurrency(totalRecebido);
    document.getElementById('pendente-receber').textContent = formatCurrency(totalPendente);

    const statusColors = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'parcial': 'bg-blue-100 text-blue-800',
      'pago': 'bg-green-100 text-green-800'
    };

    const html = `
      <table class="w-full">
        <thead class="bg-aura-softgray">
          <tr>
            <th class="financial-table-header text-left">Descrição</th>
            <th class="financial-table-header text-left">Paciente</th>
            <th class="financial-table-header text-center">Vencimento</th>
            <th class="financial-table-header text-right">Valor</th>
            <th class="financial-table-header text-right">Pago</th>
            <th class="financial-table-header text-center">Status</th>
            <th class="financial-table-header text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${this.data.contasReceber.map(conta => `
            <tr class="hover:bg-gray-50">
              <td class="financial-table-cell">${conta.descricao}</td>
              <td class="financial-table-cell">${conta.paciente_nome || '-'}</td>
              <td class="financial-table-cell text-center">${formatDate(conta.data_vencimento)}</td>
              <td class="financial-table-cell text-right font-medium">${formatCurrency(conta.valor)}</td>
              <td class="financial-table-cell text-right">${formatCurrency(conta.valor_pago)}</td>
              <td class="financial-table-cell text-center">
                <span class="px-2 py-1 rounded-full text-xs ${statusColors[conta.status] || 'bg-gray-100 text-gray-800'}">${conta.status}</span>
              </td>
              <td class="financial-table-cell text-center">
                ${conta.status !== 'pago' ? `
                  <button class="btn-receber px-3 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100 text-sm" data-id="${conta.id}">
                    Receber
                  </button>
                ` : '-'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = html;

    document.querySelectorAll('.btn-receber').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const conta = this.data.contasReceber.find(c => c.id == id);
        this.showModalReceber(conta);
      });
    });
  },

  renderContasPagar() {
    const container = document.getElementById('lista-pagar');
    
    if (this.data.contasPagar.length === 0) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500">Nenhuma conta a pagar</div>';
      return;
    }

    let totalPagar = 0;
    let totalPago = 0;
    let totalPendente = 0;

    this.data.contasPagar.forEach(conta => {
      const valor = parseFloat(conta.valor);
      const valorPago = parseFloat(conta.valor_pago);
      totalPagar += valor;
      totalPago += valorPago;
      if (conta.status !== 'pago') {
        totalPendente += (valor - valorPago);
      }
    });

    document.getElementById('total-pagar').textContent = formatCurrency(totalPagar);
    document.getElementById('pago').textContent = formatCurrency(totalPago);
    document.getElementById('pendente-pagar').textContent = formatCurrency(totalPendente);

    const statusColors = {
      'pendente': 'bg-yellow-100 text-yellow-800',
      'parcial': 'bg-blue-100 text-blue-800',
      'pago': 'bg-green-100 text-green-800'
    };

    const html = `
      <table class="w-full">
        <thead class="bg-aura-softgray">
          <tr>
            <th class="financial-table-header text-left">Descrição</th>
            <th class="financial-table-header text-left">Fornecedor</th>
            <th class="financial-table-header text-center">Vencimento</th>
            <th class="financial-table-header text-right">Valor</th>
            <th class="financial-table-header text-right">Pago</th>
            <th class="financial-table-header text-center">Status</th>
            <th class="financial-table-header text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${this.data.contasPagar.map(conta => `
            <tr class="hover:bg-gray-50">
              <td class="financial-table-cell">${conta.descricao}</td>
              <td class="financial-table-cell">${conta.fornecedor_nome || '-'}</td>
              <td class="financial-table-cell text-center">${formatDate(conta.data_vencimento)}</td>
              <td class="financial-table-cell text-right font-medium">${formatCurrency(conta.valor)}</td>
              <td class="financial-table-cell text-right">${formatCurrency(conta.valor_pago)}</td>
              <td class="financial-table-cell text-center">
                <span class="px-2 py-1 rounded-full text-xs ${statusColors[conta.status] || 'bg-gray-100 text-gray-800'}">${conta.status}</span>
              </td>
              <td class="financial-table-cell text-center">
                ${conta.status !== 'pago' ? `
                  <button class="btn-pagar px-3 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 text-sm" data-id="${conta.id}">
                    Pagar
                  </button>
                ` : '-'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = html;

    document.querySelectorAll('.btn-pagar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const conta = this.data.contasPagar.find(c => c.id == id);
        this.showModalPagar(conta);
      });
    });
  },

  showModalReceber(conta) {
    const saldoPendente = parseFloat(conta.valor) - parseFloat(conta.valor_pago);

    const content = `
      <form id="form-receber" class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Descrição: <span class="font-medium">${conta.descricao}</span></p>
          <p class="text-sm text-gray-600">Valor Total: <span class="font-medium">${formatCurrency(conta.valor)}</span></p>
          <p class="text-sm text-gray-600">Já Pago: <span class="font-medium">${formatCurrency(conta.valor_pago)}</span></p>
          <p class="text-lg font-bold text-green-600 mt-2">Saldo Pendente: ${formatCurrency(saldoPendente)}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Valor a Receber *</label>
          <input type="number" id="valor_pago" class="aura-input" step="0.01" min="0.01" max="${saldoPendente}" value="${saldoPendente}" required>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data do Recebimento *</label>
          <input type="date" id="data_pagamento" class="aura-input" value="${new Date().toISOString().split('T')[0]}" required>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento *</label>
          <select id="forma_pagamento_id" class="aura-input" required>
            <option value="">Selecione</option>
            ${this.data.formasPagamento.map(f => `
              <option value="${f.id}">${f.nome}</option>
            `).join('')}
          </select>
        </div>
      </form>
    `;

    const modal = new Modal('Registrar Recebimento', content, async () => {
      await this.registrarRecebimento(conta.id);
    });

    modal.show();
  },

  showModalPagar(conta) {
    const saldoPendente = parseFloat(conta.valor) - parseFloat(conta.valor_pago);

    const content = `
      <form id="form-pagar" class="space-y-4">
        <div class="bg-gray-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Descrição: <span class="font-medium">${conta.descricao}</span></p>
          <p class="text-sm text-gray-600">Valor Total: <span class="font-medium">${formatCurrency(conta.valor)}</span></p>
          <p class="text-sm text-gray-600">Já Pago: <span class="font-medium">${formatCurrency(conta.valor_pago)}</span></p>
          <p class="text-lg font-bold text-red-600 mt-2">Saldo Pendente: ${formatCurrency(saldoPendente)}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Valor a Pagar *</label>
          <input type="number" id="valor_pago" class="aura-input" step="0.01" min="0.01" max="${saldoPendente}" value="${saldoPendente}" required>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data do Pagamento *</label>
          <input type="date" id="data_pagamento" class="aura-input" value="${new Date().toISOString().split('T')[0]}" required>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento *</label>
          <select id="forma_pagamento_id" class="aura-input" required>
            <option value="">Selecione</option>
            ${this.data.formasPagamento.map(f => `
              <option value="${f.id}">${f.nome}</option>
            `).join('')}
          </select>
        </div>
      </form>
    `;

    const modal = new Modal('Registrar Pagamento', content, async () => {
      await this.registrarPagamento(conta.id);
    });

    modal.show();
  },

  showModalContaPagar() {
    const content = `
      <form id="form-conta-pagar" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição *</label>
          <input type="text" id="descricao" class="aura-input" required>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input type="text" id="categoria" class="aura-input" placeholder="Ex: Aluguel, Energia">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor (R$) *</label>
            <input type="number" id="valor" class="aura-input" step="0.01" min="0" required>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data de Vencimento *</label>
          <input type="date" id="data_vencimento" class="aura-input" required>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea id="observacoes" class="aura-input" rows="3"></textarea>
        </div>
      </form>
    `;

    const modal = new Modal('Nova Conta a Pagar', content, async () => {
      await this.salvarContaPagar();
    });

    modal.show();
  },

  async registrarRecebimento(id) {
    const dados = {
      valor_pago: parseFloat(document.getElementById('valor_pago').value),
      data_pagamento: document.getElementById('data_pagamento').value,
      forma_pagamento_id: parseInt(document.getElementById('forma_pagamento_id').value)
    };

    try {
      await api.post(`/financeiro/contas-receber/${id}/receber`, dados);
      Toast.success('Recebimento registrado com sucesso!');
      Modal.close();
      await this.loadData();
    } catch (error) {
      Toast.error(error.message);
    }
  },

  async registrarPagamento(id) {
    const dados = {
      valor_pago: parseFloat(document.getElementById('valor_pago').value),
      data_pagamento: document.getElementById('data_pagamento').value,
      forma_pagamento_id: parseInt(document.getElementById('forma_pagamento_id').value)
    };

    try {
      await api.post(`/financeiro/contas-pagar/${id}/pagar`, dados);
      Toast.success('Pagamento registrado com sucesso!');
      Modal.close();
      await this.loadData();
    } catch (error) {
      Toast.error(error.message);
    }
  },

  async salvarContaPagar() {
    const dados = {
      descricao: document.getElementById('descricao').value,
      categoria: document.getElementById('categoria').value,
      valor: parseFloat(document.getElementById('valor').value),
      data_vencimento: document.getElementById('data_vencimento').value,
      observacoes: document.getElementById('observacoes').value
    };

    try {
      await api.post('/financeiro/contas-pagar', dados);
      Toast.success('Conta a pagar criada com sucesso!');
      Modal.close();
      await this.loadData();
    } catch (error) {
      Toast.error(error.message);
    }
  }
};
