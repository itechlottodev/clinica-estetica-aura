# ✅ PostgreSQL Instalado - Próximos Passos

## 🎉 Status Atual
- ✅ Container PostgreSQL criado
- ✅ Status: Em execução
- ✅ Porta: 5432

---

## 📋 Próximos Passos

### 1️⃣ Configurar Firewall (IMPORTANTE!)

No painel Hostinger:

1. Vá em **"VPS"** (menu lateral esquerdo)
2. Clique em **"Segurança"** ou **"Firewall"**
3. Clique em **"Adicionar regra"** ou **"Nova regra"**
4. Configure:
   - **Nome**: PostgreSQL
   - **Porta**: 5432
   - **Protocolo**: TCP
   - **Origem**: 0.0.0.0/0 (ou IP específico do Railway)
   - **Ação**: Permitir/Allow
5. Clique em **"Salvar"** ou **"Adicionar"**

---

### 2️⃣ Obter IP Público da VPS

No painel Hostinger:

1. Vá em **"VPS"** → **"Visão geral"** ou **"Overview"**
2. Procure por **"IP Address"** ou **"Endereço IP"**
3. **Copie o IP** (exemplo: `123.45.67.89`)

**Anote este IP - você vai precisar!**

---

### 3️⃣ Testar Conexão Local

No seu computador, edite temporariamente o arquivo `.env`:

```env
DB_HOST=SEU_IP_VPS_AQUI
DB_PORT=5432
DB_NAME=clinica_estetica
DB_USER=clinica_app
DB_PASSWORD=A_SENHA_QUE_VOCE_USOU_NO_DOCKER
```

**Teste a conexão:**

```bash
cd backend
node -e "import('pg').then(pg => { const pool = new pg.Pool({ host: process.env.DB_HOST, port: 5432, database: 'clinica_estetica', user: 'clinica_app', password: 'SUA_SENHA' }); pool.query('SELECT NOW()', (err, res) => { if(err) console.error(err); else console.log('✅ Conectado!', res.rows[0]); pool.end(); }); })"
```

Ou use pgAdmin:
- Download: https://www.pgadmin.org/download/
- Host: SEU_IP_VPS
- Port: 5432
- Database: clinica_estetica
- Username: clinica_app
- Password: sua senha

---

### 4️⃣ Executar Migrations

Após confirmar que a conexão funciona:

```bash
cd backend

# Executar migrations (criar tabelas)
npm run migrate

# Executar seed (dados iniciais)
npm run seed
```

**Verificar se funcionou:**

```bash
# Listar tabelas criadas
psql -h SEU_IP_VPS -p 5432 -U clinica_app -d clinica_estetica -c "\dt"
```

Deve mostrar todas as tabelas:
- empresas
- usuarios
- pacientes
- procedimentos
- produtos
- fornecedores
- agendamentos
- atendimentos
- formas_pagamento
- contas_receber
- contas_pagar
- parcelas_pagamento

---

### 5️⃣ Informações para o Backend (Railway)

Após tudo configurado, use estas variáveis no Railway:

```env
# Database (VPS Hostinger)
DB_HOST=SEU_IP_VPS
DB_PORT=5432
DB_NAME=clinica_estetica
DB_USER=clinica_app
DB_PASSWORD=sua_senha_forte

# JWT Secret (gerar novo!)
JWT_SECRET=gerar_chave_64_bytes_aqui

# Server
PORT=3000
NODE_ENV=production

# Frontend (após deploy na Vercel)
FRONTEND_URL=https://seu-app.vercel.app
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔍 Verificar Status do Container

No painel Hostinger:

1. Vá em **"Gerenciador Docker"**
2. Clique no projeto **"clinica-postgres"**
3. Clique em **"Abrir"** ou **"Logs"**
4. Deve mostrar logs do PostgreSQL

**Logs esperados:**
```
PostgreSQL init process complete; ready for start up.
database system is ready to accept connections
```

---

## 🆘 Solução de Problemas

### Container não inicia
1. Clique em **"Logs"** no container
2. Verifique erros
3. Possíveis causas:
   - Senha com caracteres especiais problemáticos
   - Porta 5432 já em uso
   - Memória insuficiente

### Não consegue conectar
1. ✅ Firewall liberado? (porta 5432)
2. ✅ IP correto?
3. ✅ Senha correta?
4. ✅ Container rodando?

### Erro "Connection refused"
```bash
# Verificar se porta está aberta
telnet SEU_IP_VPS 5432

# Ou
nc -zv SEU_IP_VPS 5432
```

---

## 📊 Gerenciar Container

### Parar Container
1. Gerenciador Docker → clinica-postgres
2. Clique em **"Gerenciar"**
3. Clique em **"Parar"**

### Reiniciar Container
1. Gerenciador Docker → clinica-postgres
2. Clique em **"Gerenciar"**
3. Clique em **"Reiniciar"**

### Ver Logs
1. Gerenciador Docker → clinica-postgres
2. Clique em **"Logs"**

### Backup do Banco
```bash
# Conectar via SSH à VPS
ssh root@SEU_IP_VPS

# Fazer backup
docker exec clinica-postgres pg_dump -U clinica_app clinica_estetica > backup.sql

# Restaurar backup
docker exec -i clinica-postgres psql -U clinica_app clinica_estetica < backup.sql
```

---

## ✅ Checklist

Marque conforme completar:

- [ ] ✅ Container PostgreSQL rodando
- [ ] Firewall configurado (porta 5432)
- [ ] IP público anotado
- [ ] Conexão testada com sucesso
- [ ] Migrations executadas
- [ ] Seed executado
- [ ] Tabelas verificadas
- [ ] Backup configurado (opcional)

---

## 🚀 Próximos Deploys

Após completar estes passos:

1. **Deploy Frontend na Vercel** → `GUIA_DEPLOY_VERCEL.md`
2. **Deploy Backend no Railway** → `GUIA_DEPLOY_RAILWAY.md`

---

**Você está no caminho certo! 🎉**

Siga os passos acima e me avise se tiver alguma dúvida!
