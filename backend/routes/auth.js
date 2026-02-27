import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import pool from '../config/database.js';
import { generateToken } from '../middleware/auth.js';
import { loginLimiter, createLimiter } from '../middleware/security.js';

const router = express.Router();

// Cadastro de nova empresa + usuário owner
router.post('/cadastro',
  createLimiter,
  [
    body('nomeEmpresa').trim().notEmpty().withMessage('Nome da empresa obrigatório'),
    body('nomeUsuario').trim().notEmpty().withMessage('Nome do usuário obrigatório'),
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('senha').isLength({ min: 6 }).withMessage('Senha deve ter no mínimo 6 caracteres')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { nomeEmpresa, nomeUsuario, email, senha, emailEmpresa, telefone } = req.body;

    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Gerar slug único
      let slug = nomeEmpresa
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Verificar se slug já existe
      const slugCheck = await client.query(
        'SELECT id FROM empresas WHERE slug = $1',
        [slug]
      );

      if (slugCheck.rows.length > 0) {
        slug = `${slug}-${Date.now()}`;
      }

      // Criar empresa
      const empresaResult = await client.query(
        `INSERT INTO empresas (nome, slug, email, telefone, plano, status)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [nomeEmpresa, slug, emailEmpresa || email, telefone, 'gratuito', 'ativo']
      );

      const empresaId = empresaResult.rows[0].id;

      // Criar usuário owner
      const senhaHash = await bcrypt.hash(senha, 10);
      const usuarioResult = await client.query(
        `INSERT INTO usuarios (empresa_id, nome, email, senha_hash, funcao)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [empresaId, nomeUsuario, email, senhaHash, 'owner']
      );

      const usuarioId = usuarioResult.rows[0].id;

      // Criar formas de pagamento padrão
      const formasPagamento = ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX'];
      for (const forma of formasPagamento) {
        await client.query(
          'INSERT INTO formas_pagamento (empresa_id, nome, tipo) VALUES ($1, $2, $3)',
          [empresaId, forma, forma.toLowerCase().replace(/ /g, '_')]
        );
      }

      await client.query('COMMIT');

      // Gerar token
      const token = generateToken({ userId: usuarioId, empresaId });

      res.status(201).json({
        message: 'Empresa cadastrada com sucesso',
        token,
        usuario: {
          id: usuarioId,
          nome: nomeUsuario,
          email,
          funcao: 'owner'
        },
        empresa: {
          id: empresaId,
          nome: nomeEmpresa,
          slug
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao cadastrar empresa:', error);
      
      if (error.code === '23505') {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      
      res.status(500).json({ error: 'Erro ao cadastrar empresa' });
    } finally {
      client.release();
    }
  }
);

// Login
router.post('/login',
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
    body('senha').notEmpty().withMessage('Senha obrigatória')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, senha } = req.body;

    try {
      const result = await pool.query(
        `SELECT u.id, u.empresa_id, u.nome, u.email, u.senha_hash, u.funcao, u.ativo,
                e.nome as empresa_nome, e.slug as empresa_slug, e.status as empresa_status
         FROM usuarios u
         JOIN empresas e ON u.empresa_id = e.id
         WHERE u.email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      const usuario = result.rows[0];

      if (!usuario.ativo) {
        return res.status(403).json({ error: 'Usuário inativo' });
      }

      if (usuario.empresa_status !== 'ativo') {
        return res.status(403).json({ error: 'Empresa inativa ou suspensa' });
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

      if (!senhaValida) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      const token = generateToken({ userId: usuario.id, empresaId: usuario.empresa_id });

      res.json({
        message: 'Login realizado com sucesso',
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          funcao: usuario.funcao
        },
        empresa: {
          id: usuario.empresa_id,
          nome: usuario.empresa_nome,
          slug: usuario.empresa_slug
        }
      });

    } catch (error) {
      console.error('Erro ao fazer login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }
);

export default router;
