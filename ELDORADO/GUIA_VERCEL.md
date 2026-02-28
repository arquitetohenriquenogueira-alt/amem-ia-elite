# 🚀 GUIA DE IMPLANTAÇÃO VERCEL (Henrique CEO)

Para colocar o Amém IA no ar com o domínio `amemia.com.br`, siga estes passos simples:

## 1. Criar Conta na Vercel
1. Acesse [vercel.com/signup](https://vercel.com/signup).
2. Selecione **"Continue with GitHub"**. Isso é importante porque seu código já está lá.

## 2. Importar o Projeto
1. Na tela inicial da Vercel, clique em **"Add New..."** > **"Project"**.
2. Selecione o seu repositório do Amém IA.
3. Em **Environment Variables**, adicione as chaves que configuramos no `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. Clique em **Deploy**.

## 3. Configurar o Domínio
1. Após o deploy, vá em **Settings** > **Domains**.
2. Digite `amemia.com.br` e clique em **Add**.
3. Siga as instruções de DNS que a Vercel mostrará (geralmente apontar o Tipo A para o IP deles ou CNAME).

---
**Status**: 100% PRONTO PARA O AR! 🚀
