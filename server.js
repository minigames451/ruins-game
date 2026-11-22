const {WebSocketServer}=require('ws'),http=require('http');
const srv=http.createServer((q,s)=>s.end('ok'));
const wss=new WebSocketServer({server:srv,maxPayload:65536});
const rooms=new Map();let n=0;
wss.on('connection',ws=>{
 const id='u'+(++n)+Math.random().toString(36).slice(2,6);let room=null;ws.id=id;
 const send=(w,o)=>w.readyState===1&&w.send(JSON.stringify(o));
 const list=()=>{if(!room)return;const l=[...room].map(w=>({id:w.id,p:w.p||{}}));room.forEach(w=>send(w,{k:'l',list:l}))};
 ws.on('message',raw=>{let m;try{m=JSON.parse(raw)}catch(e){return}
  if(m.k==='j'&&!room){const c=String(m.room).slice(0,20);let r=rooms.get(c)||new Set();
   if(r.size>=10)return send(ws,{k:'x'});rooms.set(c,r);room=r;room.add(ws);room.code=c;send(ws,{k:'w',id});list()}
  else if(room&&m.k==='p'){ws.p=m.p;room.forEach(w=>w!==ws&&send(w,{k:'p',id,p:m.p}))}
  else if(room&&m.k==='e'){room.forEach(w=>w!==ws&&send(w,{k:'e',t:m.t,d:m.d,from:id}))}});
 ws.on('close',()=>{if(room){room.delete(ws);if(!room.size)rooms.delete(room.code);else list()}});
});
srv.listen(process.env.PORT||3000);