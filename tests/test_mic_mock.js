import puppeteer from 'puppeteer-core';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root = path.resolve('backend/app/static');
const srv = http.createServer((q,r)=>{let f=path.join(root,q.url==='/'?'index.html':q.url.split('?')[0]);
  if(!fs.existsSync(f)){r.statusCode=404;return r.end();} r.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.jpg')?'image/jpeg':'text/html');r.end(fs.readFileSync(f));}).listen(4173);
const b = await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:'new',args:['--no-sandbox']});
const p = await b.newPage(); p.on('pageerror',e=>console.log('PAGEERR',e.message)); p.on('console',m=>m.type()==='error'&&console.log('CONSOLE',m.text()));
await p.evaluateOnNewDocument(()=>{
  window.__aborts=0; window.__spoken=[];
  class SR{ constructor(){window.__rec=this;} start(){this.on=true;setTimeout(()=>this.onstart&&this.onstart(),10);}
    stop(){ if(!this.on)return; this.on=false; setTimeout(()=>this.onend&&this.onend(),10);}
    abort(){ window.__aborts++; this.on=false; this.onerror&&this.onerror({error:'aborted'}); this.onend&&this.onend(); }
    say(t){ this.onresult({results:[[{transcript:t}]]}); } }
  window.SpeechRecognition=SR;
  const orig=window.speechSynthesis; 
  window.speechSynthesis.speak=(u)=>{window.__spoken.push(u.text);};
});
await p.goto('http://localhost:4173/',{waitUntil:'networkidle2'});
await p.click('.round[aria-label="Ask by voice"]');
await new Promise(r=>setTimeout(r,200));
await p.evaluate(()=>window.__rec.say('why is'));
await new Promise(r=>setTimeout(r,300));
await p.evaluate(()=>window.__rec.say('why is the sky blue'));
console.log('transcript shown:', await p.$eval('.live-text',e=>e.textContent));
console.log('aborts during speech (must be 0):', await p.evaluate(()=>window.__aborts));
await p.waitForFunction(()=>document.querySelectorAll('.bot-text').length>0,{timeout:20000});
const out = await p.evaluate(()=>({
  user:[...document.querySelectorAll('.msg.user')].pop().innerText,
  bot:[...document.querySelectorAll('.bot-text')].pop().innerText.slice(0,150),
  spoken:window.__spoken.filter(s=>s.trim()).length}));
console.log(out);
if(!out.user.includes('Voice')||out.spoken<1) {console.error('FAIL');process.exit(1);}
await p.screenshot({path:'/tmp/ui_chat.png'}); console.log('MIC FLOW OK'); await b.close(); srv.close();
