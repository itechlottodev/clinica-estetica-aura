# 🚀 Guia de Deploy - Frontend na Vercel

## 📋 Pré-requisitos

- ✅ Código no GitHub
- ✅ Conta na Vercel (gratuita)
- ✅ Backend rodando (Railway ou VPS)

---

## 🎯 Passo a Passo Completo

### **1️⃣ Enviar Código para o GitHub**

Se ainda não enviou, execute:

```powershell
# Na pasta raiz do projeto
cd "e:\Projetos\Agenda Kati\clinica-estetica"

# Inicializar Git (se ainda não fez)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "🎉 Sistema Aura completo - Pronto para deploy"

# Conectar ao GitHub (substitua pela sua URL)
git remote add origin https://github.com/itechlottodev/clinica-estetica-aura.git

# Enviar para GitHub
git branch -M main
git push -u origin main
```

---

### **2️⃣ Criar Projeto na Vercel**

1. Acesse: **https://vercel.com**
2. Clique em **"Sign Up"** ou **"Login"**
3. Escolha **"Continue with GitHub"**
4. Autorize a Vercel a acessar seus repositórios

---

### **3️⃣ Importar Projeto**

1. No dashboard da Vercel, clique em **"Add New..."** → **"Project"**
2. Procure por **"clinica-estetica-aura"** (ou nome do seu repositório)
3. Clique em **"Import"**

---

### **4️⃣ Configurar Build Settings**

Na tela de configuração:

#### **Framework Preset**
- Selecione: **Vite**

#### **Root Directory**
- Clique em **"Edit"**
- Digite: `frontend`
- Clique em **"Continue"**

#### **Build and Output Settings**
- **Build Command**: `npm run build` (já preenchido)
- **Output Directory**: `dist` (já preenchido)
- **Install Command**: `npm install` (já preenchido)

---

### **5️⃣ Configurar Variáveis de Ambiente**

Clique em **"Environment Variables"** e adicione:

#### **Para usar com Railway (Backend):**
```
VITE_API_URL = https://seu-app.railway.app
```

#### **Para testar com backend local temporariamente:**
```
VITE_API_URL = http://localhost:3000
```

**Importante:** Você vai atualizar isso depois que fizer deploy do backend no Railway.

---

### **6️⃣ Deploy**

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. A Vercel vai:
   - Instalar dependências
   - Executar build
   - Fazer deploy

---

### **7️⃣ Verificar Deploy**

Após o deploy:

1. A Vercel mostrará: **"Congratulations! 🎉"**
2. Clique em **"Visit"** ou copie a URL
3. Sua URL será algo como: `https://clinica-estetica-aura.vercel.app`

---

### **8️⃣ Configurar Domínio Customizado (Opcional)**

Se tiver um domínio próprio:

1. No projeto da Vercel, vá em **"Settings"** → **"Domains"**
2. Adicione seu domínio (ex: `clinica-aura.com.br`)
3. Configure DNS conforme instruções da Vercel
4. SSL/HTTPS é automático!

---

## 🔧 Atualizar API_URL Depois do Deploy do Backend

Quando fizer deploy do backend no Railway:

1. Copie a URL do Railway (ex: `https://clinica-backend.railway.app`)
2. Na Vercel, vá em **"Settings"** → **"Environment Variables"**
3. Edite `VITE_API_URL`:
   ```
   VITE_API_URL = https://clinica-backend.railway.app
   ```
4. Clique em **"Save"**
5. Vá em **"Deployments"**
6. Clique nos 3 pontinhos do último deploy → **"Redeploy"**

---

## 🔄 Deploys Automáticos

A partir de agora, **toda vez que você fizer push no GitHub**, a Vercel automaticamente:
- ✅ Detecta mudanças
- ✅ Faz novo build
- ✅ Faz deploy
- ✅ Atualiza o site (2-3 minutos)

---

## 🎨 Configurar Arquivo de Build (Opcional)

Se quiser otimizar o build, crie `vercel.json` na raiz do projeto:

```json
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## 📊 Monitoramento

### Ver Logs de Build
1. Vercel Dashboard → Seu projeto
2. Clique em **"Deployments"**
3. Clique em qualquer deploy
4. Veja logs detalhados

### Analytics (Opcional)
1. Vá em **"Analytics"**
2. Veja visitantes, performance, etc.
3. Gratuito no plano Hobby!

---

## 🆘 Problemas Comuns

### Erro: "Build failed"
**Solução:**
1. Verifique logs de build
2. Teste build localmente:
   ```bash
   cd frontend
   npm run build
   ```
3. Corrija erros e faça novo push

### Erro: "Cannot find module"
**Solução:**
1. Verifique `package.json`
2. Certifique-se que todas as dependências estão listadas
3. Delete `node_modules` e `package-lock.json`
4. Execute `npm install`
5. Faça novo push

### API não conecta
**Solução:**
1. Verifique `VITE_API_URL` nas variáveis de ambiente
2. Certifique-se que backend está rodando
3. Verifique CORS no backend (deve permitir domínio da Vercel)

### Página em branco
**Solução:**
1. Abra DevTools (F12)
2. Veja erros no Console
3. Geralmente é problema de rota ou API_URL

---

## ✅ Checklist Final

- [ ] Código enviado para GitHub
- [ ] Projeto importado na Vercel
- [ ] Root Directory configurado (`frontend`)
- [ ] Framework Preset: Vite
- [ ] Variável `VITE_API_URL` configurada
- [ ] Deploy realizado com sucesso
- [ ] Site acessível na URL da Vercel
- [ ] Login funcionando (após backend no ar)

---

## 🎯 URLs Importantes

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Documentação Vercel**: https://vercel.com/docs
- **Seu Site**: https://seu-projeto.vercel.app

---

## 🚀 Próximo Passo

Após frontend no ar, faça deploy do backend no Railway!

Consulte: `GUIA_DEPLOY_RAILWAY.md`

---

**Última atualização**: 26 de Fevereiro de 2026
