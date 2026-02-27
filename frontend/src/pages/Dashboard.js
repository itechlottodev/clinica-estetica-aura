import api from '../utils/api.js';
import Toast from '../components/Toast.js';
import { formatCurrency, formatDateTime } from '../utils/format.js';

export default {
  async render() {
    return `
      <div class="space-y-6">
        <h1 class="text-3xl font-playfair text-aura-neutral">Dashboard</h1>

        <!-- Cards de Resumo -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="resumo-cards">
          <div class="aura-card animate-pulse">
            <div class="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>

        <!-- Gráfico e Próximos Agendamentos -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="aura-card">
            <h2 class="text-xl font-playfair text-aura-neutral mb-4">Receita dos Últimos 30 Dias</h2>
            <div id="grafico-receita" class="h-64"></div>
          </div>

          <div class="aura-card">
            <h2 class="text-xl font-playfair text-aura-neutral mb-4">Próximos Agendamentos</h2>
            <div id="proximos-agendamentos" class="space-y-3 max-h-64 overflow-y-auto"></div>
          </div>
        </div>

        <!-- Top Procedimentos -->
        <div class="aura-card">
          <h2 class="text-xl font-playfair text-aura-neutral mb-4">Procedimentos Mais Realizados (30 dias)</h2>
          <div id="top-procedimentos"></div>
        </div>
      </div>
    `;
  },

  async afterRender() {
    await this.loadDashboard();
  },

  async loadDashboard() {
    try {
      const data = await api.get('/dashboard');
      this.renderResumo(data.resumo);
      this.renderProximosAgendamentos(data.proximos_agendamentos);
      this.renderTopProcedimentos(data.top_procedimentos);
      this.renderGraficoReceita(data.receita_diaria);
    } catch (error) {
      Toast.error('Erro ao carregar dashboard: ' + error.message);
    }
  },

  renderResumo(resumo) {
    const cards = [
      {
        titulo: 'Total de Pacientes',
        valor: resumo.total_pacientes,
        icone: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>`,
        cor: 'text-blue-500'
      },
      {
        titulo: 'Agendamentos Hoje',
        valor: resumo.agendamentos_hoje,
        icone: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>`,
        cor: 'text-purple-500'
      },
      {
        titulo: 'Receita do Mês',
        valor: formatCurrency(resumo.receita_mes),
        icone: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`,
        cor: 'text-green-500'
      },
      {
        titulo: 'Atendimentos do Mês',
        valor: resumo.atendimentos_mes,
        icone: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>`,
        cor: 'text-indigo-500'
      },
      {
        titulo: 'A Receber',
        valor: formatCurrency(resumo.contas_receber_pendente),
        icone: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path></svg>`,
        cor: 'text-green-600'
      },
      {
        titulo: 'A Pagar',
        valor: formatCurrency(resumo.contas_pagar_pendente),
        icone: `<svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 13l-5 5m0 0l-5-5m5 5V6"></path></svg>`,
        cor: 'text-red-600'
      }
    ];

    const html = cards.map(card => `
      <div class="aura-card hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 mb-1">${card.titulo}</p>
            <p class="text-2xl font-bold text-aura-neutral">${card.valor}</p>
          </div>
          <div class="${card.cor}">
            ${card.icone}
          </div>
        </div>
      </div>
    `).join('');

    document.getElementById('resumo-cards').innerHTML = html;
  },

  renderProximosAgendamentos(agendamentos) {
    const container = document.getElementById('proximos-agendamentos');
    
    if (agendamentos.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum agendamento próximo</p>';
      return;
    }

    const html = agendamentos.map(ag => `
      <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
        <div class="flex-shrink-0 w-12 h-12 bg-aura-lightpink/20 rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-aura-lightpink" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-aura-neutral truncate">${ag.paciente_nome}</p>
          <p class="text-sm text-gray-600 truncate">${ag.procedimento_nome}</p>
          <p class="text-xs text-gray-500">${formatDateTime(ag.data_hora)}</p>
        </div>
      </div>
    `).join('');

    container.innerHTML = html;
  },

  renderTopProcedimentos(procedimentos) {
    const container = document.getElementById('top-procedimentos');
    
    if (procedimentos.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-8">Nenhum procedimento realizado nos últimos 30 dias</p>';
      return;
    }

    const maxQuantidade = Math.max(...procedimentos.map(p => parseInt(p.quantidade)));

    const html = procedimentos.map(proc => {
      const porcentagem = (parseInt(proc.quantidade) / maxQuantidade) * 100;
      return `
        <div class="mb-4">
          <div class="flex justify-between items-center mb-2">
            <span class="font-medium text-aura-neutral">${proc.nome}</span>
            <div class="text-right">
              <span class="text-sm text-gray-600">${proc.quantidade}x</span>
              <span class="text-sm font-medium text-green-600 ml-2">${formatCurrency(proc.total)}</span>
            </div>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-gradient-to-r from-aura-lightpink to-[#FFC2B4] h-2 rounded-full transition-all" style="width: ${porcentagem}%"></div>
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = html;
  },

  renderGraficoReceita(receitas) {
    const container = document.getElementById('grafico-receita');
    
    if (receitas.length === 0) {
      container.innerHTML = '<p class="text-gray-500 text-center py-20">Nenhuma receita nos últimos 30 dias</p>';
      return;
    }

    const maxValor = Math.max(...receitas.map(r => parseFloat(r.total)));
    const alturaGrafico = 200;

    const larguraBarra = Math.max(20, 100 / receitas.length);

    const html = `
      <div class="flex items-end justify-around h-full gap-1">
        ${receitas.map(r => {
          const altura = maxValor > 0 ? (parseFloat(r.total) / maxValor) * alturaGrafico : 0;
          const data = new Date(r.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
          return `
            <div class="flex flex-col items-center flex-1 min-w-0">
              <div class="text-xs text-gray-600 mb-1 font-medium">${formatCurrency(r.total)}</div>
              <div class="w-full bg-gradient-to-t from-aura-lightpink to-[#FFC2B4] rounded-t transition-all hover:opacity-80" 
                   style="height: ${altura}px; min-height: ${parseFloat(r.total) > 0 ? '10px' : '0'}"></div>
              <div class="text-xs text-gray-500 mt-1 transform -rotate-45 origin-top-left">${data}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    container.innerHTML = html;
  }
};
