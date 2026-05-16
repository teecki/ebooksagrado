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
