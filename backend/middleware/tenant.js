import pool from '../config/database.js';

export const attachEmpresa = async (req, res, next) => {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ error: 'Não autenticado' });
  }

  try {
    const result = await pool.query(
      'SELECT empresa_id, funcao FROM usuarios WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    req.empresaId = result.rows[0].empresa_id;
    req.userFuncao = result.rows[0].funcao;
    
    next();
  } catch (error) {
    console.error('Erro no middleware tenant:', error);
    return res.status(500).json({ error: 'Erro ao verificar empresa' });
  }
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userFuncao)) {
      return res.status(403).json({ error: 'Sem permissão para esta ação' });
    }
    next();
  };
};
