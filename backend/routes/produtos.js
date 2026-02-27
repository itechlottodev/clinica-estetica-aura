import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { attachEmpresa } from '../middleware/tenant.js';

const router = express.Router();

router.use(authenticateToken);
router.use(attachEmpresa);

// Listar produtos
router.get('/', async (req, res) => {
  const { search, categoria, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = `
      SELECT p.*, f.nome as fornecedor_nome
      FROM produtos p
      LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
      WHERE p.empresa_id = $1 AND p.ativo = true
    `;
    const params = [req.empresaId];

    if (search) {
      query += ' AND p.nome ILIKE $' + (params.length + 1);
      params.push(`%${search}%`);
    }

    if (categoria) {
      query += ' AND p.categoria = $' + (params.length + 1);
      params.push(categoria);
    }

    query += ' ORDER BY p.nome ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM produtos WHERE empresa_id = $1 AND ativo = true',
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
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Criar produto
router.post('/',
  [
    body('nome').trim().notEmpty().withMessage('Nome obrigatório'),
    body('unidade_medida').trim().notEmpty().withMessage('Unidade de medida obrigatória')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, descricao, categoria, codigo_barras, unidade_medida, estoque_atual, 
            estoque_minimo, valor_custo, valor_venda, fornecedor_id } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO produtos (empresa_id, fornecedor_id, nome, descricao, categoria, codigo_barras,
                               unidade_medida, estoque_atual, estoque_minimo, valor_custo, valor_venda)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [req.empresaId, fornecedor_id, nome, descricao, categoria, codigo_barras,
         unidade_medida, estoque_atual || 0, estoque_minimo || 0, valor_custo, valor_venda]
      );

      res.status(201).json({
        message: 'Produto cadastrado com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }
);

// Atualizar produto
router.put('/:id', async (req, res) => {
  const { nome, descricao, categoria, codigo_barras, unidade_medida, estoque_atual,
          estoque_minimo, valor_custo, valor_venda, fornecedor_id } = req.body;

  try {
    const result = await pool.query(
      `UPDATE produtos 
       SET nome = $1, descricao = $2, categoria = $3, codigo_barras = $4,
           unidade_medida = $5, estoque_atual = $6, estoque_minimo = $7,
           valor_custo = $8, valor_venda = $9, fornecedor_id = $10,
           atualizado_em = CURRENT_TIMESTAMP
       WHERE id = $11 AND empresa_id = $12
       RETURNING *`,
      [nome, descricao, categoria, codigo_barras, unidade_medida, estoque_atual,
       estoque_minimo, valor_custo, valor_venda, fornecedor_id, req.params.id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({
      message: 'Produto atualizado com sucesso',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Excluir produto
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE produtos SET ativo = false WHERE id = $1 AND empresa_id = $2 RETURNING id',
      [req.params.id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    res.json({ message: 'Produto excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    res.status(500).json({ error: 'Erro ao excluir produto' });
  }
});

export default router;
