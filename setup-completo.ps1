# Script de Setup Completo - Clinica Estetica
Write-Host "Iniciando setup do Sistema de Gestao para Clinica de Estetica..." -ForegroundColor Cyan
Write-Host ""

# 1. Criar arquivo .env
Write-Host "[1/5] Criando arquivo .env..." -ForegroundColor Yellow
$envContent = @"
# Database
DB_HOST=localhost
DB_PORT=5433
DB_NAME=clinica_estetica
DB_USER=postgres
DB_PASSWORD=postgres123

# JWT
JWT_SECRET=f9db45b630e15201659963870377e68c63467618055b85357906d441113589b9

# Server
PORT=3000
NODE_ENV=development

# Frontend
VITE_API_URL=http://localhost:3000
"@

Set-Content -Path ".env" -Value $envContent -Encoding UTF8
Write-Host "OK - Arquivo .env criado!" -ForegroundColor Green
Write-Host ""

# 2. Instalar dependências
Write-Host "[2/5] Instalando dependencias..." -ForegroundColor Yellow
npm run setup
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Dependencias instaladas!" -ForegroundColor Green
Write-Host ""

# 3. Criar banco de dados
Write-Host "[3/5] Criando banco de dados..." -ForegroundColor Yellow
$createDbScript = @'
import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'postgres123',
  database: 'postgres'
});

try {
  await client.connect();
  const checkDb = await client.query("SELECT 1 FROM pg_database WHERE datname = 'clinica_estetica'");
  
  if (checkDb.rows.length > 0) {
    console.log('Banco ja existe');
  } else {
    await client.query('CREATE DATABASE clinica_estetica');
    console.log('Banco criado com sucesso!');
  }
  await client.end();
} catch (error) {
  console.error('Erro:', error.message);
  process.exit(1);
}
'@

Set-Content -Path "backend\scripts\temp-create-db.js" -Value $createDbScript -Encoding UTF8
node backend\scripts\temp-create-db.js
Remove-Item "backend\scripts\temp-create-db.js" -ErrorAction SilentlyContinue
Write-Host ""

# 4. Executar migrations
Write-Host "[4/5] Criando tabelas do banco de dados..." -ForegroundColor Yellow
npm run migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao executar migrations" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Tabelas criadas!" -ForegroundColor Green
Write-Host ""

# 5. Popular com dados de exemplo
Write-Host "[5/5] Populando banco com dados de exemplo..." -ForegroundColor Yellow
npm run seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO ao popular banco" -ForegroundColor Red
    exit 1
}
Write-Host "OK - Dados de exemplo inseridos!" -ForegroundColor Green
Write-Host ""

# Finalização
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup concluido com sucesso!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Credenciais de teste:" -ForegroundColor Cyan
Write-Host "  Email: admin@bella.com" -ForegroundColor White
Write-Host "  Senha: senha123" -ForegroundColor White
Write-Host ""
Write-Host "Para iniciar o sistema, execute:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Acesse em: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
