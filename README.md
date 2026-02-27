# 🏥 Sistema de Gestão para Clínica de Estética

Sistema SaaS Multi-Tenant completo para gestão de clínicas de estética, desenvolvido com Node.js, Express, PostgreSQL, Vite e Tailwind CSS.

## 🎯 Funcionalidades

### 📋 Gestão de Pacientes
- Cadastro completo de pacientes (CPF/CNPJ, dados pessoais)
- Histórico de atendimentos
- Busca e filtros avançados

### 💆 Procedimentos e Serviços
- Cadastro de procedimentos estéticos
- Categorização (Facial, Corporal, Sobrancelhas, Maquiagem)
- Controle de duração e valores

### 📅 Agendamentos
- Calendário de atendimentos
- Controle de status (agendado, confirmado, concluído, cancelado)
- Visualização por período

### 💄 Produtos
- Cadastro de produtos (batom, base, etc.)
- Controle de estoque
- Alertas de estoque mínimo
- Valores de custo e venda

### 🏢 Fornecedores
- Cadastro de fornecedores
- Vinculação com produtos
- Dados completos (CNPJ, contatos)

### 💰 Financeiro
- **Contas a Receber**: Controle de pagamentos de clientes
- **Contas a Pagar**: Gestão de despesas
- Múltiplas formas de pagamento
- Pagamentos parcelados
- Saldo pendente por atendimento
- Dashboard financeiro com totalizadores

### 📊 Dashboard
- Visão geral do negócio
- Gráficos de receita
- Procedimentos mais realizados
- Próximos agendamentos
- Indicadores financeiros

## 🏗️ Arquitetura Multi-Tenant

Sistema preparado para múltiplas clínicas com **isolamento total de dados**:
- Cada clínica tem seus próprios dados
- Banco de dados compartilhado com isolamento lógico
- Planos: Gratuito, Premium, Enterprise
- Escalável para centenas de clínicas

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** + **Express.js**
- **PostgreSQL** (banco de dados)
- **JWT** (autenticação)
- **bcryptjs** (criptografia de senhas)
- **express-validator** (validação)

### Frontend
- **Vite** (build tool)
- **Vanilla JavaScript** (ES6+)
- **Tailwind CSS** (estilização)
- **Hash-based routing**

## 📦 Instalação

### Pré-requisitos
- Node.js 20+
- PostgreSQL 14+
- npm ou yarn

### 1. Clone o repositório
```bash
cd clinica-estetica
```

### 2. Instale as dependências
```bash
npm run setup
```

### 3. Configure o banco de dados

Crie um banco de dados PostgreSQL:
```sql
CREATE DATABASE clinica_estetica;
```

### 4. Configure as variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e configure:
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinica_estetica
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=f9db45b630e15201659963870377e68c63467618055b85357906d441113589b9

# Server
PORT=3000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3000
```

### 5. Execute as migrations
```bash
npm run migrate
```

### 6. (Opcional) Popule com dados de exemplo
```bash
npm run seed
```

Credenciais de teste:
- **Email**: admin@bella.com
- **Senha**: senha123

### 7. Copie a imagem de fundo

Copie o arquivo `Fundo.png` para a pasta `frontend/public/`:
```bash
copy "e:\Projetos\Agenda Kati\Fundo.png" "frontend\public\Fundo.png"
```

### 8. Inicie o sistema
```bash
npm run dev
```

O sistema estará disponível em:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

## 📁 Estrutura do Projeto

```
clinica-estetica/
├── backend/
│   ├── config/
│   │   └── database.js          # Configuração PostgreSQL
│   ├── middleware/
│   │   ├── auth.js              # Autenticação JWT
│   │   └── tenant.js            # Isolamento multi-tenant
│   ├── routes/
│   │   ├── auth.js              # Login/Cadastro
│   │   ├── pacientes.js         # CRUD Pacientes
│   │   ├── procedimentos.js     # CRUD Procedimentos
│   │   ├── produtos.js          # CRUD Produtos
│   │   ├── fornecedores.js      # CRUD Fornecedores
│   │   ├── agendamentos.js      # CRUD Agendamentos
│   │   ├── atendimentos.js      # Registro de atendimentos
│   │   ├── financeiro.js        # Contas a pagar/receber
│   │   └── dashboard.js         # Estatísticas
│   ├── scripts/
│   │   ├── migrate.js           # Migrations
│   │   └── seed.js              # Dados de exemplo
│   ├── server.js                # Servidor Express
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── Fundo.png            # Imagem de fundo do login
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.js        # Layout principal
│   │   │   ├── Modal.js         # Componente de modal
│   │   │   └── Toast.js         # Notificações
│   │   ├── pages/
│   │   │   ├── Login.js         # Login/Cadastro
│   │   │   ├── Dashboard.js     # Dashboard
│   │   │   ├── Pacientes.js     # Gestão de pacientes
│   │   │   ├── Procedimentos.js # Gestão de procedimentos
│   │   │   ├── Agendamentos.js  # Calendário
│   │   │   ├── Produtos.js      # Gestão de produtos
│   │   │   ├── Fornecedores.js  # Gestão de fornecedores
│   │   │   └── Financeiro.js    # Financeiro
│   │   ├── utils/
│   │   │   ├── api.js           # Cliente HTTP
│   │   │   ├── auth.js          # Autenticação
│   │   │   └── format.js        # Formatadores
│   │   ├── main.js              # Router
│   │   └── style.css            # Estilos Tailwind
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🗄️ Banco de Dados

### Tabelas Principais (todas com `empresa_id` para isolamento)

- **empresas** - Clínicas cadastradas
- **usuarios** - Usuários do sistema
- **pacientes** - Pacientes/Clientes
- **procedimentos** - Serviços oferecidos
- **produtos** - Produtos para venda
- **fornecedores** - Fornecedores
- **agendamentos** - Agendamentos
- **atendimentos** - Atendimentos realizados
- **formas_pagamento** - Formas de pagamento
- **contas_receber** - Contas a receber
- **contas_pagar** - Contas a pagar
- **parcelas_pagamento** - Parcelas de pagamento

Todos os nomes de tabelas e campos estão em **português PT-BR**.

## 🔐 Segurança

- ✅ Senhas criptografadas com bcrypt
- ✅ Autenticação JWT com expiração de 7 dias
- ✅ Isolamento total de dados entre empresas
- ✅ Validação de inputs com express-validator
- ✅ Proteção contra SQL injection (prepared statements)
- ✅ CORS configurado

## 🎨 Design

- Interface moderna e responsiva
- Cores personalizadas (tons de rosa e bege)
- Fontes: Poppins e Playfair Display
- Mobile-first approach
- Sidebar desktop + Bottom navigation mobile

## 📱 Responsividade

- ✅ Desktop (1024px+)
- ✅ Tablet (768px - 1023px)
- ✅ Mobile (< 768px)

## 🚀 Scripts Disponíveis

```bash
# Desenvolvimento (backend + frontend)
npm run dev

# Apenas backend
npm run server

# Apenas frontend
npm run client

# Migrations
npm run migrate

# Seed (dados de exemplo)
npm run seed

# Setup completo
npm run setup
```

## 📝 Fluxo de Cadastro

### Nova Clínica
1. Acesse a tela de login
2. Clique em "Cadastrar"
3. Preencha os dados da clínica e do usuário
4. Sistema cria automaticamente:
   - Empresa
   - Usuário owner
   - Formas de pagamento padrão
5. Login automático

### Novo Atendimento com Pagamento
1. Registre o atendimento
2. Informe o valor total
3. Adicione formas de pagamento:
   - À vista: valor é registrado como pago
   - Parcelado: cria parcelas automáticas
4. Saldo pendente gera conta a receber

## 🔄 Próximas Melhorias

- [ ] Upload de fotos antes/depois
- [ ] Prontuário eletrônico completo
- [ ] Integração WhatsApp
- [ ] Relatórios em PDF
- [ ] Gráficos avançados
- [ ] Backup automático
- [ ] Notificações push
- [ ] App mobile

## 📄 Licença

MIT

## 👨‍💻 Suporte

Para dúvidas e suporte, entre em contato.

---

**Desenvolvido com ❤️ para clínicas de estética**
