import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { attachEmpresa } from '../middleware/tenant.js';

const router = express.Router();

router.use(authenticateToken);
router.use(attachEmpresa);

// Listar contas a receber
router.get('/contas-receber', async (req, res) => {
  const { status, data_inicio, data_fim, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT cr.*, 
             pac.nome as paciente_nome,
             fp.nome as forma_pagamento_nome
      FROM contas_receber cr
      LEFT JOIN pacientes pac ON cr.paciente_id = pac.id
      LEFT JOIN formas_pagamento fp ON cr.forma_pagamento_id = fp.id
      WHERE cr.empresa_id = $1
    `;
    const params = [req.empresaId];

    if (status) {
      query += ' AND cr.status = $' + (params.length + 1);
      params.push(status);
    }

    if (data_inicio && data_fim) {
      query += ' AND cr.data_vencimento BETWEEN $' + (params.length + 1) + ' AND $' + (params.length + 2);
      params.push(data_inicio, data_fim);
    }

    query += ' ORDER BY cr.data_vencimento ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar contas a receber:', error);
    res.status(500).json({ error: 'Erro ao buscar contas a receber' });
  }
});

// Listar contas a pagar
router.get('/contas-pagar', async (req, res) => {
  const { status, data_inicio, data_fim, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT cp.*, 
             f.nome as fornecedor_nome,
             fp.nome as forma_pagamento_nome
      FROM contas_pagar cp
      LEFT JOIN fornecedores f ON cp.fornecedor_id = f.id
      LEFT JOIN formas_pagamento fp ON cp.forma_pagamento_id = fp.id
      WHERE cp.empresa_id = $1
    `;
    const params = [req.empresaId];

    if (status) {
      query += ' AND cp.status = $' + (params.length + 1);
      params.push(status);
    }

    if (data_inicio && data_fim) {
      query += ' AND cp.data_vencimento BETWEEN $' + (params.length + 1) + ' AND $' + (params.length + 2);
      params.push(data_inicio, data_fim);
    }

    query += ' ORDER BY cp.data_vencimento ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);

    res.json({
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar contas a pagar:', error);
    res.status(500).json({ error: 'Erro ao buscar contas a pagar' });
  }
});

// Criar conta a pagar
router.post('/contas-pagar',
  [
    body('descricao').trim().notEmpty().withMessage('Descrição obrigatória'),
    body('valor').isFloat({ min: 0 }).withMessage('Valor inválido'),
    body('data_vencimento').isISO8601().withMessage('Data de vencimento inválida')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fornecedor_id, forma_pagamento_id, descricao, categoria, valor, data_vencimento, observacoes } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO contas_pagar (empresa_id, fornecedor_id, forma_pagamento_id, descricao, categoria, valor, data_vencimento, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [req.empresaId, fornecedor_id, forma_pagamento_id, descricao, categoria, valor, data_vencimento, observacoes]
      );

      res.status(201).json({
        message: 'Conta a pagar criada com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar conta a pagar:', error);
      res.status(500).json({ error: 'Erro ao criar conta a pagar' });
    }
  }
);

// Registrar pagamento de conta a pagar
router.post('/contas-pagar/:id/pagar',
  [
    body('valor_pago').isFloat({ min: 0 }).withMessage('Valor pago inválido'),
    body('data_pagamento').isISO8601().withMessage('Data de pagamento inválida')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { valor_pago, data_pagamento, forma_pagamento_id } = req.body;

    try {
      const contaResult = await pool.query(
        'SELECT * FROM contas_pagar WHERE id = $1 AND empresa_id = $2',
        [req.params.id, req.empresaId]
      );

      if (contaResult.rows.length === 0) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      const conta = contaResult.rows[0];
      const novoValorPago = parseFloat(conta.valor_pago) + parseFloat(valor_pago);
      const status = novoValorPago >= parseFloat(conta.valor) ? 'pago' : 'parcial';

      const result = await pool.query(
        `UPDATE contas_pagar 
         SET valor_pago = $1, data_pagamento = $2, forma_pagamento_id = $3, status = $4,
             atualizado_em = CURRENT_TIMESTAMP
         WHERE id = $5 AND empresa_id = $6
         RETURNING *`,
        [novoValorPago, data_pagamento, forma_pagamento_id, status, req.params.id, req.empresaId]
      );

      res.json({
        message: 'Pagamento registrado com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      res.status(500).json({ error: 'Erro ao registrar pagamento' });
    }
  }
);

// Registrar pagamento de conta a receber
router.post('/contas-receber/:id/receber',
  [
    body('valor_pago').isFloat({ min: 0 }).withMessage('Valor pago inválido'),
    body('data_pagamento').isISO8601().withMessage('Data de pagamento inválida')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { valor_pago, data_pagamento, forma_pagamento_id } = req.body;

    try {
      const contaResult = await pool.query(
        'SELECT * FROM contas_receber WHERE id = $1 AND empresa_id = $2',
        [req.params.id, req.empresaId]
      );

      if (contaResult.rows.length === 0) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      const conta = contaResult.rows[0];
      const novoValorPago = parseFloat(conta.valor_pago) + parseFloat(valor_pago);
      const status = novoValorPago >= parseFloat(conta.valor) ? 'pago' : 'parcial';

      const result = await pool.query(
        `UPDATE contas_receber 
         SET valor_pago = $1, data_pagamento = $2, forma_pagamento_id = $3, status = $4,
             atualizado_em = CURRENT_TIMESTAMP
         WHERE id = $5 AND empresa_id = $6
         RETURNING *`,
        [novoValorPago, data_pagamento, forma_pagamento_id, status, req.params.id, req.empresaId]
      );

      res.json({
        message: 'Recebimento registrado com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao registrar recebimento:', error);
      res.status(500).json({ error: 'Erro ao registrar recebimento' });
    }
  }
);

// Listar formas de pagamento
router.get('/formas-pagamento', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM formas_pagamento WHERE empresa_id = $1 AND ativo = true ORDER BY nome',
      [req.empresaId]
    );

    res.json({
      data: result.rows
    });
  } catch (error) {
    console.error('Erro ao buscar formas de pagamento:', error);
    res.status(500).json({ error: 'Erro ao buscar formas de pagamento' });
  }
});

export default router;
