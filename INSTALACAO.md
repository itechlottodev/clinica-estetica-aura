# 🚀 Guia de Instalação Rápida

## Passo a Passo para Rodar o Sistema

### 1️⃣ Instalar Dependências

```bash
cd clinica-estetica
npm run setup
```

Este comando irá instalar todas as dependências do backend e frontend.

### 2️⃣ Configurar PostgreSQL

**Criar o banco de dados:**

Abra o PostgreSQL (pgAdmin ou terminal) e execute:

```sql
CREATE DATABASE clinica_estetica;
```

### 3️⃣ Configurar Variáveis de Ambiente

**Copie o arquivo de exemplo:**

```bash
copy .env.example .env
```

**Edite o arquivo `.env`** e configure suas credenciais do PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinica_estetica
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_AQUI

JWT_SECRET=f9db45b630e15201659963870377e68c63467618055b85357906d441113589b9

PORT=3000
NODE_ENV=development
```

### 4️⃣ Criar Tabelas do Banco de Dados

```bash
npm run migrate
```

Este comando criará todas as tabelas necessárias no banco de dados.

### 5️⃣ (Opcional) Adicionar Dados de Exemplo

```bash
npm run seed
```

Isso criará:
- Uma clínica de exemplo: "Clínica Bella Estética"
- Usuário admin: **admin@bella.com** / **senha123**
- Procedimentos de exemplo
- Pacientes de exemplo
- Produtos de exemplo

### 6️⃣ Iniciar o Sistema

```bash
npm run dev
```

Aguarde alguns segundos e acesse:

**Frontend:** http://localhost:5173

O backend estará rodando em: http://localhost:3000

---

## 🎯 Primeiro Acesso

### Opção 1: Usar Dados de Exemplo (se rodou o seed)

1. Acesse http://localhost:5173
2. Faça login com:
   - **Email:** admin@bella.com
   - **Senha:** senha123

### Opção 2: Criar Nova Clínica

1. Acesse http://localhost:5173
2. Clique em **"Cadastrar"**
3. Preencha:
   - Nome da Clínica
   - Seu Nome
   - Email
   - Telefone (opcional)
   - Senha (mínimo 6 caracteres)
4. Clique em **"Criar Conta"**
5. Você será logado automaticamente!

---

## ⚙️ Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia backend + frontend |
| `npm run server` | Inicia apenas o backend |
| `npm run client` | Inicia apenas o frontend |
| `npm run migrate` | Executa migrations |
| `npm run seed` | Popula dados de exemplo |

---

## 🔧 Solução de Problemas

### Erro: "Cannot connect to database"

✅ Verifique se o PostgreSQL está rodando
✅ Confirme as credenciais no arquivo `.env`
✅ Certifique-se que o banco `clinica_estetica` foi criado

### Erro: "Port 3000 already in use"

✅ Altere a porta no arquivo `.env`:
```env
PORT=3001
```

### Erro: "ENOENT: no such file or directory"

✅ Execute `npm run setup` novamente
✅ Certifique-se de estar na pasta `clinica-estetica`

### Página em branco no frontend

✅ Verifique se o backend está rodando (http://localhost:3000/api/health)
✅ Abra o console do navegador (F12) para ver erros
✅ Limpe o cache do navegador (Ctrl + Shift + Delete)

---

## 📱 Testando o Sistema

### 1. Cadastrar um Paciente
- Vá em **Pacientes** → **Novo Paciente**
- Preencha nome, telefone, CPF
- Salve

### 2. Criar um Procedimento
- Vá em **Procedimentos** → **Novo Procedimento**
- Ex: "Limpeza de Pele", categoria "Facial", 60 min, R$ 150,00
- Salve

### 3. Fazer um Agendamento
- Vá em **Agendamentos** → **Novo Agendamento**
- Selecione o paciente e procedimento
- Escolha data e hora
- Salve

### 4. Visualizar Dashboard
- Vá em **Dashboard**
- Veja estatísticas, gráficos e próximos agendamentos

---

## 🎨 Personalização

### Alterar Cores

Edite `frontend/tailwind.config.js`:

```javascript
colors: {
  'aura-lightpink': '#F5B5C1',  // Cor principal
  'aura-beige': '#F5E6D3',      // Cor secundária
  'aura-neutral': '#6B4E3D',    // Cor do texto
}
```

### Alterar Logo/Nome

Edite `frontend/src/components/Layout.js` na linha do título.

---

## 📞 Suporte

Se encontrar problemas, verifique:
1. Versão do Node.js (deve ser 20+)
2. Versão do PostgreSQL (deve ser 14+)
3. Todas as dependências instaladas
4. Arquivo `.env` configurado corretamente

---

**Pronto! Seu sistema está funcionando! 🎉**
