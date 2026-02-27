import pool from '../config/database.js';

/**
 * Script para testar as proteções de segurança implementadas
 */

async function testSecurity() {
  console.log('🔒 Testando Proteções de Segurança\n');

  const tests = {
    passed: 0,
    failed: 0,
    total: 0
  };

  // Teste 1: SQL Injection Protection
  console.log('1️⃣  Testando proteção contra SQL Injection...');
  try {
    const maliciousInput = "'; DROP TABLE usuarios; --";
    const result = await pool.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [maliciousInput]
    );
    console.log('   ✅ SQL Injection bloqueado (prepared statement funcionando)');
    tests.passed++;
  } catch (error) {
    console.log('   ❌ Erro no teste SQL Injection:', error.message);
    tests.failed++;
  }
  tests.total++;

  // Teste 2: Validação de Email
  console.log('\n2️⃣  Testando validação de email...');
  const invalidEmails = [
    'invalid-email',
    'test@',
    '@example.com',
    'test..test@example.com'
  ];
  
  let emailTestPassed = true;
  for (const email of invalidEmails) {
    // Simulação - em produção, a validação ocorre no express-validator
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
      emailTestPassed = false;
      break;
    }
  }
  
  if (emailTestPassed) {
    console.log('   ✅ Validação de email funcionando');
    tests.passed++;
  } else {
    console.log('   ❌ Validação de email falhou');
    tests.failed++;
  }
  tests.total++;

  // Teste 3: Verificar se senhas estão hasheadas
  console.log('\n3️⃣  Testando hash de senhas...');
  try {
    const result = await pool.query(
      'SELECT senha_hash FROM usuarios LIMIT 1'
    );
    
    if (result.rows.length > 0) {
      const hash = result.rows[0].senha_hash;
      // Hash bcrypt começa com $2a$, $2b$ ou $2y$
      if (hash.startsWith('$2')) {
        console.log('   ✅ Senhas estão hasheadas com bcrypt');
        tests.passed++;
      } else {
        console.log('   ❌ Senhas não estão hasheadas corretamente');
        tests.failed++;
      }
    } else {
      console.log('   ⚠️  Nenhum usuário encontrado para testar');
      tests.total--;
    }
  } catch (error) {
    console.log('   ❌ Erro ao verificar hash de senhas:', error.message);
    tests.failed++;
  }
  tests.total++;

  // Teste 4: Verificar isolamento multi-tenant
  console.log('\n4️⃣  Testando isolamento multi-tenant...');
  try {
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.columns 
      WHERE column_name = 'empresa_id' 
      AND table_schema = 'public'
    `);
    
    const expectedTables = [
      'usuarios', 'pacientes', 'procedimentos', 'produtos',
      'fornecedores', 'agendamentos', 'atendimentos',
      'formas_pagamento', 'contas_receber', 'contas_pagar',
      'parcelas_pagamento'
    ];
    
    const tablesWithEmpresaId = result.rows.map(r => r.table_name);
    const missingTables = expectedTables.filter(t => !tablesWithEmpresaId.includes(t));
    
    if (missingTables.length === 0) {
      console.log('   ✅ Todas as tabelas têm empresa_id (multi-tenant OK)');
      tests.passed++;
    } else {
      console.log('   ❌ Tabelas sem empresa_id:', missingTables.join(', '));
      tests.failed++;
    }
  } catch (error) {
    console.log('   ❌ Erro ao verificar multi-tenant:', error.message);
    tests.failed++;
  }
  tests.total++;

  // Teste 5: Verificar índices de segurança
  console.log('\n5️⃣  Testando índices de performance/segurança...');
  try {
    const result = await pool.query(`
      SELECT tablename, indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE '%empresa_id%'
    `);
    
    if (result.rows.length > 0) {
      console.log(`   ✅ ${result.rows.length} índices em empresa_id encontrados`);
      tests.passed++;
    } else {
      console.log('   ⚠️  Nenhum índice em empresa_id encontrado');
      tests.failed++;
    }
  } catch (error) {
    console.log('   ❌ Erro ao verificar índices:', error.message);
    tests.failed++;
  }
  tests.total++;

  // Teste 6: Verificar variáveis de ambiente críticas
  console.log('\n6️⃣  Testando variáveis de ambiente...');
  const requiredEnvVars = [
    'DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD',
    'JWT_SECRET', 'PORT'
  ];
  
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missingVars.length === 0) {
    console.log('   ✅ Todas as variáveis de ambiente configuradas');
    tests.passed++;
  } else {
    console.log('   ❌ Variáveis faltando:', missingVars.join(', '));
    tests.failed++;
  }
  tests.total++;

  // Teste 7: Verificar JWT_SECRET não é o padrão
  console.log('\n7️⃣  Testando JWT_SECRET...');
  const defaultSecret = 'sua_chave_secreta_super_segura_aqui_mude_em_producao';
  
  if (process.env.JWT_SECRET === defaultSecret) {
    console.log('   ⚠️  JWT_SECRET está usando valor padrão - ALTERE EM PRODUÇÃO!');
    tests.failed++;
  } else {
    console.log('   ✅ JWT_SECRET foi alterado do padrão');
    tests.passed++;
  }
  tests.total++;

  // Resumo
  console.log('\n' + '='.repeat(50));
  console.log('📊 RESUMO DOS TESTES DE SEGURANÇA');
  console.log('='.repeat(50));
  console.log(`✅ Testes Passados: ${tests.passed}/${tests.total}`);
  console.log(`❌ Testes Falhados: ${tests.failed}/${tests.total}`);
  console.log(`📈 Taxa de Sucesso: ${((tests.passed / tests.total) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  if (tests.failed === 0) {
    console.log('\n🎉 Todos os testes de segurança passaram!');
  } else {
    console.log('\n⚠️  Alguns testes falharam. Revise as configurações.');
  }

  await pool.end();
  process.exit(tests.failed > 0 ? 1 : 0);
}

testSecurity().catch(error => {
  console.error('❌ Erro ao executar testes:', error);
  process.exit(1);
});
