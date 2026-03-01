import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { attachEmpresa } from '../middleware/tenant.js';

const router = express.Router();

router.use(authenticateToken);
router.use(attachEmpresa);

// Listar agendamentos
router.get('/', async (req, res) => {
  const { data_inicio, data_fim, status, paciente_id, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT a.*, 
             pac.nome as paciente_nome,
             proc.nome as procedimento_nome,
             proc.valor as procedimento_valor,
             u.nome as usuario_nome
      FROM agendamentos a
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

    if (status) {
      query += ' AND a.status = $' + (params.length + 1);
      params.push(status);
    }

    if (paciente_id) {
      query += ' AND a.paciente_id = $' + (params.length + 1);
      params.push(paciente_id);
    }

    query += ' ORDER BY a.data_hora ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

// Criar agendamento
router.post('/',
  [
    body('paciente_id').isInt().withMessage('Paciente obrigatório'),
    body('procedimento_id').isInt().withMessage('Procedimento obrigatório'),
    body('data_hora').isISO8601().withMessage('Data/hora inválida')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paciente_id, procedimento_id, data_hora, duracao_minutos, observacoes } = req.body;

    try {
      // Validar paciente
      const pacienteCheck = await pool.query(
        'SELECT id FROM pacientes WHERE id = $1 AND empresa_id = $2',
        [paciente_id, req.empresaId]
      );

      if (pacienteCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      // Validar procedimento
      const procedimentoCheck = await pool.query(
        'SELECT id, duracao_minutos FROM procedimentos WHERE id = $1 AND empresa_id = $2',
        [procedimento_id, req.empresaId]
      );

      if (procedimentoCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Procedimento não encontrado' });
      }

      const duracao = duracao_minutos || procedimentoCheck.rows[0].duracao_minutos;

      const result = await pool.query(
        `INSERT INTO agendamentos (empresa_id, paciente_id, procedimento_id, usuario_id, data_hora, duracao_minutos, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [req.empresaId, paciente_id, procedimento_id, req.user.userId, data_hora, duracao, observacoes]
      );

      res.status(201).json({
        message: 'Agendamento criado com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      res.status(500).json({ error: 'Erro ao criar agendamento' });
    }
  }
);

// Atualizar agendamento
router.put('/:id', async (req, res) => {
  const { data_hora, duracao_minutos, status, observacoes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE agendamentos 
       SET data_hora = $1, duracao_minutos = $2, status = $3, observacoes = $4,
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $5 AND empresa_id = $6
       RETURNING *`,
      [data_hora, duracao_minutos, status, observacoes, req.params.id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({
      message: 'Agendamento atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar agendamento:', error);
    res.status(500).json({ error: 'Erro ao atualizar agendamento' });
  }
});

// Excluir agendamento
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM agendamentos WHERE id = $1 AND empresa_id = $2 RETURNING id',
      [req.params.id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    res.json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ error: 'Erro ao excluir agendamento' });
  }
});

export default router;
