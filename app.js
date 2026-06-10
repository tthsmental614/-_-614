const $=id=>document.getElementById(id);
const key='namilog_entries_v3', wishKey='namilog_wishes_v1', memoKey='namilog_doctor_memo_v1';
let entries=JSON.parse(localStorage.getItem(key)||'[]');
let wishes=JSON.parse(localStorage.getItem(wishKey)||'[]');
function today(){return new Date().toISOString().slice(0,10)}
$('date').value=today();
if(new Date().getMonth()===5 && new Date().getDate()===14)$('birthday').classList.remove('hidden');
['mood','anxiety','spend','death'].forEach(id=>$(id).addEventListener('input',()=>$(id+'Value').textContent=$(id).value));
$('doctorMemo').value=localStorage.getItem(memoKey)||'';
$('saveDoctor').onclick=()=>{localStorage.setItem(memoKey,$('doctorMemo').value); alert('主治医メモを保存したよ 🏥')};
function save(){localStorage.setItem(key,JSON.stringify(entries))}function saveW(){localStorage.setItem(wishKey,JSON.stringify(wishes))}
function sorted(){return [...entries].sort((a,b)=>a.date.localeCompare(b.date))}function latest(){return sorted().at(-1)}
function judge(e){if(!e)return{cls:'neutral',text:'まだ記録がありません。今日の波を一粒だけ置いていこう。'};const mood=+e.mood,sleep=+e.sleep||0,spend=+e.spend,anx=+e.anxiety,death=+e.death;
 if(death>=4)return{cls:'danger',text:'希死念慮が強め。手段から距離を置き、医療・身近な人に共有候補。今日は安全優先。'};
 if(mood>=4||(sleep>0&&sleep<=3)||spend>=4)return{cls:'danger',text:'躁っぽさ・衝動が強めかも。大きな買い物、契約、徹夜、薬の自己判断は一旦保留。'};
 if(mood>=2||spend>=3||anx>=4)return{cls:'up',text:'上がり気味・焦り気味のサインあり。予定を詰めすぎず、買い物は24時間寝かせる。'};
 if(mood<=-4)return{cls:'danger',text:'かなり沈み気味。安全優先。食事・水分・睡眠を最優先に。'};
 if(mood<=-2)return{cls:'down',text:'沈み気味。休息、食事、水分、睡眠の確保を優先。判断を急がない。'};
 return{cls:'ok',text:'大きな波は少なめ。今の生活リズムを観察しよう。'};}
function care(e){const list=[]; if(!e){list.push('🫧 まず一粒だけ記録してみよう')} else {if(+e.sleep&&+e.sleep<5)list.push('🌙 睡眠が少なめ。今日は予定を軽めに'); if(+e.spend>=3)list.push('🛍️ 買い物はカート保存だけ'); if(+e.anxiety>=4)list.push('☕ 温かい飲み物・肩首をゆるめる'); if(+e.death>=3)list.push('🪽 危ない物から距離を置く'); if(e.meds==='忘れた')list.push('💊 服薬忘れを主治医メモへ'); if(!e.done)list.push('🌱 できたこと欄に小さい実績を一つ');} return list.join('<br>');}
function render(){const body=$('entries');body.innerHTML='';sorted().reverse().forEach(e=>{const idx=entries.findIndex(x=>x.id===e.id);const tr=document.createElement('tr');tr.innerHTML=`<td>${e.date}</td><td>${e.mood}</td><td>${e.sleep||''}</td><td>${e.death}</td><td>${e.spend}</td><td>${e.anxiety}</td><td>${e.meds}</td><td>${escapeHtml(e.done||'')}</td><td>${escapeHtml(e.note||'')}</td><td><button class="delete" data-i="${idx}">削除</button></td>`;body.appendChild(tr)});
 document.querySelectorAll('.delete').forEach(b=>b.onclick=()=>{entries.splice(+b.dataset.i,1);save();render()}); const j=judge(latest());$('riskBox').className='risk '+j.cls;$('riskBox').innerHTML=j.text+'<br><small>'+care(latest())+'</small>'; renderWishes(); drawChart(); weekSummary();}
function escapeHtml(s){return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
$('entryForm').addEventListener('submit',e=>{e.preventDefault();const entry={id:crypto.randomUUID(),date:$('date').value,mood:$('mood').value,sleep:$('sleep').value,death:$('death').value,spend:$('spend').value,anxiety:$('anxiety').value,meds:$('meds').value,done:$('done').value,note:$('note').value}; entries=entries.filter(x=>x.date!==entry.date); entries.push(entry); save(); render(); e.target.reset(); $('date').value=today(); ['mood','anxiety','spend','death'].forEach(id=>{$(id+'Value').textContent=$(id).value});});
$('addWish').onclick=()=>{const v=$('wishItem').value.trim(); if(!v)return; wishes.push({id:crypto.randomUUID(),text:v,date:today()}); $('wishItem').value=''; saveW(); renderWishes();};
function renderWishes(){const ul=$('wishList');ul.innerHTML='';wishes.forEach((w,i)=>{const li=document.createElement('li');li.innerHTML=`<span>🛍️ ${escapeHtml(w.text)} <small>保留開始 ${w.date}</small></span><button class="delete" data-i="${i}">解除</button>`;ul.appendChild(li)}); ul.querySelectorAll('button').forEach(b=>b.onclick=()=>{wishes.splice(+b.dataset.i,1);saveW();renderWishes()});}
function weekSummary(){const data=sorted().slice(-7); if(!data.length){$('weekSummary').textContent='まだ記録がありません。';return} const avg=k=>(data.reduce((s,e)=>s+(+e[k]||0),0)/data.length).toFixed(1); $('weekSummary').innerHTML=`<div class="summaryGrid"><div class="pill">平均気分<b>${avg('mood')}</b></div><div class="pill">平均睡眠<b>${avg('sleep')}h</b></div><div class="pill">希死念慮<b>${avg('death')}</b></div><div class="pill">浪費衝動<b>${avg('spend')}</b></div></div>`}
function drawChart(){const c=$('chart'),ctx=c.getContext('2d'),data=sorted().slice(-30);ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#fffafd';ctx.fillRect(0,0,c.width,c.height);const pad=52,w=c.width-pad*2,h=c.height-pad*2;ctx.strokeStyle='#f0dce7';ctx.lineWidth=1;ctx.fillStyle='#9b7d8c';ctx.font='14px sans-serif';for(let i=-5;i<=5;i++){const y=pad+h-(i+5)/10*h;ctx.beginPath();ctx.moveTo(pad,y);ctx.lineTo(pad+w,y);ctx.stroke();ctx.fillText(i,pad-30,y+4)} if(data.length<1){ctx.fillText('記録するとここにグラフが出ます',pad,pad+20);return} function line(prop,color,min=-5,max=5){ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();data.forEach((e,i)=>{const x=pad+(data.length===1?0:i/(data.length-1)*w);let val=+e[prop]||0; if(prop==='sleep') {min=0; max=12; val=Math.min(12,val)} if(prop==='death'){min=0;max=5} const y=pad+h-(val-min)/(max-min)*h; i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.stroke()} line('mood','#e96f9d'); line('sleep','#5db7ff',0,12); line('death','#7560b8',0,5);}
$('exportBtn').onclick=()=>{const head=['date','mood','sleep','death','spend','anxiety','meds','done','note'];const rows=[head.join(',')].concat(sorted().map(e=>head.map(k=>'"'+String(e[k]||'').replaceAll('"','""')+'"').join(',')));const blob=new Blob([rows.join('\n')],{type:'text/csv;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='namilog.csv';a.click()};
$('resetBtn').onclick=()=>{if(confirm('全データを削除しますか？')){entries=[];save();render()}};render();
