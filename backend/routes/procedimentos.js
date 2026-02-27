import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { attachEmpresa } from '../middleware/tenant.js';

const router = express.Router();

router.use(authenticateToken);
router.use(attachEmpresa);

// Listar procedimentos
router.get('/', async (req, res) => {
  const { search, categoria, page = 1, limit = 50 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM procedimentos WHERE empresa_id = $1 AND ativo = true';
    const params = [req.empresaId];

    if (search) {
      query += ' AND nome ILIKE $' + (params.length + 1);
      params.push(`%${search}%`);
    }

    if (categoria) {
      query += ' AND categoria = $' + (params.length + 1);
      params.push(categoria);
    }

    query += ' ORDER BY nome ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM procedimentos WHERE empresa_id = $1 AND ativo = true',
      [req.empresaId]
    );

    res.json({
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar procedimentos:', error);
    res.status(500).json({ error: 'Erro ao buscar procedimentos' });
  }
});

// Buscar procedimento por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM procedimentos WHERE id = $1 AND empresa_id = $2',
      [req.params.id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Procedimento não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar procedimento:', error);
    res.status(500).json({ error: 'Erro ao buscar procedimento' });
  }
});

// Criar procedimento
router.post('/',
  [
    body('nome').trim().notEmpty().withMessage('Nome obrigatório'),
    body('valor').isFloat({ min: 0 }).withMessage('Valor deve ser maior ou igual a 0')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, descricao, categoria, duracao_minutos, valor } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO procedimentos (empresa_id, nome, descricao, categoria, duracao_minutos, valor)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.empresaId, nome, descricao, categoria, duracao_minutos, valor]
      );

      res.status(201).json({
        message: 'Procedimento cadastrado com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar procedimento:', error);
      res.status(500).json({ error: 'Erro ao criar procedimento' });
    }
  }
);

// Atualizar procedimento
router.put('/:id',
  [
    body('nome').trim().notEmpty().withMessage('Nome obrigatório'),
    body('valor').isFloat({ min: 0 }).withMessage('Valor deve ser maior ou igual a 0')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, descricao, categoria, duracao_minutos, valor } = req.body;

    try {
      const result = await pool.query(
        `UPDATE procedimentos 
         SET nome = $1, descricao = $2, categoria = $3, duracao_minutos = $4, valor = $5,
             atualizado_em = CURRENT_TIMESTAMP
         WHERE id = $6 AND empresa_id = $7
         RETURNING *`,
        [nome, descricao, categoria, duracao_minutos, valor, req.params.id, req.empresaId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Procedimento não encontrado' });
      }

      res.json({
        message: 'Procedimento atualizado com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao atualizar procedimento:', error);
      res.status(500).json({ error: 'Erro ao atualizar procedimento' });
    }
  }
);

// Excluir procedimento (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE procedimentos SET ativo = false WHERE id = $1 AND empresa_id = $2 RETURNING id',
      [req.params.id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Procedimento não encontrado' });
    }

    res.json({ message: 'Procedimento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir procedimento:', error);
    res.status(500).json({ error: 'Erro ao excluir procedimento' });
  }
});

export default router;
