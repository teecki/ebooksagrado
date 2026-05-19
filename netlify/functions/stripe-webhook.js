const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const sig = event.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripeEvent;

  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      endpointSecret
    );
  } catch (err) {
    return {
      statusCode: 400,
      body: `Erro: ${err.message}`,
    };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    console.log("Pagamento aprovado!");
  }

  return {
    statusCode: 200,
    body: "OK",
  };
};
