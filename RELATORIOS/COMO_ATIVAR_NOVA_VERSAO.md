# 🚀 GUIA DE ATIVAÇÃO: AMÉM IA ELITE (Go Live)

Henrique, as alterações que fiz (Quiz, LED Glow, Captura de Leads) estão salvas no seu computador (G:). Para vê-las funcionando no site oficial (`amemia.com.br`), precisamos fazer o **Deploy** (subir o código).

---

## 1. Como Ver as Alterações AGORA (Local)

Como você está vendo o site antigo, siga este passo a passo para abrir a versão nova no seu navegador:

1.  Vá na pasta: `G:\EMPRESA_DIGITAL\AMEM_IA\FRONTEND\`
2.  Clique com o botão direito no arquivo `index.html`.
3.  Selecione **"Abrir com"** -> **Google Chrome**.
4.  **O QUÊ VOCÊ VAI VER**: A nova Landing Page com o botão **"Quero Acesso Elite"** que te leva para o Quiz.

---

## 2. Como Subir para o Site Oficial (Vercel)

Para o mundo ver a nova versão, você precisa enviar os arquivos para a Vercel. 

**Opção A: Git (Recomendado)**
Se você usa o VS Code, abra o terminal e digite:
```bash
git add .
git commit -m "feat: Elite Quiz & LED Glow"
git push
```
*A Vercel vai detectar e atualizar o site em 1 minuto.*

**Opção B: Upload Manual**
1. Acesse o painel da [Vercel](https://vercel.com).
2. Entre no seu projeto `amem-ia`.
3. Vá em "Deployments" e arraste a pasta `FRONTEND` para lá (se o seu projeto permitir upload manual).

---

## 3. O Que Foi Entregue (Checklist Final)

| Recurso | Onde Testar | Status |
| :--- | :--- | :--- |
| **LED Heart Glow** | Topo da `index.html` | ✅ Ativado |
| **Funil de Quiz** | Botão "Quero Acesso Elite" | ✅ Ativado |
| **Captura de Lead** | Aparece após a 3ª pergunta | ✅ Ativado |
| **Bypass Admin** | `amemia.com.br?admin=1` | ✅ Ativado |
| **Relatórios** | Aba "Relatórios" no Lobby | ✅ Ativado |

---

> [!IMPORTANT]
> Se você clicar no botão e ele for direto para a Ticto, significa que o seu navegador ainda está carregando a versão antiga (`cache`). Aperte `CTRL + F5` para forçar a atualização da página.

Henrique, o motor está pronto. Só falta você girar a chave do deploy! 🛡️🚀🔥
