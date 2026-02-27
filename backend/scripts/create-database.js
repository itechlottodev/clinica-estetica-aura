import pg from 'pg';
const { Client } = pg;

const config = {
  host: 'localhost',
  port: 1533,
  user: 'postgres',
  password: 'postgres123',
  database: 'postgres' // Conecta ao banco padrão primeiro
};

async function createDatabase() {
  const client = new Client(config);
  
  try {
    await client.connect();
    console.log('✅ Conectado ao PostgreSQL');

    // Verifica se o banco já existe
    const checkDb = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'clinica_estetica'"
    );

    if (checkDb.rows.length > 0) {
      console.log('⚠️  Banco de dados "clinica_estetica" já existe');
    } else {
      // Cria o banco de dados
      await client.query('CREATE DATABASE clinica_estetica');
      console.log('✅ Banco de dados "clinica_estetica" criado com sucesso!');
    }

    await client.end();
    console.log('\n🎉 Pronto! Agora execute: npm run migrate');
    
  } catch (error) {
    console.error('❌ Erro ao criar banco de dados:', error.message);
    process.exit(1);
  }
}

createDatabase();
