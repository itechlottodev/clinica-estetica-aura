import express from 'express';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { attachEmpresa } from '../middleware/tenant.js';

const router = express.Router();

router.use(authenticateToken);
router.use(attachEmpresa);

// Dashboard principal
router.get('/', async (req, res) => {
  try {
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    // Total de pacientes ativos
    const totalPacientes = await pool.query(
      'SELECT COUNT(*) FROM pacientes WHERE empresa_id = $1 AND ativo = true',
      [req.empresaId]
    );

    // Agendamentos do dia
    const agendamentosHoje = await pool.query(
      `SELECT COUNT(*) FROM agendamentos 
       WHERE empresa_id = $1 AND DATE(data_hora) = CURRENT_DATE AND status != 'cancelado'`,
      [req.empresaId]
    );

    // Atendimentos do mês
    const atendimentosMes = await pool.query(
      `SELECT COUNT(*), COALESCE(SUM(valor_total), 0) as total
       FROM atendimentos 
       WHERE empresa_id = $1 AND data_hora BETWEEN $2 AND $3`,
      [req.empresaId, primeiroDiaMes, ultimoDiaMes]
    );

    // Contas a receber pendentes
    const contasReceber = await pool.query(
      `SELECT COALESCE(SUM(valor - valor_pago), 0) as total
       FROM contas_receber 
       WHERE empresa_id = $1 AND status IN ('pendente', 'parcial')`,
      [req.empresaId]
    );

    // Contas a pagar pendentes
    const contasPagar = await pool.query(
      `SELECT COALESCE(SUM(valor - valor_pago), 0) as total
       FROM contas_pagar 
       WHERE empresa_id = $1 AND status IN ('pendente', 'parcial')`,
      [req.empresaId]
    );

    // Receita por dia (últimos 30 dias)
    const receitaDiaria = await pool.query(
      `SELECT DATE(data_hora) as data, COALESCE(SUM(valor_total), 0) as total
       FROM atendimentos 
       WHERE empresa_id = $1 AND data_hora >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY DATE(data_hora)
       ORDER BY data ASC`,
      [req.empresaId]
    );

    // Procedimentos mais realizados
    const topProcedimentos = await pool.query(
      `SELECT p.nome, COUNT(*) as quantidade, COALESCE(SUM(a.valor_total), 0) as total
       FROM atendimentos a
       JOIN procedimentos p ON a.procedimento_id = p.id
       WHERE a.empresa_id = $1 AND a.data_hora >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY p.id, p.nome
       ORDER BY quantidade DESC
       LIMIT 5`,
      [req.empresaId]
    );

    // Próximos agendamentos
    const proximosAgendamentos = await pool.query(
      `SELECT a.*, 
              pac.nome as paciente_nome,
              proc.nome as procedimento_nome
       FROM agendamentos a
       JOIN pacientes pac ON a.paciente_id = pac.id
       JOIN procedimentos proc ON a.procedimento_id = proc.id
       WHERE a.empresa_id = $1 AND a.data_hora >= CURRENT_TIMESTAMP AND a.status = 'agendado'
       ORDER BY a.data_hora ASC
       LIMIT 10`,
      [req.empresaId]
    );

    res.json({
      resumo: {
        total_pacientes: parseInt(totalPacientes.rows[0].count),
        agendamentos_hoje: parseInt(agendamentosHoje.rows[0].count),
        atendimentos_mes: parseInt(atendimentosMes.rows[0].count),
        receita_mes: parseFloat(atendimentosMes.rows[0].total || 0),
        contas_receber_pendente: parseFloat(contasReceber.rows[0].total || 0),
        contas_pagar_pendente: parseFloat(contasPagar.rows[0].total || 0)
      },
      receita_diaria: receitaDiaria.rows,
      top_procedimentos: topProcedimentos.rows,
      proximos_agendamentos: proximosAgendamentos.rows
    });

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro ao buscar dados do dashboard' });
  }
});

export default router;
