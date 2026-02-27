import pool from '../config/database.js';

const migrations = `
-- Tabela de Empresas (Multi-tenant)
CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefone VARCHAR(50),
  cnpj VARCHAR(18),
  endereco TEXT,
  plano VARCHAR(50) DEFAULT 'gratuito',
  status VARCHAR(20) DEFAULT 'ativo',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_empresas_slug ON empresas(slug);
CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas(status);

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha_hash VARCHAR(255) NOT NULL,
  funcao VARCHAR(50) DEFAULT 'usuario',
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usuarios_empresa_id ON usuarios(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);

-- Tabela de Pacientes
CREATE TABLE IF NOT EXISTS pacientes (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(50),
  cpf VARCHAR(14),
  cnpj VARCHAR(18),
  data_nascimento DATE,
  genero VARCHAR(20),
  endereco TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pacientes_empresa_id ON pacientes(empresa_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_nome ON pacientes(nome);
CREATE INDEX IF NOT EXISTS idx_pacientes_cpf ON pacientes(cpf);

-- Tabela de Procedimentos
CREATE TABLE IF NOT EXISTS procedimentos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  duracao_minutos INTEGER,
  valor DECIMAL(10, 2),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_procedimentos_empresa_id ON procedimentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_procedimentos_categoria ON procedimentos(categoria);

-- Tabela de Fornecedores
CREATE TABLE IF NOT EXISTS fornecedores (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  razao_social VARCHAR(255),
  cnpj VARCHAR(18),
  email VARCHAR(255),
  telefone VARCHAR(50),
  endereco TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_fornecedores_empresa_id ON fornecedores(empresa_id);

-- Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  fornecedor_id INTEGER REFERENCES fornecedores(id) ON DELETE SET NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(100),
  codigo_barras VARCHAR(50),
  unidade_medida VARCHAR(20),
  estoque_atual DECIMAL(10, 2) DEFAULT 0,
  estoque_minimo DECIMAL(10, 2) DEFAULT 0,
  valor_custo DECIMAL(10, 2),
  valor_venda DECIMAL(10, 2),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_produtos_empresa_id ON produtos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS agendamentos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  procedimento_id INTEGER NOT NULL REFERENCES procedimentos(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  data_hora TIMESTAMP NOT NULL,
  duracao_minutos INTEGER,
  status VARCHAR(50) DEFAULT 'agendado',
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_agendamentos_empresa_id ON agendamentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_paciente_id ON agendamentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data_hora ON agendamentos(data_hora);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON agendamentos(status);

-- Tabela de Atendimentos (Registro do que foi feito)
CREATE TABLE IF NOT EXISTS atendimentos (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  agendamento_id INTEGER REFERENCES agendamentos(id) ON DELETE SET NULL,
  paciente_id INTEGER NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
  procedimento_id INTEGER NOT NULL REFERENCES procedimentos(id) ON DELETE CASCADE,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
  data_hora TIMESTAMP NOT NULL,
  valor_total DECIMAL(10, 2),
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_atendimentos_empresa_id ON atendimentos(empresa_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_paciente_id ON atendimentos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_atendimentos_data_hora ON atendimentos(data_hora);

-- Tabela de Formas de Pagamento
CREATE TABLE IF NOT EXISTS formas_pagamento (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome VARCHAR(100) NOT NULL,
  tipo VARCHAR(50),
  ativo BOOLEAN DEFAULT true,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_formas_pagamento_empresa_id ON formas_pagamento(empresa_id);

-- Tabela de Contas a Receber
CREATE TABLE IF NOT EXISTS contas_receber (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  atendimento_id INTEGER REFERENCES atendimentos(id) ON DELETE SET NULL,
  paciente_id INTEGER REFERENCES pacientes(id) ON DELETE SET NULL,
  forma_pagamento_id INTEGER REFERENCES formas_pagamento(id) ON DELETE SET NULL,
  descricao VARCHAR(255),
  valor DECIMAL(10, 2) NOT NULL,
  valor_pago DECIMAL(10, 2) DEFAULT 0,
  data_vencimento DATE,
  data_pagamento DATE,
  status VARCHAR(50) DEFAULT 'pendente',
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contas_receber_empresa_id ON contas_receber(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON contas_receber(status);
CREATE INDEX IF NOT EXISTS idx_contas_receber_vencimento ON contas_receber(data_vencimento);

-- Tabela de Contas a Pagar
CREATE TABLE IF NOT EXISTS contas_pagar (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  fornecedor_id INTEGER REFERENCES fornecedores(id) ON DELETE SET NULL,
  forma_pagamento_id INTEGER REFERENCES formas_pagamento(id) ON DELETE SET NULL,
  descricao VARCHAR(255) NOT NULL,
  categoria VARCHAR(100),
  valor DECIMAL(10, 2) NOT NULL,
  valor_pago DECIMAL(10, 2) DEFAULT 0,
  data_vencimento DATE,
  data_pagamento DATE,
  status VARCHAR(50) DEFAULT 'pendente',
  observacoes TEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_contas_pagar_empresa_id ON contas_pagar(empresa_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_vencimento ON contas_pagar(data_vencimento);

-- Tabela de Parcelas de Pagamento
CREATE TABLE IF NOT EXISTS parcelas_pagamento (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  atendimento_id INTEGER REFERENCES atendimentos(id) ON DELETE CASCADE,
  conta_receber_id INTEGER REFERENCES contas_receber(id) ON DELETE CASCADE,
  forma_pagamento_id INTEGER REFERENCES formas_pagamento(id) ON DELETE SET NULL,
  numero_parcela INTEGER,
  total_parcelas INTEGER,
  valor DECIMAL(10, 2) NOT NULL,
  data_vencimento DATE,
  data_pagamento DATE,
  status VARCHAR(50) DEFAULT 'pendente',
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parcelas_empresa_id ON parcelas_pagamento(empresa_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_atendimento_id ON parcelas_pagamento(atendimento_id);
`;

async function runMigrations() {
  try {
    console.log('🚀 Iniciando migrations...');
    await pool.query(migrations);
    console.log('✅ Migrations executadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    process.exit(1);
  }
}

runMigrations();
