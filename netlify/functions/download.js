const fs=require("fs");
const path=require("path");
const PDF_PATH=path.join(__dirname,"private","EBOOK-SAGRADO.pdf");
const ACCESS_TOKEN=process.env.ACCESS_TOKEN||"ebook-sagrado-acesso-2026";
exports.handler=async(event)=>{
  const q=event.queryStringParameters||{};
  if((q.token||"")!==ACCESS_TOKEN){
    return {statusCode:403,headers:{"Content-Type":"application/json"},body:JSON.stringify({error:"Acesso bloqueado."})};
  }
  if(!fs.existsSync(PDF_PATH)){
    return {statusCode:500,headers:{"Content-Type":"application/json"},body:JSON.stringify({error:"PDF não encontrado."})};
  }
  const pdf=fs.readFileSync(PDF_PATH);
  return {statusCode:200,headers:{"Content-Type":"application/pdf","Content-Disposition":'attachment; filename="EBOOK-SAGRADO.pdf"',"Cache-Control":"no-store"},body:pdf.toString("base64"),isBase64Encoded:true};
};
