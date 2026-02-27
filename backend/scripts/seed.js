import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    console.log('🌱 Iniciando seed...');

    // Criar empresa de exemplo
    const empresaResult = await pool.query(`
      INSERT INTO empresas (nome, slug, email, telefone, plano, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, ['Clínica Bella Estética', 'clinica-bella-estetica', 'contato@bella.com', '(11) 98765-4321', 'premium', 'ativo']);

    const empresaId = empresaResult.rows[0].id;
    console.log(`✅ Empresa criada: ID ${empresaId}`);

    // Criar usuário owner
    const senhaHash = await bcrypt.hash('senha123', 10);
    await pool.query(`
      INSERT INTO usuarios (empresa_id, nome, email, senha_hash, funcao)
      VALUES ($1, $2, $3, $4, $5)
    `, [empresaId, 'Admin Bella', 'admin@bella.com', senhaHash, 'owner']);
    console.log('✅ Usuário admin criado');

    // Criar formas de pagamento
    const formasPagamento = [
      'Dinheiro',
      'Cartão de Crédito',
      'Cartão de Débito',
      'PIX',
      'Transferência Bancária'
    ];

    for (const forma of formasPagamento) {
      await pool.query(`
        INSERT INTO formas_pagamento (empresa_id, nome, tipo)
        VALUES ($1, $2, $3)
      `, [empresaId, forma, forma.toLowerCase().replace(/ /g, '_')]);
    }
    console.log('✅ Formas de pagamento criadas');

    // Criar procedimentos de exemplo
    const procedimentos = [
      { nome: 'Limpeza de Pele', categoria: 'Facial', duracao: 60, valor: 150.00 },
      { nome: 'Peeling Químico', categoria: 'Facial', duracao: 45, valor: 250.00 },
      { nome: 'Drenagem Linfática', categoria: 'Corporal', duracao: 60, valor: 120.00 },
      { nome: 'Massagem Modeladora', categoria: 'Corporal', duracao: 50, valor: 140.00 },
      { nome: 'Design de Sobrancelhas', categoria: 'Sobrancelhas', duracao: 30, valor: 60.00 },
      { nome: 'Micropigmentação', categoria: 'Sobrancelhas', duracao: 120, valor: 800.00 },
      { nome: 'Maquiagem Social', categoria: 'Maquiagem', duracao: 60, valor: 180.00 },
      { nome: 'Maquiagem para Noiva', categoria: 'Maquiagem', duracao: 90, valor: 350.00 }
    ];

    for (const proc of procedimentos) {
      await pool.query(`
        INSERT INTO procedimentos (empresa_id, nome, categoria, duracao_minutos, valor)
        VALUES ($1, $2, $3, $4, $5)
      `, [empresaId, proc.nome, proc.categoria, proc.duracao, proc.valor]);
    }
    console.log('✅ Procedimentos criados');

    // Criar pacientes de exemplo
    const pacientes = [
      { nome: 'Maria Silva', email: 'maria@email.com', telefone: '(11) 91234-5678', cpf: '123.456.789-00' },
      { nome: 'Ana Santos', email: 'ana@email.com', telefone: '(11) 92345-6789', cpf: '234.567.890-11' },
      { nome: 'Juliana Costa', email: 'juliana@email.com', telefone: '(11) 93456-7890', cpf: '345.678.901-22' }
    ];

    for (const paciente of pacientes) {
      await pool.query(`
        INSERT INTO pacientes (empresa_id, nome, email, telefone, cpf)
        VALUES ($1, $2, $3, $4, $5)
      `, [empresaId, paciente.nome, paciente.email, paciente.telefone, paciente.cpf]);
    }
    console.log('✅ Pacientes criados');

    // Criar produtos de exemplo
    const produtos = [
      { nome: 'Batom Matte', categoria: 'Maquiagem', unidade: 'UN', estoque: 15, custo: 25.00, venda: 45.00 },
      { nome: 'Base Líquida', categoria: 'Maquiagem', unidade: 'UN', estoque: 10, custo: 40.00, venda: 75.00 },
      { nome: 'Sérum Facial', categoria: 'Skincare', unidade: 'UN', estoque: 8, custo: 60.00, venda: 120.00 },
      { nome: 'Máscara Facial', categoria: 'Skincare', unidade: 'UN', estoque: 20, custo: 15.00, venda: 35.00 }
    ];

    for (const produto of produtos) {
      await pool.query(`
        INSERT INTO produtos (empresa_id, nome, categoria, unidade_medida, estoque_atual, valor_custo, valor_venda)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [empresaId, produto.nome, produto.categoria, produto.unidade, produto.estoque, produto.custo, produto.venda]);
    }
    console.log('✅ Produtos criados');

    console.log('\n✨ Seed concluído com sucesso!');
    console.log('\n📝 Credenciais de acesso:');
    console.log('   Email: admin@bella.com');
    console.log('   Senha: senha123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

seed();
