exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    console.log("Pagamento recebido:", data);

    return {
      statusCode: 200,
      body: "OK"
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: "Erro webhook"
    };
  }
};
