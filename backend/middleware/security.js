import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

// Rate limiting para prevenir brute force e DDoS
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Rate limiting geral para API
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições
  message: 'Muitas requisições. Tente novamente em 15 minutos.',
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para criação de recursos
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 50, // 50 criações
  message: 'Limite de criações atingido. Tente novamente em 1 hora.',
  standardHeaders: true,
  legacyHeaders: false
});

// Configuração do Helmet para segurança de headers
export const helmetConfig = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' }
});

// Sanitização de dados para prevenir NoSQL Injection
export const sanitizeData = mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`Tentativa de injeção detectada: ${key} em ${req.path}`);
  }
});

// Proteção contra XSS
export const xssProtection = xss();

// Proteção contra HTTP Parameter Pollution
export const hppProtection = hpp({
  whitelist: ['limit', 'offset', 'sort', 'status', 'categoria']
});

// Middleware para validar origem das requisições
export const validateOrigin = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  const origin = req.headers.origin;
  
  if (!origin || allowedOrigins.includes(origin)) {
    next();
  } else {
    console.warn(`Origem não autorizada: ${origin}`);
    res.status(403).json({ 
      error: 'Origem não autorizada',
      message: 'Acesso negado'
    });
  }
};

// Middleware para detectar e bloquear SQL Injection
export const sqlInjectionProtection = (req, res, next) => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
    /(UNION.*SELECT)/gi,
    /(--|\#|\/\*|\*\/)/g,
    /(\bOR\b.*=.*)/gi,
    /(\bAND\b.*=.*)/gi,
    /(;.*--)/g
  ];

  const checkValue = (value) => {
    if (typeof value === 'string') {
      return sqlPatterns.some(pattern => pattern.test(value));
    }
    return false;
  };

  const checkObject = (obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          if (checkObject(value)) return true;
        } else if (checkValue(value)) {
          return true;
        }
      }
    }
    return false;
  };

  // Verificar body, query e params
  if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
    console.warn(`Tentativa de SQL Injection detectada em ${req.path}`);
    return res.status(400).json({ 
      error: 'Requisição inválida',
      message: 'Dados suspeitos detectados'
    });
  }

  next();
};

// Middleware para adicionar headers de segurança adicionais
export const securityHeaders = (req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Habilitar XSS protection no browser
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Strict Transport Security (HTTPS)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Middleware para log de segurança
export const securityLogger = (req, res, next) => {
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?.userId || 'anonymous'
  };

  // Log de ações sensíveis
  const sensitivePaths = ['/auth/login', '/auth/cadastro', '/financeiro', '/usuarios'];
  if (sensitivePaths.some(path => req.path.includes(path))) {
    console.log('[SECURITY]', JSON.stringify(logData));
  }

  next();
};

// Middleware para validar tamanho do payload
export const payloadSizeLimit = (req, res, next) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (req.headers['content-length'] && parseInt(req.headers['content-length']) > maxSize) {
    return res.status(413).json({ 
      error: 'Payload muito grande',
      message: 'O tamanho da requisição excede o limite permitido'
    });
  }
  
  next();
};

export default {
  loginLimiter,
  apiLimiter,
  createLimiter,
  helmetConfig,
  sanitizeData,
  xssProtection,
  hppProtection,
  validateOrigin,
  sqlInjectionProtection,
  securityHeaders,
  securityLogger,
  payloadSizeLimit
};
