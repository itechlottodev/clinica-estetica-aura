import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

// Middlewares de segurança
import {
  helmetConfig,
  sanitizeData,
  xssProtection,
  hppProtection,
  validateOrigin,
  sqlInjectionProtection,
  securityHeaders,
  securityLogger,
  payloadSizeLimit,
  apiLimiter
} from './middleware/security.js';

// Rotas
import authRoutes from './routes/auth.js';
import pacientesRoutes from './routes/pacientes.js';
import procedimentosRoutes from './routes/procedimentos.js';
import produtosRoutes from './routes/produtos.js';
import fornecedoresRoutes from './routes/fornecedores.js';
import agendamentosRoutes from './routes/agendamentos.js';
import atendimentosRoutes from './routes/atendimentos.js';
import financeiroRoutes from './routes/financeiro.js';
import dashboardRoutes from './routes/dashboard.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (importante para rate limiting e logs de IP corretos)
app.set('trust proxy', 1);

// Middlewares de segurança (ordem importa!)
app.use(helmetConfig); // Helmet deve ser o primeiro
app.use(securityHeaders); // Headers de segurança adicionais
app.use(morgan('combined')); // Logging de requisições
app.use(cookieParser()); // Parser de cookies
app.use(payloadSizeLimit); // Limitar tamanho do payload
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeData); // Sanitização de dados
app.use(xssProtection); // Proteção XSS
app.use(hppProtection); // Proteção HPP
app.use(sqlInjectionProtection); // Proteção SQL Injection
app.use(securityLogger); // Log de segurança
app.use(validateOrigin); // Validar origem

// Rate limiting global
app.use('/api/', apiLimiter);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/procedimentos', procedimentosRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/agendamentos', agendamentosRoutes);
app.use('/api/atendimentos', atendimentosRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API Clínica Estética funcionando' });
});

// Tratamento de erros 404
app.use((req, res) => {
  console.warn(`[404] Rota não encontrada: ${req.method} ${req.path}`);
  res.status(404).json({ 
    error: 'Rota não encontrada',
    message: 'O recurso solicitado não existe'
  });
});

// Tratamento de erros global
app.use((err, req, res, next) => {
  // Log do erro (em produção, usar serviço de logging)
  console.error('[ERROR]', {
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip
  });

  // Não expor detalhes do erro em produção
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Erros de validação
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Erro de validação',
      message: isDevelopment ? err.message : 'Dados inválidos fornecidos',
      details: isDevelopment ? err.details : undefined
    });
  }

  // Erros de JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      error: 'Erro de autenticação',
      message: 'Token inválido ou expirado'
    });
  }

  // Erro genérico
  res.status(err.status || 500).json({ 
    error: 'Erro interno do servidor',
    message: isDevelopment ? err.message : 'Ocorreu um erro. Tente novamente.',
    stack: isDevelopment ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 API: http://localhost:${PORT}/api`);
});
