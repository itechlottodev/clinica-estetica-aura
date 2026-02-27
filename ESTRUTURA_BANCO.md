# 🗄️ Estrutura do Banco de Dados

## Visão Geral

Banco de dados **PostgreSQL** com arquitetura **Multi-Tenant** (isolamento por `empresa_id`).

Todos os nomes de tabelas e campos estão em **português PT-BR**.

---

## 📊 Diagrama de Relacionamentos

```
empresas (1) ──┬──> (N) usuarios
               ├──> (N) pacientes
               ├──> (N) procedimentos
               ├──> (N) produtos
               ├──> (N) fornecedores
               ├──> (N) agendamentos
               ├──> (N) atendimentos
               ├──> (N) formas_pagamento
               ├──> (N) contas_receber
               └──> (N) contas_pagar

pacientes (1) ──┬──> (N) agendamentos
                ├──> (N) atendimentos
                └──> (N) contas_receber

procedimentos (1) ──┬──> (N) agendamentos
                    └──> (N) atendimentos

fornecedores (1) ──┬──> (N) produtos
                   └──> (N) contas_pagar

atendimentos (1) ──┬──> (N) contas_receber
                   └──> (N) parcelas_pagamento
```

---

## 📋 Tabelas Detalhadas

### 🏢 empresas
Armazena as clínicas cadastradas no sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| nome | VARCHAR(255) | Nome da clínica |
| slug | VARCHAR(255) | URL-friendly (único) |
| email | VARCHAR(255) | Email da clínica (único) |
| telefone | VARCHAR(50) | Telefone |
| cnpj | VARCHAR(18) | CNPJ da clínica |
| endereco | TEXT | Endereço completo |
| plano | VARCHAR(50) | gratuito, premium, enterprise |
| status | VARCHAR(20) | ativo, suspenso, cancelado |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

**Índices:** slug, status

---

### 👤 usuarios
Usuários do sistema (profissionais da clínica).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| empresa_id | INTEGER | FK → empresas |
| nome | VARCHAR(255) | Nome do usuário |
| email | VARCHAR(255) | Email (único) |
| senha_hash | VARCHAR(255) | Senha criptografada (bcrypt) |
| funcao | VARCHAR(50) | owner, admin, usuario |
| ativo | BOOLEAN | Usuário ativo? |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

**Índices:** empresa_id, email

**Funções:**
- `owner`: Dono da clínica (acesso total)
- `admin`: Administrador (quase tudo)
- `usuario`: Usuário comum (operacional)

---

### 🧑‍⚕️ pacientes
Pacientes/clientes da clínica.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| empresa_id | INTEGER | FK → empresas |
| nome | VARCHAR(255) | Nome completo |
| email | VARCHAR(255) | Email |
| telefone | VARCHAR(50) | Telefone |
| cpf | VARCHAR(14) | CPF |
| cnpj | VARCHAR(18) | CNPJ (para empresas) |
| data_nascimento | DATE | Data de nascimento |
| genero | VARCHAR(20) | Feminino, Masculino, Outro |
| endereco | TEXT | Endereço completo |
| observacoes | TEXT | Observações gerais |
| ativo | BOOLEAN | Paciente ativo? |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

**Índices:** empresa_id, nome, cpf

---

### 💆 procedimentos
Procedimentos/serviços oferecidos pela clínica.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| empresa_id | INTEGER | FK → empresas |
| nome | VARCHAR(255) | Nome do procedimento |
| descricao | TEXT | Descrição detalhada |
| categoria | VARCHAR(100) | Facial, Corporal, Sobrancelhas, Maquiagem |
| duracao_minutos | INTEGER | Duração em minutos |
| valor | DECIMAL(10,2) | Valor do procedimento |
| ativo | BOOLEAN | Procedimento ativo? |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

**Índices:** empresa_id, categoria

---

### 🏭 fornecedores
Fornecedores de produtos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| empresa_id | INTEGER | FK → empresas |
| nome | VARCHAR(255) | Nome fantasia |
| razao_social | VARCHAR(255) | Razão social |
| cnpj | VARCHAR(18) | CNPJ |
| email | VARCHAR(255) | Email |
| telefone | VARCHAR(50) | Telefone |
| endereco | TEXT | Endereço |
| observacoes | TEXT | Observações |
| ativo | BOOLEAN | Fornecedor ativo? |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

**Índices:** empresa_id

---

### 📦 produtos
Produtos para venda (batom, base, etc).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| empresa_id | INTEGER | FK → empresas |
| fornecedor_id | INTEGER | FK → fornecedores (opcional) |
| nome | VARCHAR(255) | Nome do produto |
| descricao | TEXT | Descrição |
| categoria | VARCHAR(100) | Maquiagem, Skincare, etc |
| codigo_barras | VARCHAR(50) | Código de barras |
| unidade_medida | VARCHAR(20) | UN, CX, KG, L, ML |
| estoque_atual | DECIMAL(10,2) | Quantidade em estoque |
| estoque_minimo | DECIMAL(10,2) | Estoque mínimo (alerta) |
| valor_custo | DECIMAL(10,2) | Valor de custo |
| valor_venda | DECIMAL(10,2) | Valor de venda |
| ativo | BOOLEAN | Produto ativo? |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

**Índices:** empresa_id, categoria

---

### 📅 agendamentos
Agendamentos de procedimentos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| empresa_id | INTEGER | FK → empresas |
| paciente_id | INTEGER | FK → pacientes |
| procedimento_id | INTEGER | FK → procedimentos |
| usuario_id | INTEGER | FK → usuarios (profissional) |
| data_hora | TIMESTAMP | Data e hora do agendamento |
| duracao_minutos | INTEGER | Duração |
| status | VARCHAR(50) | agendado, confirmado, concluido, cancelado |
| observacoes | TEXT | Observações |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

**Índices:** empresa_id, paciente_id, data_hora, status

---

### 💉 atendimentos
Registro de atendimentos realizados.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| empresa_id | INTEGER | FK → empresas |
| agendamento_id | INTEGER | FK → agendamentos (opcional) |
| paciente_id | INTEGER | FK → pacientes |
| procedimento_id | INTEGER | FK → procedimentos |
| usuario_id | INTEGER | FK → usuarios |
| data_hora | TIMESTAMP | Data/hora do atendimento |
| valor_total | DECIMAL(10,2) | Valor total cobrado |
| observacoes | TEXT | Observações |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

**Índices:** empresa_id, paciente_id, data_hora

---

### 💳 formas_pagamento
Formas de pagamento aceitas.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| empresa_id | INTEGER | FK → empresas |
| nome | VARCHAR(100) | Dinheiro, Cartão, PIX, etc |
| tipo | VARCHAR(50) | Tipo da forma de pagamento |
| ativo | BOOLEAN | Forma ativa? |
| criado_em | TIMESTAMP | Data de criação |

**Índices:** empresa_id

**Formas padrão criadas no cadastro:**
- Dinheiro
- Cartão de Crédito
- Cartão de Débito
- PIX

---

### 💰 contas_receber
Contas a receber (valores que clientes devem).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| empresa_id | INTEGER | FK → empresas |
| atendimento_id | INTEGER | FK → atendimentos (opcional) |
| paciente_id | INTEGER | FK → pacientes (opcional) |
| forma_pagamento_id | INTEGER | FK → formas_pagamento (opcional) |
| descricao | VARCHAR(255) | Descrição da conta |
| valor | DECIMAL(10,2) | Valor total |
| valor_pago | DECIMAL(10,2) | Valor já pago |
| data_vencimento | DATE | Data de vencimento |
| data_pagamento | DATE | Data do pagamento |
| status | VARCHAR(50) | pendente, parcial, pago |
| observacoes | TEXT | Observações |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

**Índices:** empresa_id, status, data_vencimento

---

### 💸 contas_pagar
Contas a pagar (despesas da clínica).

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| empresa_id | INTEGER | FK → empresas |
| fornecedor_id | INTEGER | FK → fornecedores (opcional) |
| forma_pagamento_id | INTEGER | FK → formas_pagamento (opcional) |
| descricao | VARCHAR(255) | Descrição da despesa |
| categoria | VARCHAR(100) | Aluguel, Energia, etc |
| valor | DECIMAL(10,2) | Valor total |
| valor_pago | DECIMAL(10,2) | Valor já pago |
| data_vencimento | DATE | Data de vencimento |
| data_pagamento | DATE | Data do pagamento |
| status | VARCHAR(50) | pendente, parcial, pago |
| observacoes | TEXT | Observações |
| criado_em | TIMESTAMP | Data de criação |
| atualizado_em | TIMESTAMP | Última atualização |

**Índices:** empresa_id, status, data_vencimento

---

### 📊 parcelas_pagamento
Parcelas de pagamento de atendimentos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | SERIAL | Chave primária |
| empresa_id | INTEGER | FK → empresas |
| atendimento_id | INTEGER | FK → atendimentos |
| conta_receber_id | INTEGER | FK → contas_receber |
| forma_pagamento_id | INTEGER | FK → formas_pagamento |
| numero_parcela | INTEGER | Número da parcela (1, 2, 3...) |
| total_parcelas | INTEGER | Total de parcelas (3, 6, 12...) |
| valor | DECIMAL(10,2) | Valor da parcela |
| data_vencimento | DATE | Data de vencimento |
| data_pagamento | DATE | Data do pagamento |
| status | VARCHAR(50) | pendente, pago |
| criado_em | TIMESTAMP | Data de criação |

**Índices:** empresa_id, atendimento_id

---

## 🔐 Regras de Isolamento Multi-Tenant

### ✅ Todas as queries DEVEM incluir `empresa_id`

**Exemplo correto:**
```sql
SELECT * FROM pacientes WHERE empresa_id = $1 AND id = $2
```

**Exemplo ERRADO (vazamento de dados):**
```sql
SELECT * FROM pacientes WHERE id = $1  -- ❌ NUNCA FAZER ISSO
```

### ✅ Validação de relacionamentos

Ao criar/editar registros que referenciam outros, validar que pertencem à mesma empresa:

```sql
-- Validar que o paciente pertence à empresa
SELECT id FROM pacientes WHERE id = $1 AND empresa_id = $2

-- Validar que o procedimento pertence à empresa
SELECT id FROM procedimentos WHERE id = $1 AND empresa_id = $2
```

---

## 📈 Queries Úteis

### Total de pacientes por empresa
```sql
SELECT empresa_id, COUNT(*) as total
FROM pacientes
WHERE ativo = true
GROUP BY empresa_id;
```

### Receita do mês por empresa
```sql
SELECT empresa_id, SUM(valor_total) as receita
FROM atendimentos
WHERE data_hora >= DATE_TRUNC('month', CURRENT_DATE)
GROUP BY empresa_id;
```

### Produtos com estoque baixo
```sql
SELECT nome, estoque_atual, estoque_minimo
FROM produtos
WHERE empresa_id = $1
  AND estoque_atual <= estoque_minimo
  AND ativo = true;
```

### Contas a receber vencidas
```sql
SELECT * FROM contas_receber
WHERE empresa_id = $1
  AND status IN ('pendente', 'parcial')
  AND data_vencimento < CURRENT_DATE
ORDER BY data_vencimento ASC;
```

---

**Banco de dados completo e pronto para uso! 🎉**
