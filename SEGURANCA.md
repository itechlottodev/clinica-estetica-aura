# 🔒 Documentação de Segurança - Sistema Aura

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Proteções Implementadas](#proteções-implementadas)
3. [Configurações de Segurança](#configurações-de-segurança)
4. [Boas Práticas](#boas-práticas)
5. [Checklist de Segurança](#checklist-de-segurança)
6. [Monitoramento e Logs](#monitoramento-e-logs)
7. [Resposta a Incidentes](#resposta-a-incidentes)

---

## 🛡️ Visão Geral

O Sistema Aura implementa múltiplas camadas de segurança para proteger contra diversos tipos de ataques e vulnerabilidades comuns em aplicações web.

### Princípios de Segurança
- **Defesa em Profundidade**: Múltiplas camadas de proteção
- **Princípio do Menor Privilégio**: Acesso mínimo necessário
- **Segurança por Design**: Segurança desde a concepção
- **Fail Secure**: Falhar de forma segura

---

## 🔐 Proteções Implementadas

### 1. Proteção contra Injeção SQL
**Vulnerabilidade**: Atacantes podem inserir código SQL malicioso em inputs.

**Proteções**:
- ✅ **Prepared Statements**: Todas as queries usam parametrização
- ✅ **Validação de Input**: Middleware detecta padrões SQL suspeitos
- ✅ **Sanitização**: Remoção de caracteres especiais perigosos

**Exemplo de Proteção**:
```javascript
// ❌ VULNERÁVEL
const query = `SELECT * FROM usuarios WHERE email = '${email}'`;

// ✅ SEGURO
const query = 'SELECT * FROM usuarios WHERE email = $1';
pool.query(query, [email]);
```

**Middleware**: `sqlInjectionProtection` em `middleware/security.js`

---

### 2. Proteção contra XSS (Cross-Site Scripting)
**Vulnerabilidade**: Injeção de scripts maliciosos no navegador.

**Proteções**:
- ✅ **xss-clean**: Sanitização automática de inputs
- ✅ **Content Security Policy**: Headers CSP configurados
- ✅ **Escape de Output**: Dados escapados antes de exibição

**Headers Configurados**:
```
Content-Security-Policy: default-src 'self'
X-XSS-Protection: 1; mode=block
X-Content-Type-Options: nosniff
```

**Middleware**: `xssProtection` em `middleware/security.js`

---

### 3. Proteção contra CSRF (Cross-Site Request Forgery)
**Vulnerabilidade**: Requisições não autorizadas em nome do usuário.

**Proteções**:
- ✅ **Validação de Origem**: Verificação do header Origin
- ✅ **CORS Restrito**: Apenas origens permitidas
- ✅ **SameSite Cookies**: Cookies com flag SameSite

**Configuração CORS**:
```javascript
cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
})
```

**Middleware**: `validateOrigin` em `middleware/security.js`

---

### 4. Rate Limiting (Proteção contra Brute Force e DDoS)
**Vulnerabilidade**: Ataques de força bruta e sobrecarga do servidor.

**Proteções**:
- ✅ **Login Limiter**: 5 tentativas a cada 15 minutos
- ✅ **API Limiter**: 100 requisições a cada 15 minutos
- ✅ **Create Limiter**: 50 criações por hora

**Configuração**:
```javascript
// Login: 5 tentativas / 15 min
loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Muitas tentativas de login'
});

// API Geral: 100 req / 15 min
apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
```

**Middleware**: `loginLimiter`, `apiLimiter`, `createLimiter` em `middleware/security.js`

---

### 5. Autenticação JWT Robusta
**Vulnerabilidade**: Tokens comprometidos ou mal configurados.

**Proteções**:
- ✅ **Algoritmo Específico**: Apenas HS256 permitido
- ✅ **Validação de Claims**: Issuer, Audience, Expiration
- ✅ **Token Blacklist**: Revogação de tokens comprometidos
- ✅ **Refresh Automático**: Renovação próximo à expiração

**Configuração JWT**:
```javascript
jwt.sign(payload, secret, {
  expiresIn: '7d',
  algorithm: 'HS256',
  issuer: 'clinica-estetica-api',
  audience: 'clinica-estetica-client'
});
```

**Middleware**: `authenticateToken` em `middleware/auth.js`

---

### 6. Proteção de Headers HTTP (Helmet)
**Vulnerabilidade**: Exposição de informações sensíveis via headers.

**Proteções**:
- ✅ **Helmet**: Configuração automática de headers seguros
- ✅ **X-Frame-Options**: DENY (previne clickjacking)
- ✅ **HSTS**: Força HTTPS
- ✅ **Referrer-Policy**: Controla informações de referência

**Headers Configurados**:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

**Middleware**: `helmetConfig`, `securityHeaders` em `middleware/security.js`

---

### 7. Proteção contra HPP (HTTP Parameter Pollution)
**Vulnerabilidade**: Manipulação de parâmetros duplicados.

**Proteções**:
- ✅ **hpp**: Middleware para prevenir poluição de parâmetros
- ✅ **Whitelist**: Apenas parâmetros permitidos podem ser duplicados

**Configuração**:
```javascript
hpp({
  whitelist: ['limit', 'offset', 'sort', 'status', 'categoria']
});
```

**Middleware**: `hppProtection` em `middleware/security.js`

---

### 8. Sanitização de Dados
**Vulnerabilidade**: Injeção de dados maliciosos.

**Proteções**:
- ✅ **express-mongo-sanitize**: Remove caracteres perigosos
- ✅ **express-validator**: Validação e normalização
- ✅ **Trim e Escape**: Limpeza de strings

**Exemplo**:
```javascript
body('email').isEmail().normalizeEmail()
body('nome').trim().escape()
```

**Middleware**: `sanitizeData` em `middleware/security.js`

---

### 9. Limitação de Payload
**Vulnerabilidade**: Ataques de negação de serviço via payloads grandes.

**Proteções**:
- ✅ **Limite de 10MB**: Rejeita requisições muito grandes
- ✅ **Validação de Content-Length**: Verificação antes do processamento

**Configuração**:
```javascript
express.json({ limit: '10mb' })
express.urlencoded({ extended: true, limit: '10mb' })
```

**Middleware**: `payloadSizeLimit` em `middleware/security.js`

---

### 10. Criptografia de Senhas
**Vulnerabilidade**: Senhas em texto plano ou com hash fraco.

**Proteções**:
- ✅ **bcryptjs**: Algoritmo de hash robusto
- ✅ **Salt Rounds**: 10 rounds (recomendado)
- ✅ **Nunca armazenar senha em texto plano**

**Implementação**:
```javascript
const senhaHash = await bcrypt.hash(senha, 10);
const senhaValida = await bcrypt.compare(senha, senhaHash);
```

---

## ⚙️ Configurações de Segurança

### Variáveis de Ambiente Críticas

```env
# JWT Secret - DEVE ser alterado em produção
JWT_SECRET=f9db45b630e15201659963870377e68c63467618055b85357906d441113589b9

# Ambiente
NODE_ENV=production

# URL do Frontend (para CORS)
FRONTEND_URL=https://seu-dominio.com

# Banco de Dados
DB_HOST=localhost
DB_PORT=5433
DB_NAME=clinica_estetica
DB_USER=postgres
DB_PASSWORD=senha_forte_aqui
```

### Configuração de Produção

**IMPORTANTE**: Antes de ir para produção:

1. ✅ Alterar `JWT_SECRET` para um valor único e forte
2. ✅ Definir `NODE_ENV=production`
3. ✅ Configurar `FRONTEND_URL` com domínio real
4. ✅ Usar HTTPS (SSL/TLS)
5. ✅ Configurar firewall
6. ✅ Habilitar logs de auditoria
7. ✅ Implementar backup automático
8. ✅ Configurar monitoramento

---

## 📝 Boas Práticas

### Para Desenvolvedores

1. **Nunca commitar secrets**
   - Use `.gitignore` para `.env`
   - Use variáveis de ambiente
   - Nunca hardcode credenciais

2. **Validar todos os inputs**
   - Use express-validator
   - Sanitize dados do usuário
   - Nunca confie em dados do cliente

3. **Usar prepared statements**
   - Sempre parametrize queries
   - Nunca concatene SQL

4. **Logs seguros**
   - Não logar senhas ou tokens
   - Logar tentativas de acesso suspeitas
   - Usar níveis de log apropriados

5. **Atualizar dependências**
   ```bash
   npm audit
   npm audit fix
   npm outdated
   ```

### Para Administradores

1. **Senhas fortes**
   - Mínimo 12 caracteres
   - Letras, números e símbolos
   - Não reutilizar senhas

2. **Backup regular**
   - Backup diário do banco de dados
   - Testar restauração
   - Armazenar em local seguro

3. **Monitoramento**
   - Monitorar logs de erro
   - Alertas para tentativas de login falhadas
   - Monitorar uso de recursos

4. **Atualizações**
   - Manter sistema operacional atualizado
   - Atualizar Node.js e dependências
   - Aplicar patches de segurança

---

## ✅ Checklist de Segurança

### Antes de Deploy

- [ ] JWT_SECRET alterado
- [ ] NODE_ENV=production
- [ ] HTTPS configurado
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativado
- [ ] Logs configurados
- [ ] Backup configurado
- [ ] Firewall configurado
- [ ] Dependências atualizadas
- [ ] Testes de segurança realizados

### Manutenção Regular

- [ ] Revisar logs semanalmente
- [ ] Atualizar dependências mensalmente
- [ ] Testar backup mensalmente
- [ ] Revisar acessos trimestralmente
- [ ] Auditoria de segurança anualmente

---

## 📊 Monitoramento e Logs

### Logs de Segurança

O sistema registra automaticamente:

- ✅ Tentativas de login (sucesso e falha)
- ✅ Tentativas de SQL Injection
- ✅ Requisições bloqueadas por rate limiting
- ✅ Erros de autenticação
- ✅ Acessos a rotas sensíveis

**Exemplo de Log**:
```json
{
  "timestamp": "2026-02-25T10:00:00.000Z",
  "level": "SECURITY",
  "method": "POST",
  "path": "/api/auth/login",
  "ip": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "userId": "anonymous",
  "event": "login_attempt"
}
```

### Métricas Importantes

Monitorar:
- Taxa de requisições por IP
- Tentativas de login falhadas
- Erros 401/403
- Tempo de resposta
- Uso de memória/CPU

---

## 🚨 Resposta a Incidentes

### Em caso de suspeita de ataque:

1. **Identificar**
   - Revisar logs
   - Identificar padrão de ataque
   - Identificar IPs suspeitos

2. **Conter**
   - Bloquear IPs maliciosos
   - Revogar tokens comprometidos
   - Desativar contas afetadas

3. **Erradicar**
   - Corrigir vulnerabilidade
   - Atualizar sistema
   - Aplicar patches

4. **Recuperar**
   - Restaurar dados se necessário
   - Reativar serviços
   - Notificar usuários afetados

5. **Aprender**
   - Documentar incidente
   - Atualizar procedimentos
   - Melhorar monitoramento

### Contatos de Emergência

- Administrador do Sistema: [seu-email@exemplo.com]
- Suporte Técnico: [suporte@exemplo.com]
- Equipe de Segurança: [seguranca@exemplo.com]

---

## 🔧 Ferramentas de Segurança

### Testes de Segurança

```bash
# Auditoria de dependências
npm audit

# Verificar vulnerabilidades conhecidas
npm audit fix

# Análise de código estático
npm install -g eslint
eslint .

# Testes de penetração (usar com cuidado!)
# OWASP ZAP, Burp Suite, etc.
```

### Monitoramento em Produção

Recomendações:
- **Sentry**: Monitoramento de erros
- **LogRocket**: Gravação de sessões
- **Datadog**: Métricas e logs
- **New Relic**: Performance monitoring

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 📞 Suporte

Para questões de segurança, entre em contato:
- Email: seguranca@exemplo.com
- Reportar vulnerabilidade: security@exemplo.com

**Política de Divulgação Responsável**: Reportamos vulnerabilidades de forma responsável e agradecemos pesquisadores de segurança que nos ajudam a melhorar.

---

**Última atualização**: 25 de Fevereiro de 2026

**Versão**: 1.0.0

**Status**: ✅ Implementado e Ativo
