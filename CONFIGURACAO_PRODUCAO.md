# 🚀 Configuração para Produção

## 🔐 Configurar Senhas e Credenciais de Produção

### 1. Gerar Senha Forte para PostgreSQL

Use um gerador de senhas ou execute no PowerShell:

```powershell
# Gerar senha aleatória forte (32 caracteres)
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

Ou use um gerador online:
- https://passwordsgenerator.net/
- Configuração recomendada: 32 caracteres, letras + números + símbolos

**Exemplo de senha forte:**
```
Kp9#mL2$xR5@nQ8!wT3&vB7*cF4^dH6
```

---

### 2. Configurar PostgreSQL em Produção

#### No servidor de produção, altere a senha do PostgreSQL:

```sql
-- Conectar ao PostgreSQL como superusuário
psql -U postgres

-- Alterar senha do usuário postgres
ALTER USER postgres WITH PASSWORD 'SUA_SENHA_FORTE_AQUI';

-- Ou criar um usuário específico para a aplicação (RECOMENDADO)
CREATE USER clinica_app WITH PASSWORD 'SUA_SENHA_FORTE_AQUI';
GRANT ALL PRIVILEGES ON DATABASE clinica_estetica TO clinica_app;
```

---

### 3. Criar arquivo .env de Produção

**NO SERVIDOR DE PRODUÇÃO**, crie o arquivo `.env`:

```env
# Database - PRODUÇÃO
DB_HOST=localhost
DB_PORT=5433
DB_NAME=clinica_estetica
DB_USER=clinica_app
DB_PASSWORD=SUA_SENHA_FORTE_DO_POSTGRESQL_AQUI

# JWT Secret - PRODUÇÃO (GERAR NOVO!)
JWT_SECRET=GERAR_CHAVE_UNICA_FORTE_AQUI

# Server
PORT=3000
NODE_ENV=production

# Frontend URL
FRONTEND_URL=https://seu-dominio.com
```

---

### 4. Gerar JWT_SECRET para Produção

Execute no servidor de produção (Node.js):

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Ou no PowerShell:

```powershell
# Gerar chave aleatória de 64 bytes em hexadecimal
-join ((48..57) + (97..102) | Get-Random -Count 128 | ForEach-Object {[char]$_})
```

**Copie o resultado** e use como `JWT_SECRET` no `.env` de produção.

---

### 5. Checklist de Segurança para Produção

Antes de fazer deploy:

- [ ] ✅ Senha do PostgreSQL alterada (forte, 32+ caracteres)
- [ ] ✅ JWT_SECRET único gerado (64+ caracteres)
- [ ] ✅ NODE_ENV=production
- [ ] ✅ FRONTEND_URL configurado com domínio real
- [ ] ✅ Arquivo .env NÃO está no repositório Git
- [ ] ✅ Firewall configurado (apenas portas necessárias)
- [ ] ✅ HTTPS/SSL configurado
- [ ] ✅ Backup automático configurado
- [ ] ✅ Logs de segurança habilitados

---

## 🔄 Diferenças: Desenvolvimento vs Produção

### Desenvolvimento (Local)
```env
DB_PASSWORD=postgres123          # Senha simples, OK para local
JWT_SECRET=chave_desenvolvimento # Pode ser simples
NODE_ENV=development             # Mostra erros detalhados
FRONTEND_URL=http://localhost:5173
```

### Produção (Servidor)
```env
DB_PASSWORD=Kp9#mL2$xR5@nQ8!wT3&vB7*cF4^dH6  # Senha FORTE
JWT_SECRET=a7f3c9e2b8d4f1a6c3e9b2d8f4a1c7e3...  # Chave ÚNICA
NODE_ENV=production                            # Oculta detalhes de erro
FRONTEND_URL=https://clinica-aura.com.br       # Domínio real
```

---

## 📦 Deploy Passo a Passo

### 1. No Servidor de Produção

```bash
# Clonar repositório
git clone https://github.com/itechlottodev/clinica-estetica-aura.git
cd clinica-estetica-aura

# Criar arquivo .env (NUNCA copie do local!)
nano .env
# Cole as configurações de produção

# Instalar dependências
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..

# Executar migrations
npm run migrate

# Executar seed (opcional - apenas primeira vez)
npm run seed

# Testar segurança
cd backend && npm run test-security

# Iniciar aplicação
npm start
```

---

### 2. Usar PM2 para Manter Rodando

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação com PM2
pm2 start npm --name "clinica-backend" -- run server
pm2 start npm --name "clinica-frontend" -- run client

# Salvar configuração
pm2 save

# Configurar para iniciar no boot
pm2 startup
```

---

## 🔒 Boas Práticas de Segurança

### 1. Nunca Commitar Senhas
```bash
# Verificar se .env está no .gitignore
cat .gitignore | grep .env
```

### 2. Usar Variáveis de Ambiente do Sistema (Opcional)
Em vez de arquivo `.env`, pode usar variáveis do sistema:

```bash
# Linux/Mac
export DB_PASSWORD="senha_forte"
export JWT_SECRET="chave_forte"

# Windows PowerShell
$env:DB_PASSWORD="senha_forte"
$env:JWT_SECRET="chave_forte"
```

### 3. Rotacionar Senhas Regularmente
- Alterar senhas a cada 90 dias
- Alterar imediatamente se houver suspeita de comprometimento

### 4. Backup de Configurações
- Manter backup seguro do `.env` de produção
- Armazenar em local criptografado (ex: 1Password, LastPass)
- NUNCA no repositório Git

---

## 🆘 Recuperação de Senha PostgreSQL

Se esquecer a senha do PostgreSQL:

### Windows
1. Editar `pg_hba.conf` (geralmente em `C:\Program Files\PostgreSQL\XX\data\`)
2. Mudar `md5` para `trust` temporariamente
3. Reiniciar PostgreSQL
4. Alterar senha: `ALTER USER postgres PASSWORD 'nova_senha';`
5. Reverter `trust` para `md5`
6. Reiniciar PostgreSQL novamente

### Linux
```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nova_senha';
```

---

## 📊 Monitoramento em Produção

### Logs Importantes
```bash
# Ver logs do PM2
pm2 logs

# Ver logs do PostgreSQL
tail -f /var/log/postgresql/postgresql-XX-main.log

# Ver logs da aplicação
tail -f logs/app.log
```

### Métricas
```bash
# Status do PM2
pm2 status

# Monitoramento em tempo real
pm2 monit
```

---

## 🔐 Exemplo Completo de .env Produção

```env
# ===========================================
# CONFIGURAÇÃO DE PRODUÇÃO - NÃO COMMITAR!
# ===========================================

# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=clinica_estetica
DB_USER=clinica_app
DB_PASSWORD=Kp9#mL2$xR5@nQ8!wT3&vB7*cF4^dH6

# JWT Secret (64 bytes hex)
JWT_SECRET=a7f3c9e2b8d4f1a6c3e9b2d8f4a1c7e3b9f5d2a8e4c1f7b3d9e5a2c8f4b1d7e3a9c5f2b8d4e1a7c3f9b5d2e8a4c1f7b3d9e5a2c8f4b1d7e3

# Server
PORT=3000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://clinica-aura.com.br

# Email (se configurar)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=contato@clinica-aura.com.br
SMTP_PASS=senha_email_forte

# Backup
BACKUP_PATH=/var/backups/clinica-estetica
```

---

**IMPORTANTE**: 
- ✅ Mantenha este arquivo `.env` APENAS no servidor
- ✅ Faça backup em local seguro
- ✅ NUNCA envie para o Git
- ✅ Use senhas diferentes para cada ambiente

---

**Última atualização**: 25 de Fevereiro de 2026
