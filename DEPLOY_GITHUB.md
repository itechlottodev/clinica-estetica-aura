# 🚀 Guia de Deploy no GitHub

## 📋 Passo a Passo Completo

### 1️⃣ Criar Repositório no GitHub

1. Acesse: https://github.com/new
2. Preencha:
   - **Repository name**: `clinica-estetica-aura` (ou nome de sua preferência)
   - **Description**: `Sistema de gerenciamento para clínicas estéticas - Multi-tenant SaaS`
   - **Visibility**: 
     - ✅ **Private** (recomendado para projetos comerciais)
     - ⚪ Public (se quiser código aberto)
   - **NÃO marque**: "Initialize this repository with a README"
3. Clique em **"Create repository"**
4. **Copie a URL** que aparecerá (exemplo: `https://github.com/seu-usuario/clinica-estetica-aura.git`)

---

### 2️⃣ Configurar Git Local (Execute no Terminal)

Abra o PowerShell/Terminal na pasta do projeto:

```powershell
cd "e:\Projetos\Agenda Kati\clinica-estetica"
```

#### Inicializar Git
```bash
git init
```

#### Configurar seu nome e email (se ainda não configurou)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu-email@exemplo.com"
```

#### Adicionar todos os arquivos
```bash
git add .
```

#### Fazer o primeiro commit
```bash
git commit -m "🎉 Commit inicial - Sistema Aura para clínicas estéticas

- Sistema multi-tenant completo
- Backend: Node.js + Express + PostgreSQL
- Frontend: Vite + Vanilla JS + Tailwind CSS
- 10 camadas de segurança implementadas
- 8 páginas funcionais (Login, Dashboard, CRUD)
- Documentação completa"
```

---

### 3️⃣ Conectar ao GitHub

Substitua `SEU-USUARIO` e `SEU-REPOSITORIO` pela URL que você copiou:

```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
```

**Exemplo:**
```bash
git remote add origin https://github.com/joaosilva/clinica-estetica-aura.git
```

#### Verificar se conectou corretamente
```bash
git remote -v
```

Deve aparecer:
```
origin  https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git (fetch)
origin  https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git (push)
```

---

### 4️⃣ Enviar para o GitHub

#### Renomear branch para main (padrão do GitHub)
```bash
git branch -M main
```

#### Fazer o push
```bash
git push -u origin main
```

**Se pedir autenticação:**
- **Username**: seu usuário do GitHub
- **Password**: use um **Personal Access Token** (não a senha da conta)

---

### 5️⃣ Criar Personal Access Token (se necessário)

Se o GitHub pedir senha e não aceitar:

1. Acesse: https://github.com/settings/tokens
2. Clique em **"Generate new token"** → **"Generate new token (classic)"**
3. Configure:
   - **Note**: `Clinica Estetica Aura`
   - **Expiration**: 90 days (ou No expiration)
   - **Scopes**: Marque `repo` (acesso completo aos repositórios)
4. Clique em **"Generate token"**
5. **COPIE O TOKEN** (você não verá novamente!)
6. Use o token como senha no `git push`

---

## ✅ Verificar se Funcionou

Acesse seu repositório no GitHub:
```
https://github.com/SEU-USUARIO/SEU-REPOSITORIO
```

Você deve ver:
- ✅ Todos os arquivos do projeto
- ✅ README.md renderizado
- ✅ Estrutura de pastas (backend, frontend)
- ✅ Documentação (SEGURANCA.md, INSTALACAO.md, etc)

---

## 🔄 Comandos Úteis para o Futuro

### Adicionar mudanças
```bash
git add .
git commit -m "Descrição das mudanças"
git push
```

### Ver status
```bash
git status
```

### Ver histórico
```bash
git log --oneline
```

### Criar nova branch
```bash
git checkout -b feature/nova-funcionalidade
```

### Voltar para main
```bash
git checkout main
```

---

## 📁 O que será enviado

✅ **Será enviado:**
- Código fonte (backend + frontend)
- Documentação (README, SEGURANCA, etc)
- Scripts de setup
- Configurações (package.json, vite.config.js, etc)
- .env.example (template de variáveis)

❌ **NÃO será enviado** (protegido pelo .gitignore):
- node_modules/
- .env (suas credenciais)
- Logs
- Arquivos de build

---

## 🔒 Segurança

### ⚠️ IMPORTANTE: Verifique antes do push

Certifique-se que o arquivo `.env` NÃO está sendo enviado:

```bash
git status
```

Se aparecer `.env` na lista, **NÃO FAÇA PUSH!**

Remova com:
```bash
git rm --cached .env
git commit -m "Remove .env do repositório"
```

### Verificar .gitignore
```bash
cat .gitignore
```

Deve conter:
```
.env
node_modules/
*.log
```

---

## 🎯 Próximos Passos Após Push

1. ✅ Adicionar descrição no GitHub
2. ✅ Adicionar topics/tags: `nodejs`, `express`, `postgresql`, `saas`, `clinic-management`
3. ✅ Criar releases quando tiver versões estáveis
4. ✅ Configurar GitHub Actions (CI/CD) - opcional
5. ✅ Adicionar badge de status no README - opcional

---

## 🆘 Problemas Comuns

### Erro: "Permission denied"
**Solução**: Use Personal Access Token ao invés da senha

### Erro: "Repository not found"
**Solução**: Verifique se a URL está correta com `git remote -v`

### Erro: "Updates were rejected"
**Solução**: 
```bash
git pull origin main --rebase
git push
```

### Arquivo .env foi enviado por engano
**Solução URGENTE**:
1. Remova o arquivo:
   ```bash
   git rm .env
   git commit -m "Remove sensitive .env file"
   git push
   ```
2. **ALTERE TODAS AS SENHAS E SECRETS IMEDIATAMENTE**
3. Considere tornar o repositório privado

---

## 📞 Suporte

Se tiver problemas:
1. Verifique se o Git está instalado: `git --version`
2. Verifique se está na pasta correta: `pwd` (Linux/Mac) ou `cd` (Windows)
3. Verifique o status: `git status`

---

**Pronto! Seu projeto estará seguro no GitHub e você poderá trabalhar de qualquer lugar!** 🎉
