# 🏗️ Arquitetura de Deploy - Sistema Aura

## 📊 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                         USUÁRIOS                            │
│                    (Navegador Web)                          │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                        │
│              Vite + Vanilla JS + Tailwind                   │
│           https://clinica-aura.vercel.app                   │
└────────────────────┬────────────────────────────────────────┘
                     │ API Calls (HTTPS)
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              BACKEND (Recomendação abaixo)                  │
│              Node.js + Express + JWT                        │
│           https://api.clinica-aura.com                      │
└────────────────────┬────────────────────────────────────────┘
                     │ PostgreSQL Connection
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           DATABASE (VPS Hostinger Linux)                    │
│                   PostgreSQL 15+                            │
│              IP Privado ou Público                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Sua Arquitetura Escolhida

### ✅ Frontend: **Vercel** (Excelente escolha!)
- ✅ Deploy automático via GitHub
- ✅ CDN global (super rápido)
- ✅ HTTPS automático
- ✅ Grátis para projetos pessoais
- ✅ Rollback fácil

### ✅ Database: **VPS Hostinger Linux** (Boa escolha!)
- ✅ Controle total do PostgreSQL
- ✅ Custo-benefício
- ✅ Backup manual ou automatizado
- ✅ Acesso SSH completo

### ❓ Backend: **Recomendações**

---

## 🚀 Recomendações para Backend

### 🥇 **OPÇÃO 1: Railway** (MAIS RECOMENDADO)
**Por que escolher:**
- ✅ Deploy direto do GitHub (igual Vercel)
- ✅ Suporta Node.js nativamente
- ✅ Variáveis de ambiente fáceis
- ✅ Logs em tempo real
- ✅ Escala automaticamente
- ✅ $5/mês (plano Hobby) - 500h/mês
- ✅ SSL/HTTPS automático
- ✅ Domínio customizado grátis

**Preço:** $5/mês (Hobby) ou $20/mês (Pro)

**Ideal para:** Projetos pequenos a médios

---

### 🥈 **OPÇÃO 2: Render** (Alternativa ao Railway)
**Por que escolher:**
- ✅ Deploy automático do GitHub
- ✅ Plano gratuito disponível (com limitações)
- ✅ SSL automático
- ✅ Fácil configuração
- ✅ Boa documentação

**Preço:** Grátis (com sleep após inatividade) ou $7/mês

**Ideal para:** Testes ou projetos com baixo tráfego

---

### 🥉 **OPÇÃO 3: Digital Ocean App Platform**
**Por que escolher:**
- ✅ Infraestrutura confiável
- ✅ Deploy do GitHub
- ✅ Boa performance
- ✅ Escala fácil

**Preço:** $5/mês (Basic) - $12/mês (Professional)

**Ideal para:** Projetos que vão crescer

---

### 💰 **OPÇÃO 4: VPS Hostinger (mesma da DB)**
**Por que escolher:**
- ✅ Tudo no mesmo servidor (mais barato)
- ✅ Controle total
- ✅ Sem custos adicionais

**Preço:** Já incluído na VPS

**Desvantagens:**
- ❌ Precisa configurar tudo manualmente
- ❌ Precisa gerenciar PM2, Nginx, SSL
- ❌ Mais trabalho de manutenção

**Ideal para:** Quem tem experiência com Linux

---

### 🏆 **MINHA RECOMENDAÇÃO: Railway**

**Por quê?**
1. ✅ Simplicidade igual Vercel (deploy automático)
2. ✅ Preço justo ($5/mês)
3. ✅ Conecta fácil com PostgreSQL externo
4. ✅ Logs e monitoramento inclusos
5. ✅ SSL automático
6. ✅ Escala quando precisar

---

## 📋 Comparação Detalhada

| Característica | Railway | Render | Digital Ocean | VPS Hostinger |
|----------------|---------|--------|---------------|---------------|
| **Preço/mês** | $5 | Grátis/$7 | $5-12 | Incluído |
| **Deploy Auto** | ✅ | ✅ | ✅ | ❌ |
| **SSL Auto** | ✅ | ✅ | ✅ | ❌ (manual) |
| **Facilidade** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |
| **Escalabilidade** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Controle** | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Manutenção** | Baixa | Baixa | Baixa | Alta |

---

## 🎯 Arquitetura Recomendada Final

```
Frontend (Vercel)
    ↓ HTTPS
Backend (Railway) ← Minha recomendação
    ↓ PostgreSQL
Database (VPS Hostinger)
```

**Custo Total Estimado:**
- Vercel: Grátis
- Railway: $5/mês
- VPS Hostinger: ~$10-20/mês (já tem)
- **TOTAL: ~$5/mês** (além da VPS que já tem)

---

## 🔧 Configuração por Serviço

### 1️⃣ **Frontend (Vercel)**

#### Passo a Passo:
1. Acesse: https://vercel.com
2. Conecte com GitHub
3. Selecione o repositório `clinica-estetica-aura`
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

#### Variáveis de Ambiente (Vercel):
```env
VITE_API_URL=https://api.clinica-aura.railway.app
```

---

### 2️⃣ **Backend (Railway) - RECOMENDADO**

#### Passo a Passo:
1. Acesse: https://railway.app
2. Login com GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Selecione `clinica-estetica-aura`
5. Configure:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`

#### Variáveis de Ambiente (Railway):
```env
# Database (VPS Hostinger)
DB_HOST=seu-ip-vps-hostinger.com
DB_PORT=5432
DB_NAME=clinica_estetica
DB_USER=clinica_app
DB_PASSWORD=senha_forte_postgresql

# JWT
JWT_SECRET=chave_gerada_64_bytes

# Server
PORT=3000
NODE_ENV=production

# Frontend
FRONTEND_URL=https://clinica-aura.vercel.app
```

#### Domínio Customizado (Railway):
- Railway fornece: `seu-app.railway.app`
- Ou configure domínio próprio: `api.clinica-aura.com`

---

### 3️⃣ **Database (VPS Hostinger Linux)**

#### Passo a Passo:

##### A. Conectar via SSH
```bash
ssh root@seu-ip-vps-hostinger.com
```

##### B. Instalar PostgreSQL
```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Verificar instalação
psql --version
```

##### C. Configurar PostgreSQL
```bash
# Entrar no PostgreSQL
sudo -u postgres psql

# Criar usuário e banco
CREATE USER clinica_app WITH PASSWORD 'senha_forte_aqui';
CREATE DATABASE clinica_estetica OWNER clinica_app;
GRANT ALL PRIVILEGES ON DATABASE clinica_estetica TO clinica_app;

# Sair
\q
```

##### D. Permitir Conexões Externas
```bash
# Editar postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf

# Encontrar e alterar:
listen_addresses = '*'

# Editar pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Adicionar no final (substitua IP_DO_RAILWAY):
host    clinica_estetica    clinica_app    0.0.0.0/0    md5

# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

##### E. Configurar Firewall
```bash
# Permitir PostgreSQL
sudo ufw allow 5432/tcp

# Verificar status
sudo ufw status
```

##### F. Executar Migrations
```bash
# No seu computador local, conecte ao banco remoto
# Edite temporariamente o .env para apontar para VPS

DB_HOST=seu-ip-vps-hostinger.com
DB_PORT=5432
DB_NAME=clinica_estetica
DB_USER=clinica_app
DB_PASSWORD=senha_forte

# Execute migrations
npm run migrate

# Execute seed (primeira vez)
npm run seed
```

---

## 🔐 Segurança da VPS

### Configurações Essenciais:

```bash
# 1. Criar usuário não-root
sudo adduser deploy
sudo usermod -aG sudo deploy

# 2. Configurar firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 5432/tcp
sudo ufw status

# 3. Desabilitar login root via SSH
sudo nano /etc/ssh/sshd_config
# Alterar: PermitRootLogin no
sudo systemctl restart sshd

# 4. Instalar fail2ban (proteção contra brute force)
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🔄 Fluxo de Deploy Completo

### 1. Desenvolvimento Local
```bash
# Fazer alterações
git add .
git commit -m "Nova funcionalidade"
git push origin main
```

### 2. Deploy Automático
- ✅ **Vercel**: Detecta push → Build → Deploy (2-3 min)
- ✅ **Railway**: Detecta push → Build → Deploy (2-3 min)
- ✅ **Database**: Já está rodando na VPS

### 3. Verificação
- Frontend: https://clinica-aura.vercel.app
- Backend: https://seu-app.railway.app/api/health
- Database: Conectado via Railway

---

## 📊 Monitoramento

### Vercel
- Dashboard: https://vercel.com/dashboard
- Logs em tempo real
- Analytics inclusos

### Railway
- Dashboard: https://railway.app/dashboard
- Logs em tempo real
- Métricas de CPU/RAM
- Alertas de erro

### VPS Hostinger
```bash
# Ver status PostgreSQL
sudo systemctl status postgresql

# Ver logs PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-15-main.log

# Monitorar recursos
htop
```

---

## 💰 Estimativa de Custos

### Cenário 1: Railway (Recomendado)
- Vercel: **Grátis**
- Railway: **$5/mês**
- VPS Hostinger: **$10-20/mês** (já tem)
- **TOTAL: ~$15-25/mês**

### Cenário 2: Render (Economia)
- Vercel: **Grátis**
- Render: **Grátis** (com limitações)
- VPS Hostinger: **$10-20/mês** (já tem)
- **TOTAL: ~$10-20/mês**

### Cenário 3: Tudo na VPS (Mais barato)
- Vercel: **Grátis**
- Backend na VPS: **Incluído**
- Database na VPS: **Incluído**
- **TOTAL: ~$10-20/mês** (só VPS)

---

## 🎯 Minha Recomendação Final

### Para Começar (Melhor Custo-Benefício):
```
✅ Frontend: Vercel (Grátis)
✅ Backend: Railway ($5/mês)
✅ Database: VPS Hostinger (já tem)
```

**Por quê?**
- Fácil de configurar (2-3 horas)
- Deploy automático
- Escalável
- Custo baixo ($5/mês)
- Manutenção mínima

### Quando Crescer:
Migrar backend para Digital Ocean App Platform ou manter na Railway (escala automaticamente).

---

## 📝 Próximos Passos

1. ✅ Enviar código para GitHub (já está pronto)
2. ✅ Configurar PostgreSQL na VPS Hostinger
3. ✅ Deploy do Frontend na Vercel
4. ✅ Deploy do Backend no Railway
5. ✅ Testar integração completa
6. ✅ Configurar domínio customizado (opcional)

---

**Quer que eu crie guias detalhados para cada serviço?** 🚀
