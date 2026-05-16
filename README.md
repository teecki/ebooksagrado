# EBOOK SAGRADO CORRIGIDO

Use como Web Service no Render.

Build Command:
npm install

Start Command:
node server.js

Variáveis:
APP_URL=https://ebook-sagrado.onrender.com
PORT=10000
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
PRODUCT_NAME=EBOOK SAGRADO
PRODUCT_PRICE_CENTS=999


## Entrega pós-compra recomendada

Configure no Stripe e no Mercado Pago a URL de sucesso para:

https://SEU-DOMINIO/acesso.html

A página `/acesso.html` entrega o botão para abrir/baixar o arquivo `/ebook.pdf`.


## Links de pagamento configurados

Stripe:
https://buy.stripe.com/3cIbJ19i77eW9rD1OC1oI00

Mercado Pago:
https://mpago.la/1TnGaYZ

Configure nos dois provedores o redirecionamento/success URL para:
https://ebooksagrado.netlify.app/acesso.html


# ENTREGA PROTEGIDA NA NETLIFY

## Mudanças
- Removido `public/ebook.pdf`.
- PDF protegido em `netlify/functions/private/EBOOK-SAGRADO.pdf`.
- `/acesso.html` só libera o download após validar pagamento.

## Variáveis no Netlify
Adicione em Site settings > Environment variables:
STRIPE_SECRET_KEY=sk_live_...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
PRODUCT_PRICE_CENTS=999

## Stripe
Configure o redirecionamento pós-pagamento para:
https://ebooksagrado.netlify.app/acesso.html?provider=stripe&session_id={CHECKOUT_SESSION_ID}

## Mercado Pago
Para proteger de verdade, o retorno precisa trazer `payment_id` ou `collection_id`.
Use:
https://ebooksagrado.netlify.app/acesso.html?provider=mercadopago

Se o link simples do Mercado Pago não enviar ID do pagamento no retorno, a Netlify não consegue confirmar automaticamente.

# ENTREGA FUNCIONAL NA NETLIFY

Adicione em Netlify > Site settings > Environment variables:
STRIPE_SECRET_KEY=sk_live_...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
PRODUCT_PRICE_CENTS=999
PRODUCT_NAME=EBOOK SAGRADO
SITE_URL=https://ebooksagrado.netlify.app

Depois faça novo deploy.


# ENTREGA EMERGENCIAL FUNCIONAL

Configure o pós-pagamento do Stripe e do Mercado Pago para:
https://ebooksagrado.netlify.app/acesso.html?token=ebook-sagrado-acesso-2026

Opcional no Netlify:
ACCESS_TOKEN=ebook-sagrado-acesso-2026

O PDF não está público. Ele fica em netlify/functions/private/EBOOK-SAGRADO.pdf.


# CORREÇÃO DO ERRO Function.ResponseSizeTooLarge

A função não envia mais o PDF pela resposta da Netlify.
Agora ela valida o token e redireciona para um arquivo com nome secreto.

Link pós-pagamento:
https://ebooksagrado.netlify.app/acesso.html?token=ebook-sagrado-acesso-2026

Arquivo do ebook:
public/downloads/ebook-sagrado-material-digital-7f9c2a1b.pdf

Observação:
O arquivo não aparece como /ebook.pdf, mas qualquer link de arquivo estático pode ser compartilhado se alguém copiar o endereço final.
Para proteção absoluta, use armazenamento externo com links assinados ou backend dedicado.


# Atualização solicitada

- Novo link Mercado Pago:
https://mpago.la/1kU9ATU

- Removido botão "Já comprei".
- Removido campo de e-mail da área de compra.
- Mantida entrega via página de acesso pós-pagamento:
https://ebooksagrado.netlify.app/acesso.html?token=ebook-sagrado-acesso-2026


# Atualização final

- Link Mercado Pago atualizado:
https://mpago.la/2xdV5Dj

- Botão "Já comprei" removido.
- Campo de e-mail removido.
