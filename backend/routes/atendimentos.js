import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { attachEmpresa } from '../middleware/tenant.js';

const router = express.Router();

router.use(authenticateToken);
router.use(attachEmpresa);

// Listar atendimentos
router.get('/', async (req, res) => {
  const { data_inicio, data_fim, paciente_id, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT a.*, 
             pac.nome as paciente_nome,
             proc.nome as procedimento_nome,
             u.nome as usuario_nome
      FROM atendimentos a
      JOIN pacientes pac ON a.paciente_id = pac.id
      JOIN procedimentos proc ON a.procedimento_id = proc.id
      LEFT JOIN usuarios u ON a.usuario_id = u.id
      WHERE a.empresa_id = $1
    `;
    const params = [req.empresaId];

    if (data_inicio && data_fim) {
      query += ' AND a.data_hora BETWEEN $' + (params.length + 1) + ' AND $' + (params.length + 2);
      params.push(data_inicio, data_fim);
    }

    if (paciente_id) {
      query += ' AND a.paciente_id = $' + (params.length + 1);
      params.push(paciente_id);
    }

    query += ' ORDER BY a.data_hora DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar atendimentos:', error);
    res.status(500).json({ error: 'Erro ao buscar atendimentos' });
  }
});

// Criar atendimento com pagamento
router.post('/',
  [
    body('paciente_id').isInt().withMessage('Paciente obrigatório'),
    body('procedimento_id').isInt().withMessage('Procedimento obrigatório'),
    body('valor_total').isFloat({ min: 0 }).withMessage('Valor total inválido'),
    body('pagamentos').isArray().withMessage('Pagamentos devem ser um array')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paciente_id, procedimento_id, agendamento_id, data_hora, valor_total, observacoes, pagamentos } = req.body;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Validar paciente e procedimento
      const pacienteCheck = await client.query(
        'SELECT id FROM pacientes WHERE id = $1 AND empresa_id = $2',
        [paciente_id, req.empresaId]
      );

      if (pacienteCheck.rows.length === 0) {
        throw new Error('Paciente não encontrado');
      }

      const procedimentoCheck = await client.query(
        'SELECT id FROM procedimentos WHERE id = $1 AND empresa_id = $2',
        [procedimento_id, req.empresaId]
      );

      if (procedimentoCheck.rows.length === 0) {
        throw new Error('Procedimento não encontrado');
      }

      // Criar atendimento
      const atendimentoResult = await client.query(
        `INSERT INTO atendimentos (empresa_id, agendamento_id, paciente_id, procedimento_id, usuario_id, data_hora, valor_total, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [req.empresaId, agendamento_id, paciente_id, procedimento_id, req.userId, data_hora || new Date(), valor_total, observacoes]
      );

      const atendimentoId = atendimentoResult.rows[0].id;

      // Processar pagamentos
      let totalPago = 0;
      for (const pag of pagamentos) {
        const { forma_pagamento_id, valor, parcelas } = pag;

        if (parcelas && parcelas > 1) {
          // Criar parcelas
          const valorParcela = valor / parcelas;
          for (let i = 1; i <= parcelas; i++) {
            const dataVencimento = new Date();
            dataVencimento.setMonth(dataVencimento.getMonth() + i - 1);

            await client.query(
              `INSERT INTO parcelas_pagamento (empresa_id, atendimento_id, forma_pagamento_id, numero_parcela, total_parcelas, valor, data_vencimento, status)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [req.empresaId, atendimentoId, forma_pagamento_id, i, parcelas, valorParcela, dataVencimento, i === 1 ? 'pago' : 'pendente']
            );
          }

          // Primeira parcela já paga
          totalPago += valorParcela;
        } else {
          // Pagamento à vista
          totalPago += valor;
        }
      }

      // Criar conta a receber se houver saldo pendente
      const saldoPendente = valor_total - totalPago;
      if (saldoPendente > 0) {
        await client.query(
          `INSERT INTO contas_receber (empresa_id, atendimento_id, paciente_id, descricao, valor, valor_pago, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [req.empresaId, atendimentoId, paciente_id, `Saldo pendente - Atendimento #${atendimentoId}`, saldoPendente, 0, 'pendente']
        );
      }

      // Atualizar status do agendamento se existir
      if (agendamento_id) {
        await client.query(
          'UPDATE agendamentos SET status = $1 WHERE id = $2 AND empresa_id = $3',
          ['concluido', agendamento_id, req.empresaId]
        );
      }

      await client.query('COMMIT');

      res.status(201).json({
        message: 'Atendimento registrado com sucesso',
        data: atendimentoResult.rows[0],
        saldo_pendente: saldoPendente
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao criar atendimento:', error);
      res.status(500).json({ error: error.message || 'Erro ao criar atendimento' });
    } finally {
      client.release();
    }
  }
);

export default router;
