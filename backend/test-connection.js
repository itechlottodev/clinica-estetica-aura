import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: '187.77.41.104',
  port: 5432,
  database: 'clinica_estetica',
  user: 'clinica_app',
  password: '7kR9mP2vB5nX8zQ1wL4tG7sJ0fH3dC6y',
  connectionTimeoutMillis: 5000
});

console.log('🔄 Testando conexão com PostgreSQL na VPS...\n');

pool.query('SELECT NOW() as agora, version() as versao', (err, res) => {
  if (err) {
    console.error('❌ Erro ao conectar:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Conectado com sucesso!\n');
    console.log('📅 Data/Hora do servidor:', res.rows[0].agora);
    console.log('🐘 Versão PostgreSQL:', res.rows[0].versao.split(',')[0]);
    console.log('\n✅ Banco de dados pronto para uso!');
  }
  pool.end();
});
