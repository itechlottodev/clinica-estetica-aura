import pool from '../config/database.js';

async function updateEmpresaNome() {
  try {
    console.log('Atualizando nome da empresa...');

    const result = await pool.query(`
      UPDATE empresas 
      SET nome = 'Aura', slug = 'aura'
      WHERE slug = 'clinica-bella-estetica'
      RETURNING id, nome
    `);

    if (result.rows.length > 0) {
      console.log('✅ Empresa atualizada:', result.rows[0]);
    } else {
      console.log('⚠️  Empresa não encontrada');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

updateEmpresaNome();
