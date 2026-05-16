exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    console.log("Webhook recebido:", data);

    // Verifica se é pagamento
    if (data.type === "payment") {

      const paymentId = data.data.id;

      // Consulta o pagamento no Mercado Pago
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
        }
      });

      const payment = await response.json();

      console.log("Status do pagamento:", payment.status);

      // Se pagamento aprovado
      if (payment.status === "approved") {

        console.log("Pagamento aprovado!");

        // Aqui você pode liberar acesso
        // exemplo simples: registrar ou redirecionar

      }
    }

    return {
      statusCode: 200,
      body: "OK"
    };

  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      body: "Erro webhook"
    };
  }
};
