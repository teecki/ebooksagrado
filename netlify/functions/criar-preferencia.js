exports.handler = async function () {
  try {
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        items: [
          {
            title: "EBOOK SAGRADO",
            quantity: 1,
            currency_id: "BRL",
            unit_price: 9.99
          }
        ],
        back_urls: {
  success: "https://ebooksagrado1.netlify.app/acesso.html?ok=1",
  failure: "https://ebooksagrado1.netlify.app/cancelado.html",
  pending: "https://ebooksagrado1.netlify.app/"
},
auto_return: "approved"
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        init_point: data.init_point
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Erro ao criar pagamento" })
    };
  }
};
