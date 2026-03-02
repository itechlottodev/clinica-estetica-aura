-- Adicionar campo valor_previsto na tabela agendamentos
ALTER TABLE agendamentos 
ADD COLUMN IF NOT EXISTS valor_previsto DECIMAL(10,2);

COMMENT ON COLUMN agendamentos.valor_previsto IS 'Valor previsto do procedimento no momento do agendamento (opcional)';
