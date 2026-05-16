const fs = require("fs");
const path = require("path");
const PDF_PATH = path.join(__dirname, "private", "EBOOK-SAGRADO.pdf");
const MIN_AMOUNT_CENTS = Number(process.env.PRODUCT_PRICE_CENTS || 999);

function json(code, obj){return {statusCode:code, headers:{"Content-Type":"application/json","Cache-Control":"no-store"}, body:JSON.stringify(obj)}}

async function verifyStripe(sessionId){
  if(!process.env.STRIPE_SECRET_KEY) return {ok:false,error:"Stripe não configurado no Netlify."};
  if(!sessionId) return {ok:false,error:"Sessão Stripe ausente."};
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sessionId), {
    headers:{Authorization:"Bearer " + process.env.STRIPE_SECRET_KEY}
  });
  if(!res.ok) return {ok:false,error:"Não foi possível verificar o pagamento Stripe."};
  const data = await res.json();
  const paid = data.payment_status === "paid" || data.status === "complete";
  const amountOk = !data.amount_total || Number(data.amount_total) >= MIN_AMOUNT_CENTS;
  if(!paid || !amountOk) return {ok:false,error:"Pagamento Stripe ainda não aprovado."};
  return {ok:true};
}

async function verifyMP(paymentId){
  if(!process.env.MERCADOPAGO_ACCESS_TOKEN) return {ok:false,error:"Mercado Pago não configurado no Netlify."};
  if(!paymentId) return {ok:false,error:"ID do pagamento Mercado Pago ausente."};
  const res = await fetch("https://api.mercadopago.com/v1/payments/" + encodeURIComponent(paymentId), {
    headers:{Authorization:"Bearer " + process.env.MERCADOPAGO_ACCESS_TOKEN}
  });
  if(!res.ok) return {ok:false,error:"Não foi possível verificar o pagamento Mercado Pago."};
  const data = await res.json();
  const paid = data.status === "approved";
  const amountOk = !data.transaction_amount || Number(data.transaction_amount) >= (MIN_AMOUNT_CENTS/100);
  if(!paid || !amountOk) return {ok:false,error:"Pagamento Mercado Pago ainda não aprovado."};
  return {ok:true};
}

exports.handler = async (event) => {
  try{
    const q = event.queryStringParameters || {};
    const provider = String(q.provider || "").toLowerCase();
    const sessionId = q.session_id || q.sessionId;
    const paymentId = q.payment_id || q.paymentId || q.collection_id || q.collectionId;

    let verified;
    if(provider === "stripe") verified = await verifyStripe(sessionId);
    else if(provider === "mercadopago" || provider === "mp") verified = await verifyMP(paymentId);
    else return json(403,{error:"Acesso bloqueado. Pagamento não identificado."});

    if(!verified.ok) return json(403,{error:verified.error});
    if(!fs.existsSync(PDF_PATH)) return json(500,{error:"PDF não encontrado no servidor."});

    const pdf = fs.readFileSync(PDF_PATH);
    return {
      statusCode:200,
      headers:{
        "Content-Type":"application/pdf",
        "Content-Disposition":'attachment; filename="EBOOK-SAGRADO.pdf"',
        "Cache-Control":"no-store"
      },
      body:pdf.toString("base64"),
      isBase64Encoded:true
    };
  }catch(e){
    return json(500,{error:"Erro interno ao liberar o conteúdo."});
  }
};
