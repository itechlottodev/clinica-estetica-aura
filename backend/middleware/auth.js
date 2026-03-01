import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Lista negra de tokens (em produção, usar Redis)
const tokenBlacklist = new Set();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('[AUTH] Headers:', req.headers);
  console.log('[AUTH] Authorization header:', authHeader);
  console.log('[AUTH] Token extraído:', token ? 'presente' : 'ausente');

  if (!token) {
    console.warn('[AUTH] Token não fornecido');
    return res.status(401).json({ 
      error: 'Token não fornecido',
      message: 'Autenticação necessária'
    });
  }

  // Verificar se o token está na blacklist
  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ 
      error: 'Token revogado',
      message: 'Este token foi invalidado. Faça login novamente.'
    });
  }

  try {
    console.log('[AUTH] Iniciando validação JWT...');
    console.log('[AUTH] JWT_SECRET presente:', !!process.env.JWT_SECRET);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256'], // Especificar algoritmo permitido
      issuer: 'clinica-estetica-api', // Validar emissor
      audience: 'clinica-estetica-client' // Validar audiência
    });

    console.log('[AUTH] Token decodificado com sucesso:', { userId: decoded.userId, empresaId: decoded.empresaId });

    // Validar estrutura do payload
    if (!decoded.userId || !decoded.empresaId) {
      console.warn('[AUTH] Payload inválido - faltam userId ou empresaId');
      throw new Error('Payload do token inválido');
    }

    // Validar se o token não está muito antigo (além do expiresIn)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.iat && (now - decoded.iat) > (7 * 24 * 60 * 60)) {
      console.warn('[AUTH] Token muito antigo');
      throw new Error('Token expirado');
    }

    console.log('[AUTH] Validação JWT concluída com sucesso');
    req.user = decoded;
    req.token = token; // Salvar token para possível revogação
    next();
  } catch (error) {
    console.error('[AUTH] ERRO na validação do token:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    let message = 'Token inválido ou expirado';
    if (error.name === 'TokenExpiredError') {
      message = 'Token expirado. Faça login novamente.';
    } else if (error.name === 'JsonWebTokenError') {
      message = 'Token malformado ou inválido.';
    }
    
    return res.status(403).json({ 
      error: 'Autenticação falhou',
      message 
    });
  }
};

export const generateToken = (payload) => {
  // Validar payload
  if (!payload.userId || !payload.empresaId) {
    throw new Error('Payload inválido para geração de token');
  }

  // Adicionar claims de segurança
  const tokenPayload = {
    ...payload,
    iat: Math.floor(Date.now() / 1000),
    iss: 'clinica-estetica-api', // Emissor
    aud: 'clinica-estetica-client' // Audiência
  };

  return jwt.sign(tokenPayload, process.env.JWT_SECRET, { 
    expiresIn: '7d',
    algorithm: 'HS256'
  });
};

// Função para revogar token (logout)
export const revokeToken = (token) => {
  tokenBlacklist.add(token);
  
  // Limpar tokens antigos da blacklist (após 7 dias)
  setTimeout(() => {
    tokenBlacklist.delete(token);
  }, 7 * 24 * 60 * 60 * 1000);
};

// Middleware para validar refresh de token
export const validateTokenRefresh = (req, res, next) => {
  const { userId, empresaId } = req.user;
  
  // Verificar se o token está próximo de expirar (menos de 1 dia)
  const decoded = jwt.decode(req.token);
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = decoded.exp - now;
  
  if (timeUntilExpiry < 24 * 60 * 60) {
    // Gerar novo token
    const newToken = generateToken({ userId, empresaId });
    res.setHeader('X-New-Token', newToken);
  }
  
  next();
};
