import express from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { attachEmpresa } from '../middleware/tenant.js';

const router = express.Router();

router.use(authenticateToken);
router.use(attachEmpresa);

// Listar pacientes
router.get('/', async (req, res) => {
  const { search, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    let query = 'SELECT * FROM pacientes WHERE empresa_id = $1 AND ativo = true';
    const params = [req.empresaId];

    if (search) {
      query += ' AND (nome ILIKE $2 OR cpf ILIKE $2 OR telefone ILIKE $2)';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY nome ASC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM pacientes WHERE empresa_id = $1 AND ativo = true',
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
    console.error('Erro ao buscar pacientes:', error);
    res.status(500).json({ error: 'Erro ao buscar pacientes' });
  }
});

// Buscar paciente por ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM pacientes WHERE id = $1 AND empresa_id = $2',
      [req.params.id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    res.status(500).json({ error: 'Erro ao buscar paciente' });
  }
});

// Criar paciente
router.post('/',
  [
    body('nome').trim().notEmpty().withMessage('Nome obrigatório'),
    body('email').optional().isEmail().withMessage('Email inválido'),
    body('telefone').optional().trim(),
    body('cpf').optional().trim(),
    body('cnpj').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, email, telefone, cpf, cnpj, data_nascimento, genero, endereco, observacoes } = req.body;

    try {
      const result = await pool.query(
        `INSERT INTO pacientes (empresa_id, nome, email, telefone, cpf, cnpj, data_nascimento, genero, endereco, observacoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [req.empresaId, nome, email, telefone, cpf, cnpj, data_nascimento, genero, endereco, observacoes]
      );

      res.status(201).json({
        message: 'Paciente cadastrado com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      res.status(500).json({ error: 'Erro ao criar paciente' });
    }
  }
);

// Atualizar paciente
router.put('/:id',
  [
    body('nome').trim().notEmpty().withMessage('Nome obrigatório'),
    body('email').optional().isEmail().withMessage('Email inválido')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nome, email, telefone, cpf, cnpj, data_nascimento, genero, endereco, observacoes } = req.body;

    try {
      const result = await pool.query(
        `UPDATE pacientes 
         SET nome = $1, email = $2, telefone = $3, cpf = $4, cnpj = $5, 
             data_nascimento = $6, genero = $7, endereco = $8, observacoes = $9,
             atualizado_em = CURRENT_TIMESTAMP
         WHERE id = $10 AND empresa_id = $11
         RETURNING *`,
        [nome, email, telefone, cpf, cnpj, data_nascimento, genero, endereco, observacoes, req.params.id, req.empresaId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Paciente não encontrado' });
      }

      res.json({
        message: 'Paciente atualizado com sucesso',
        data: result.rows[0]
      });
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      res.status(500).json({ error: 'Erro ao atualizar paciente' });
    }
  }
);

// Excluir paciente (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE pacientes SET ativo = false WHERE id = $1 AND empresa_id = $2 RETURNING id',
      [req.params.id, req.empresaId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Paciente não encontrado' });
    }

    res.json({ message: 'Paciente excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir paciente:', error);
    res.status(500).json({ error: 'Erro ao excluir paciente' });
  }
});

export default router;
