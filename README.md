# Organizador de Pedidos

App pronto pra hospedar que transforma mensagens de WhatsApp em pedidos organizados,
usando IA, com exportação para Excel.

## 1. Colocar o site no ar (Vercel — gratuito para começar)

Você não precisa saber programar para este passo, só seguir os cliques.

1. Crie uma conta gratuita em **https://vercel.com** (pode entrar com GitHub, Google ou e-mail).
2. No Vercel, clique em **"Add New Project"** → escolha este repositório → clique em **"Deploy"**.
   O Vercel detecta automaticamente que é um projeto Next.js.
3. Antes de finalizar (ou depois, em Project Settings → Environment Variables), adicione:
   - `ANTHROPIC_API_KEY` = sua chave da Anthropic (veja o passo 2 abaixo)
   - `ACCESS_CODE` = uma palavra/código que você vai distribuir para quem comprar
     (ex: `LOJA2026`)
4. Clique em **Deploy**. Em cerca de 1 minuto seu site estará no ar, em um endereço tipo
   `organizador-pedidos.vercel.app`.

## 2. Pegar sua chave da API da Anthropic

1. Entre em **https://console.anthropic.com**
2. Vá em **Settings → API Keys → Create Key**
3. Copie a chave (começa com `sk-ant-...`) e cole na variável `ANTHROPIC_API_KEY` no Vercel.
4. Você paga só pelo uso (por chamada de IA) — não tem mensalidade fixa da Anthropic.

## 3. Como funciona a venda (versão simples)

1. Configure um **Payment Link** no Stripe (https://dashboard.stripe.com/payment-links).
2. Coloque esse link no botão "Assinar agora" da página inicial
   (arquivo `pages/index.js`, troque `SEU_PAYMENT_LINK_AQUI`).
3. Quando alguém pagar, o Stripe te avisa por e-mail. Você manda pra pessoa o link do site
   e o código de acesso (`ACCESS_CODE` que você definiu).
4. A pessoa entra em `/app`, digita o código, e já usa a ferramenta.

## 4. Estrutura do projeto
