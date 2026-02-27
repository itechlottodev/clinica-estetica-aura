import api from '../utils/api.js';
import Toast from '../components/Toast.js';
import Modal from '../components/Modal.js';
import { formatCurrency } from '../utils/format.js';

export default {
  data: {
    produtos: [],
    fornecedores: []
  },

  async render() {
    return `
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 class="text-3xl font-playfair text-aura-neutral">Produtos</h1>
          <button id="btn-novo-produto" class="aura-btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Novo Produto
          </button>
        </div>

        <div class="aura-card">
          <div id="produtos-list" class="overflow-x-auto">
            <div class="text-center py-8 text-gray-500">Carregando...</div>
          </div>
        </div>
      </div>

      <div id="modal-container"></div>
    `;
  },

  async afterRender() {
    await this.loadData();
    this.setupEventListeners();
  },

  setupEventListeners() {
    document.getElementById('btn-novo-produto').addEventListener('click', () => {
      this.showModal();
    });
  },

  async loadData() {
    try {
      const [produtosRes, fornecedoresRes] = await Promise.all([
        api.get('/produtos'),
        api.get('/fornecedores?limit=1000')
      ]);
      
      this.data.produtos = produtosRes.data;
      this.data.fornecedores = fornecedoresRes.data;
      this.renderProdutos();
    } catch (error) {
      Toast.error('Erro ao carregar dados: ' + error.message);
    }
  },

  renderProdutos() {
    const container = document.getElementById('produtos-list');
    
    if (this.data.produtos.length === 0) {
      container.innerHTML = '<div class="text-center py-8 text-gray-500">Nenhum produto encontrado</div>';
      return;
    }

    const html = `
      <table class="w-full">
        <thead class="bg-aura-softgray">
          <tr>
            <th class="financial-table-header text-left">Produto</th>
            <th class="financial-table-header text-left">Categoria</th>
            <th class="financial-table-header text-center">Estoque</th>
            <th class="financial-table-header text-right">Custo</th>
            <th class="financial-table-header text-right">Venda</th>
            <th class="financial-table-header text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          ${this.data.produtos.map(prod => `
            <tr class="hover:bg-gray-50">
              <td class="financial-table-cell">
                <div class="font-medium">${prod.nome}</div>
                ${prod.fornecedor_nome ? `<div class="text-xs text-gray-500">Fornecedor: ${prod.fornecedor_nome}</div>` : ''}
              </td>
              <td class="financial-table-cell">${prod.categoria || '-'}</td>
              <td class="financial-table-cell text-center">
                <span class="${parseFloat(prod.estoque_atual) <= parseFloat(prod.estoque_minimo) ? 'text-red-600 font-bold' : ''}">${prod.estoque_atual} ${prod.unidade_medida}</span>
              </td>
              <td class="financial-table-cell text-right">${formatCurrency(prod.valor_custo)}</td>
              <td class="financial-table-cell text-right font-medium">${formatCurrency(prod.valor_venda)}</td>
              <td class="financial-table-cell">
                <div class="flex justify-center gap-2">
                  <button class="btn-editar p-1 text-blue-600 hover:bg-blue-50 rounded" data-id="${prod.id}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button class="btn-excluir p-1 text-red-600 hover:bg-red-50 rounded" data-id="${prod.id}">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = html;

    document.querySelectorAll('.btn-editar').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const produto = this.data.produtos.find(p => p.id == id);
        this.showModal(produto);
      });
    });

    document.querySelectorAll('.btn-excluir').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        this.deleteProduto(id);
      });
    });
  },

  showModal(produto = null) {
    const isEdit = !!produto;
    const title = isEdit ? 'Editar Produto' : 'Novo Produto';

    const content = `
      <form id="form-produto" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" id="nome" class="aura-input" value="${produto?.nome || ''}" required>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <input type="text" id="categoria" class="aura-input" value="${produto?.categoria || ''}" placeholder="Ex: Maquiagem, Skincare">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
            <select id="fornecedor_id" class="aura-input">
              <option value="">Selecione</option>
              ${this.data.fornecedores.map(f => `
                <option value="${f.id}" ${produto?.fornecedor_id == f.id ? 'selected' : ''}>${f.nome}</option>
              `).join('')}
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Unidade de Medida *</label>
            <select id="unidade_medida" class="aura-input" required>
              <option value="UN" ${produto?.unidade_medida === 'UN' ? 'selected' : ''}>Unidade (UN)</option>
              <option value="CX" ${produto?.unidade_medida === 'CX' ? 'selected' : ''}>Caixa (CX)</option>
              <option value="KG" ${produto?.unidade_medida === 'KG' ? 'selected' : ''}>Quilograma (KG)</option>
              <option value="L" ${produto?.unidade_medida === 'L' ? 'selected' : ''}>Litro (L)</option>
              <option value="ML" ${produto?.unidade_medida === 'ML' ? 'selected' : ''}>Mililitro (ML)</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
            <input type="text" id="codigo_barras" class="aura-input" value="${produto?.codigo_barras || ''}">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estoque Atual</label>
            <input type="number" id="estoque_atual" class="aura-input" value="${produto?.estoque_atual || 0}" step="0.01" min="0">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estoque Mínimo</label>
            <input type="number" id="estoque_minimo" class="aura-input" value="${produto?.estoque_minimo || 0}" step="0.01" min="0">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor de Custo (R$)</label>
            <input type="number" id="valor_custo" class="aura-input" value="${produto?.valor_custo || ''}" step="0.01" min="0">
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor de Venda (R$)</label>
            <input type="number" id="valor_venda" class="aura-input" value="${produto?.valor_venda || ''}" step="0.01" min="0">
          </div>
          
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea id="descricao" class="aura-input" rows="2">${produto?.descricao || ''}</textarea>
          </div>
        </div>
      </form>
    `;

    const modal = new Modal(title, content, async () => {
      await this.saveProduto(produto?.id);
    });

    modal.show();
  },

  async saveProduto(id = null) {
    const dados = {
      nome: document.getElementById('nome').value,
      categoria: document.getElementById('categoria').value,
      fornecedor_id: document.getElementById('fornecedor_id').value || null,
      unidade_medida: document.getElementById('unidade_medida').value,
      codigo_barras: document.getElementById('codigo_barras').value,
      estoque_atual: parseFloat(document.getElementById('estoque_atual').value) || 0,
      estoque_minimo: parseFloat(document.getElementById('estoque_minimo').value) || 0,
      valor_custo: parseFloat(document.getElementById('valor_custo').value) || null,
      valor_venda: parseFloat(document.getElementById('valor_venda').value) || null,
      descricao: document.getElementById('descricao').value
    };

    try {
      if (id) {
        await api.put(`/produtos/${id}`, dados);
        Toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', dados);
        Toast.success('Produto cadastrado com sucesso!');
      }
      
      Modal.close();
      await this.loadData();
    } catch (error) {
      Toast.error(error.message);
    }
  },

  async deleteProduto(id) {
    if (!confirm('Deseja realmente excluir este produto?')) return;

    try {
      await api.delete(`/produtos/${id}`);
      Toast.success('Produto excluído com sucesso!');
      await this.loadData();
    } catch (error) {
      Toast.error(error.message);
    }
  }
};
