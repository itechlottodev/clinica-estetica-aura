import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { attachEmpresa } from '../middleware/tenant.js';

const router = express.Router();

router.use(authenticateToken);
router.use(attachEmpresa);

// Listar fornecedores
router.get('/', async (req, res) => {
  const { search, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM fornecedores WHERE empresa_id = $1 AND ativo = true';
    const params = [req.empresaId];

    if (search) {
      query += ' AND (nome ILIKE $2 OR cnpj ILIKE $2)';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY nome ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM fornecedores WHERE empresa_id = $1 AND ativo = true',
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
    console.error('Erro ao buscar fornecedores:', error);
    res.status(500).json({ error: 'Erro ao buscar fornecedores' });
  }
});

// Criar fornecedor
router.post('/',
  [
    body('nome').trim().notEmpty().withMessage('Nome obrigatório')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, razao_social, cnpj, email, telefone, endereco, observacoes } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO fornecedores (empresa_id, nome, razao_social, cnpj, email, telefone, endereco, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [req.empresaId, nome, razao_social, cnpj, email, telefone, endereco, observacoes]
      );

      res.status(201).json({
        message: 'Fornecedor cadastrado com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar fornecedor:', error);
      res.status(500).json({ error: 'Erro ao criar fornecedor' });
    }
  }
);

// Atualizar fornecedor
router.put('/:id', async (req, res) => {
  const { nome, razao_social, cnpj, email, telefone, endereco, observacoes } = req.body;

  try {
    const result = await pool.query(
      `UPDATE fornecedores 
       SET nome = $1, razao_social = $2, cnpj = $3, email = $4, telefone = $5,
           endereco = $6, observacoes = $7, atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $8 AND empresa_id = $9
       RETURNING *`,
      [nome, razao_social, cnpj, email, telefone, endereco, observacoes, req.params.id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json({
      message: 'Fornecedor atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar fornecedor:', error);
    res.status(500).json({ error: 'Erro ao atualizar fornecedor' });
  }
});

// Excluir fornecedor
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE fornecedores SET ativo = false WHERE id = $1 AND empresa_id = $2 RETURNING id',
      [req.params.id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fornecedor não encontrado' });
    }

    res.json({ message: 'Fornecedor excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);
    res.status(500).json({ error: 'Erro ao excluir fornecedor' });
  }
});

export default router;
