const ACCESS_TOKEN = process.env.ACCESS_TOKEN || "ebook-sagrado-acesso-2026";
const SECRET_FILE = "/downloads/ebook-sagrado-material-digital-7f9c2a1b.pdf";

exports.handler = async (event) => {
  const q = event.queryStringParameters || {};
  const token = q.token || "";

  if (token !== ACCESS_TOKEN) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
      body: JSON.stringify({ error: "Acesso bloqueado." })
    };
  }

  return {
    statusCode: 302,
    headers: {
      "Location": SECRET_FILE,
      "Cache-Control": "no-store"
    },
    body: ""
  };
};
