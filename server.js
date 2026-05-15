require('dotenv').config();

const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const Stripe = require('stripe');
const { nanoid } = require('nanoid');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

const app = express();
const PORT = process.env.PORT || 3000;
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
const PRODUCT_NAME = process.env.PRODUCT_NAME || 'EBOOK SAGRADO';
const PRODUCT_PRICE_CENTS = Number(process.env.PRODUCT_PRICE_CENTS || 999);
const PDF_PATH = path.join(__dirname, 'private', 'EBOOK-SAGRADO.pdf');
const DB_PATH = path.join(__dirname, 'data', 'database.json');

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null;
const mpClient = process.env.MERCADOPAGO_ACCESS_TOKEN ? new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN }) : null;

function ensureDb(){ if(!fs.existsSync(path.dirname(DB_PATH))) fs.mkdirSync(path.dirname(DB_PATH), {recursive:true}); if(!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({purchases:[],tokens:[]},null,2));}
function readDb(){ensureDb(); return JSON.parse(fs.readFileSync(DB_PATH,'utf8'));}
function writeDb(db){fs.writeFileSync(DB_PATH,JSON.stringify(db,null,2));}
function normalizeEmail(email){return String(email||'').trim().toLowerCase();}
function isEmail(email){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);}
function createPurchase({email,provider,provider_id,status='pending'}){const db=readDb();db.purchases.push({id:nanoid(12),email:normalizeEmail(email),provider,provider_id:provider_id||null,status,created_at:new Date().toISOString(),paid_at:status==='paid'?new Date().toISOString():null});writeDb(db);}
function markPaid({email,provider,provider_id}){const db=readDb();const e=normalizeEmail(email);const p=db.purchases.find(x=>x.provider===provider&&String(x.provider_id)===String(provider_id));if(p){p.status='paid';p.email=e||p.email;p.paid_at=new Date().toISOString();}else{db.purchases.push({id:nanoid(12),email:e,provider,provider_id:provider_id||null,status:'paid',created_at:new Date().toISOString(),paid_at:new Date().toISOString()});}writeDb(db);}
function hasPaidAccess(email){const db=readDb();const e=normalizeEmail(email);return db.purchases.some(p=>p.email===e&&p.status==='paid');}
function createDownloadToken(email){const db=readDb();const token=nanoid(48);db.tokens.push({token,email:normalizeEmail(email),expires_at:Date.now()+10*60*1000,max_downloads:3,downloads:0,created_at:new Date().toISOString()});writeDb(db);return token;}

app.post('/api/webhook/stripe', express.raw({type:'application/json'}), async(req,res)=>{
  if(!stripe) return res.status(500).send('Stripe não configurado.');
  let event;
  try{const sig=req.headers['stripe-signature']; const whsec=process.env.STRIPE_WEBHOOK_SECRET; event=whsec?stripe.webhooks.constructEvent(req.body,sig,whsec):JSON.parse(req.body.toString());}
  catch(err){console.error('Erro webhook Stripe:',err.message);return res.status(400).send(`Webhook Error: ${err.message}`);}
  if(event.type==='checkout.session.completed'){const s=event.data.object;const email=normalizeEmail(s.customer_details?.email||s.customer_email||s.metadata?.email);if(email)markPaid({email,provider:'stripe',provider_id:s.id});}
  res.json({received:true});
});

app.use(express.json());
app.use(helmet({contentSecurityPolicy:false,crossOriginResourcePolicy:false}));
app.use(express.static(path.join(__dirname,'public'),{extensions:['html']}));
app.get('/',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

app.post('/api/checkout/stripe',async(req,res)=>{
  try{
    if(!stripe)return res.status(500).json({error:'Stripe não configurado no Render.'});
    const email=normalizeEmail(req.body.email); if(!isEmail(email))return res.status(400).json({error:'Digite um e-mail válido.'});
    const session=await stripe.checkout.sessions.create({mode:'payment',customer_email:email,line_items:[{price_data:{currency:'brl',product_data:{name:PRODUCT_NAME},unit_amount:PRODUCT_PRICE_CENTS},quantity:1}],success_url:`${APP_URL}/sucesso.html`,cancel_url:`${APP_URL}/cancelado.html`,metadata:{email,product:PRODUCT_NAME}});
    createPurchase({email,provider:'stripe',provider_id:session.id,status:'pending'});
    res.json({url:session.url});
  }catch(err){console.error(err);res.status(500).json({error:'Erro ao criar checkout Stripe.'});}
});

app.post('/api/checkout/mercadopago',async(req,res)=>{
  try{
    if(!mpClient)return res.status(500).json({error:'Mercado Pago não configurado no Render.'});
    const email=normalizeEmail(req.body.email); if(!isEmail(email))return res.status(400).json({error:'Digite um e-mail válido.'});
    const preference=new Preference(mpClient);
    const result=await preference.create({body:{items:[{title:PRODUCT_NAME,quantity:1,unit_price:PRODUCT_PRICE_CENTS/100,currency_id:'BRL'}],payer:{email},metadata:{email,product:PRODUCT_NAME},back_urls:{success:`${APP_URL}/sucesso.html`,failure:`${APP_URL}/cancelado.html`,pending:`${APP_URL}/sucesso.html`},auto_return:'approved',notification_url:`${APP_URL}/api/webhook/mercadopago`}});
    createPurchase({email,provider:'mercadopago',provider_id:result.id,status:'pending'});
    res.json({url:result.init_point||result.sandbox_init_point});
  }catch(err){console.error(err);res.status(500).json({error:'Erro ao criar checkout Mercado Pago.'});}
});

app.post('/api/webhook/mercadopago',async(req,res)=>{
  try{
    if(!mpClient)return res.status(500).json({error:'Mercado Pago não configurado.'});
    const type=req.body.type||req.body.topic; const paymentId=req.body.data?.id||req.body.id;
    if((type==='payment'||type==='merchant_order')&&paymentId){const paymentApi=new Payment(mpClient);const payment=await paymentApi.get({id:paymentId});if(payment.status==='approved'){const email=normalizeEmail(payment.payer?.email||payment.metadata?.email);if(email)markPaid({email,provider:'mercadopago',provider_id:String(paymentId)});}}
    res.json({received:true});
  }catch(err){console.error('Erro webhook Mercado Pago:',err);res.status(200).json({received:true});}
});

app.post('/api/access/request',(req,res)=>{
  const email=normalizeEmail(req.body.email); if(!isEmail(email))return res.status(400).json({error:'Digite um e-mail válido.'});
  if(!hasPaidAccess(email))return res.status(403).json({error:'Pagamento não encontrado para este e-mail. Use o mesmo e-mail da compra ou aguarde alguns segundos.'});
  const token=createDownloadToken(email); res.json({downloadUrl:`/api/download/${token}`,expiresInMinutes:10});
});

app.get('/api/download/:token',(req,res)=>{
  const db=readDb(); const row=db.tokens.find(t=>t.token===req.params.token);
  if(!row)return res.status(404).send('Link inválido.');
  if(Date.now()>row.expires_at)return res.status(410).send('Link expirado. Gere outro acesso.');
  if(row.downloads>=row.max_downloads)return res.status(429).send('Limite de downloads atingido. Gere outro acesso.');
  if(!fs.existsSync(PDF_PATH))return res.status(500).send('PDF não encontrado no servidor.');
  row.downloads+=1; writeDb(db);
  res.setHeader('Content-Type','application/pdf');res.setHeader('Content-Disposition','attachment; filename="EBOOK-SAGRADO.pdf"');res.sendFile(PDF_PATH);
});

app.post('/api/admin/teste-liberar',(req,res)=>{const email=normalizeEmail(req.body.email);if(!isEmail(email))return res.status(400).json({error:'E-mail inválido.'});markPaid({email,provider:'teste',provider_id:nanoid(12)});res.json({ok:true,message:`Acesso liberado para ${email}`});});

app.listen(PORT,()=>console.log(`EBOOK SAGRADO rodando em ${APP_URL}`));
