# 🐘 Guia: Instalar PostgreSQL na Hostinger VPS

## 📋 Opções de Instalação

Você tem 2 opções na Hostinger:

### ✅ **OPÇÃO 1: Docker (RECOMENDADO - Mais Fácil)**
- Interface gráfica da Hostinger
- Configuração rápida (5 minutos)
- Fácil de gerenciar

### ⚙️ **OPÇÃO 2: Instalação Direta (Mais Controle)**
- Via SSH/Terminal
- Mais configurações manuais
- Melhor performance

---

## 🐳 OPÇÃO 1: PostgreSQL via Docker (RECOMENDADO)

### Passo 1: Acessar Gerenciador Docker

1. No painel Hostinger, clique em **"VPS"** (menu lateral)
2. Selecione sua VPS: `srv1368822.hstgr.cloud`
3. Clique em **"Gerenciador Docker"**
4. Clique no botão **"Compose"**

---

### Passo 2: Criar Container PostgreSQL

Clique em **"Compose"** e cole este código:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: clinica-postgres
    restart: always
    environment:
      POSTGRES_USER: clinica_app
      POSTGRES_PASSWORD: SUA_SENHA_FORTE_AQUI
      POSTGRES_DB: clinica_estetica
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U clinica_app"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
    driver: local
```

**⚠️ IMPORTANTE:** Altere `SUA_SENHA_FORTE_AQUI` por uma senha forte!

**Gerar senha forte:**
```bash
# No PowerShell local
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

---

### Passo 3: Iniciar Container

1. Clique em **"Deploy"** ou **"Criar"**
2. Aguarde o container iniciar (1-2 minutos)
3. Verifique se o status está **"Em execução"** (verde)

---

### Passo 4: Configurar Firewall

No painel Hostinger:

1. Vá em **"VPS"** → **"Segurança"** → **"Firewall"**
2. Adicione nova regra:
   - **Porta**: 5432
   - **Protocolo**: TCP
   - **Origem**: Anywhere (0.0.0.0/0) ou IP específico do Railway
   - **Ação**: Permitir
3. Salvar

---

### Passo 5: Obter IP da VPS

No painel Hostinger:
- Vá em **"VPS"** → **"Visão geral"**
- Copie o **IP Público** (exemplo: `123.45.67.89`)

---

### Passo 6: Testar Conexão

No seu computador local, teste a conexão:

#### Opção A: Via pgAdmin (Interface Gráfica)
1. Baixe: https://www.pgadmin.org/download/
2. Adicione novo servidor:
   - **Host**: IP da sua VPS
   - **Port**: 5432
   - **Database**: clinica_estetica
   - **Username**: clinica_app
   - **Password**: sua senha

#### Opção B: Via Terminal
```bash
# Instalar psql (se não tiver)
# Windows: https://www.postgresql.org/download/windows/

# Conectar
psql -h SEU_IP_VPS -p 5432 -U clinica_app -d clinica_estetica

# Digitar senha quando pedir
```

---

### Passo 7: Executar Migrations

No seu computador local:

1. Edite temporariamente o `.env`:
```env
DB_HOST=SEU_IP_VPS
DB_PORT=5432
DB_NAME=clinica_estetica
DB_USER=clinica_app
DB_PASSWORD=sua_senha_forte
```

2. Execute as migrations:
```bash
cd backend
npm run migrate
```

3. Execute o seed (dados iniciais):
```bash
npm run seed
```

4. Verifique se funcionou:
```bash
psql -h SEU_IP_VPS -p 5432 -U clinica_app -d clinica_estetica -c "\dt"
```

Deve listar todas as tabelas criadas.

---

## ⚙️ OPÇÃO 2: PostgreSQL Instalação Direta (Via SSH)

### Passo 1: Conectar via SSH

No painel Hostinger:
1. Vá em **"VPS"** → **"SO e painel"**
2. Clique em **"Terminal"** ou use SSH:

```bash
ssh root@srv1368822.hstgr.cloud
# Digite a senha quando pedir
```

---

### Passo 2: Instalar PostgreSQL

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Instalar PostgreSQL
apt install postgresql postgresql-contrib -y

# Verificar instalação
psql --version

# Iniciar serviço
systemctl start postgresql
systemctl enable postgresql
systemctl status postgresql
```

---

### Passo 3: Configurar PostgreSQL

```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Criar usuário e banco
CREATE USER clinica_app WITH PASSWORD 'SUA_SENHA_FORTE_AQUI';
CREATE DATABASE clinica_estetica OWNER clinica_app;
GRANT ALL PRIVILEGES ON DATABASE clinica_estetica TO clinica_app;

# Sair
\q
```

---

### Passo 4: Permitir Conexões Externas

```bash
# Editar postgresql.conf
nano /etc/postgresql/15/main/postgresql.conf

# Encontrar e alterar:
listen_addresses = '*'

# Salvar: Ctrl+O, Enter, Ctrl+X
```

```bash
# Editar pg_hba.conf
nano /etc/postgresql/15/main/pg_hba.conf

# Adicionar no final:
host    clinica_estetica    clinica_app    0.0.0.0/0    scram-sha-256

# Salvar: Ctrl+O, Enter, Ctrl+X
```

```bash
# Reiniciar PostgreSQL
systemctl restart postgresql
```

---

### Passo 5: Configurar Firewall

```bash
# Permitir PostgreSQL
ufw allow 5432/tcp

# Verificar
ufw status
```

---

## 🔐 Segurança Adicional

### 1. Restringir Acesso por IP (Recomendado)

Se souber o IP do Railway, restrinja:

```bash
# No pg_hba.conf, ao invés de 0.0.0.0/0, use:
host    clinica_estetica    clinica_app    IP_DO_RAILWAY/32    scram-sha-256
```

### 2. Usar SSL/TLS (Produção)

```bash
# Gerar certificados
cd /var/lib/postgresql/15/main
openssl req -new -x509 -days 365 -nodes -text -out server.crt -keyout server.key -subj "/CN=postgres"
chmod 600 server.key
chown postgres:postgres server.key server.crt

# Editar postgresql.conf
ssl = on
ssl_cert_file = '/var/lib/postgresql/15/main/server.crt'
ssl_key_file = '/var/lib/postgresql/15/main/server.key'

# Reiniciar
systemctl restart postgresql
```

---

## 📊 Gerenciamento do Banco

### Backup Manual

```bash
# Conectar via SSH
ssh root@srv1368822.hstgr.cloud

# Fazer backup
pg_dump -U clinica_app -h localhost clinica_estetica > backup_$(date +%Y%m%d).sql

# Restaurar backup
psql -U clinica_app -h localhost clinica_estetica < backup_20260226.sql
```

### Backup Automático (Cron)

```bash
# Criar script de backup
nano /root/backup-postgres.sh
```

Cole:
```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -U clinica_app -h localhost clinica_estetica > $BACKUP_DIR/backup_$DATE.sql

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

```bash
# Dar permissão
chmod +x /root/backup-postgres.sh

# Adicionar ao cron (diário às 3h)
crontab -e

# Adicionar linha:
0 3 * * * /root/backup-postgres.sh
```

---

## 🔍 Monitoramento

### Ver Logs

```bash
# Logs do PostgreSQL
tail -f /var/log/postgresql/postgresql-15-main.log

# Logs do Docker (se usar Docker)
docker logs -f clinica-postgres
```

### Ver Conexões Ativas

```bash
# Conectar ao banco
psql -U clinica_app -h localhost clinica_estetica

# Ver conexões
SELECT * FROM pg_stat_activity;
```

---

## 🆘 Problemas Comuns

### Erro: "Connection refused"
**Solução:**
```bash
# Verificar se PostgreSQL está rodando
systemctl status postgresql

# Verificar firewall
ufw status

# Verificar porta
netstat -tuln | grep 5432
```

### Erro: "Password authentication failed"
**Solução:**
```bash
# Resetar senha
sudo -u postgres psql
ALTER USER clinica_app WITH PASSWORD 'nova_senha';
```

### Erro: "Too many connections"
**Solução:**
```bash
# Editar postgresql.conf
nano /etc/postgresql/15/main/postgresql.conf

# Aumentar:
max_connections = 100

# Reiniciar
systemctl restart postgresql
```

---

## ✅ Checklist Final

Após instalação, verifique:

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `clinica_estetica` criado
- [ ] Usuário `clinica_app` criado
- [ ] Firewall liberado (porta 5432)
- [ ] Conexão externa funcionando
- [ ] Migrations executadas
- [ ] Seed executado (dados iniciais)
- [ ] Backup configurado

---

## 📝 Informações para o Backend (Railway)

Após configurar, use estas variáveis no Railway:

```env
DB_HOST=SEU_IP_VPS_HOSTINGER
DB_PORT=5432
DB_NAME=clinica_estetica
DB_USER=clinica_app
DB_PASSWORD=sua_senha_forte
```

---

## 🎯 Próximos Passos

1. ✅ Instalar PostgreSQL (escolha Opção 1 ou 2)
2. ✅ Testar conexão local
3. ✅ Executar migrations
4. ✅ Configurar backup
5. ✅ Deploy do backend no Railway
6. ✅ Deploy do frontend na Vercel

---

**Recomendação:** Use a **Opção 1 (Docker)** - é mais fácil e rápido! 🐳
