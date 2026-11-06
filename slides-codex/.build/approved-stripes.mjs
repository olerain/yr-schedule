import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {finalizePresentation} from '/Users/olerain/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='/Users/olerain/Documents/ChatGPT/yogi-room-schedule-october-2026';
const skill='/Users/olerain/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations';
const events=JSON.parse(await fs.readFile(root+'/.build/events-approved-stripes.json','utf8'));
assert.equal(events.length,34);
const fmt=t=>`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;
const classify=e=>{const n=e.title.toLowerCase();if(n.startsWith('аэройога'))return'aero';if(n.includes('нидра'))return'nidra';if(n.includes('йога')&&!n.includes('йогатерапия'))return'yoga';if(n.includes('пилатес'))return'pilates';if(n.includes('функциональная')||n.includes('пресс'))return'fitness';if(n.includes('растяжка')||n.includes('шпагаты'))return'stretch';if(n.includes('спина'))return'back';throw Error(n);};
const palettes={
soft:{yoga:'#D9F2B0',aero:'#CBE7FA',pilates:'#BFE8E3',fitness:'#FFE3A0',stretch:'#FFD4E2',back:'#E0D6F2',nidra:'#D3E9D9'},
bright:{yoga:'#CBEB67',aero:'#A9D8F6',pilates:'#85D9D2',fitness:'#FFD15C',stretch:'#FFAAC8',back:'#CCB8F0',nidra:'#A8D4B6'},
};
const C={ink:'#193E43',brand:'#007F87',muted:'#527176',grid:'#CFDFDE',paper:'#FFFFFF'};
const variants=[{id:'vsya-nedelya-tsvetnye-polosy',name:'Цветные полосы',palette:palettes.bright,mode:'stripe'}];
const P=Presentation.create({slideSize:{width:2400,height:2640}});
const logs=[];let counter=0;
function rect(s,n,x,y,w,h,fill){assert(w>0&&h>0);assert(x>=0&&y>=0&&x+w<=2401&&y+h<=2641);return s.shapes.add({name:n,geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}});}
function txt(s,n,value,x,y,w,h,size,bold=false,color=C.ink,align='left'){const o=rect(s,n,x,y,w,h,'none');o.text=value;o.text.style={fontFamily:'Arial',typeface:'Arial',fontSize:size,bold,color,alignment:align,verticalAlignment:'middle',insets:0,autoFit:'none',wrap:'none',lineSpacing:1.06};return o;}
const rule=(s,x,y,w,h,color=C.grid)=>rect(s,'rule-'+counter++,x,y,w,h,color);
const top=310,scale=2.55,split=top+435*scale,gap=80,even=split+gap,bottom=even+225*scale;
const Y=t=>t<=915?top+(t-480)*scale:even+(t-1110)*scale;
const x0=202,w=2126/7;
const norm=x=>x.toLowerCase().replace(/[^а-яёa-z0-9]/g,'');
const source=JSON.parse(await fs.readFile(root+'/.build/source-approved-stripes.json','utf8'));
const mins=t=>{const[h,m]=t.split(':').map(Number);return h*60+m;};
for(const e of events){const cell=source.values[Number(e.id.slice(1))-1][e.id.charCodeAt(0)-65];assert.equal(cell,e.raw);const m=cell.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);if(m){assert.equal(e.start,mins(m[1]));assert.equal(e.end,mins(m[2]));}assert(norm(cell).includes(norm(e.title)));}
const lum=h=>{const a=h.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];};
const ratio=(a,b)=>{const l=[lum(a.slice(1)),lum(b.slice(1))].sort((a,b)=>b-a);return(l[0]+.05)/(l[1]+.05);};
const contrasts={};
for(const v of variants){
 const s=P.slides.add();s.background.fill=C.paper;
 txt(s,'brand','YOGI ROOM',72,38,900,76,62,true);
 txt(s,'month','Октябрь',1750,38,578,76,62,true,C.brand,'right');
 txt(s,'heading','Расписание групповых занятий',72,126,1800,65,52);
 txt(s,'address','Московский пр., 73 к. 5',72,200,1200,43,31,false,C.muted);
 txt(s,'view','Вся неделя',1500,200,828,43,31,false,C.muted,'right');
 rule(s,72,258,2256,3,C.brand);
 txt(s,'time-heading','Время',72,272,117,30,24,true,C.muted);
 const days=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
 for(let d=0;d<7;d++){
  const x=x0+d*w;txt(s,'day-'+d,days[d],x+8,269,w-16,38,27,true,C.brand,'center');
  rule(s,x,top,1,split-top);rule(s,x,even,1,bottom-even);
 }
 rule(s,2328,top,1,split-top);rule(s,2328,even,1,bottom-even);
 const hourly=[480,540,600,660,720,780,840,900,1140,1200,1260,1320];
 for(const t of hourly){const y=Y(t);rule(s,x0,y,2126,2);txt(s,'axis-'+t,fmt(t),72,y-17,112,34,25,true,C.muted);}
 txt(s,'break','15:15–18:30  ·  Перерыв',730,split+16,1000,48,29,false,C.muted,'center');
 for(const e of events){
  const group=classify(e),color=v.palette[group];let x=x0+e.day*w+5,bw=w-10;
  const overlap=events.some(other=>other.id!==e.id&&other.day===e.day&&other.end!==null&&e.end!==null&&other.start<e.end&&e.start<other.end);
  if(overlap){bw=(w-20)/2;x+=e.start===1230?bw+10:0;}
  const y=Y(e.start)+3,eh=e.end?(e.end-e.start)*scale-6:126;
  if(v.mode==='fill'){rect(s,'class-'+e.id,x,y,bw,eh,color);}
  else {rect(s,'class-'+e.id,x,y,bw,eh,C.paper);rule(s,x,y,bw,1.3);if(e.end!==null)rule(s,x,y+eh-1,bw,1.3);}
  rule(s,x,y,v.mode==='fill'?5:13,eh,color);
  let title=e.title,tf=30,nf=31,tt=e.end?`${fmt(e.start)}–${fmt(e.end)}`:`с ${fmt(e.start)}`;
  if(overlap){tt=`${fmt(e.start)}–\n${fmt(e.end)}`;tf=26;nf=26;}
  if(title==='Здоровая спина /\nйогатерапия')nf=28;
  if(title==='Пресс + ягодицы')title='Пресс +\nягодицы';
  const pad=v.mode==='fill'?13:21,th=tf*(tt.includes('\n')?2.15:1.2),nh=nf*1.13*title.split('\n').length;
  txt(s,'time-'+e.id,tt,x+pad,y+10,bw-pad-8,th,tf,true);
  txt(s,'title-'+e.id,title,x+pad,y+12+th,bw-pad-8,nh,nf);
  assert(y+12+th+nh<=y+eh+1,`text fit: ${v.id} ${e.id}`);
  if(e.end===null){rect(s,'open-'+e.id,x,y+eh-3,bw,5,C.paper);for(let k=0;k<bw;k+=18)rule(s,x+k,y+eh-3,Math.min(9,bw-k),2,v.mode==='stripe'?C.muted:'#879D94');}
  assert.equal(norm(title),norm(e.title));
  logs.push({variant:v.id,event:e.id,group,color,start:e.start,end:e.end,title,time:tt,x,y,width:bw,height:eh});
 }
 // Compact key: preserve the same course families as the source spreadsheet.
 const key=[['yoga','Йога'],['aero','Аэройога'],['pilates','Пилатес'],['back','Здоровая спина'],['fitness','Функциональная и пресс'],['stretch','Растяжка и гибкость'],['nidra','Йога-нидра']];
 for(const [i,[g,label]] of key.entries()){const x=202,y=2112+i*50;rect(s,'key-'+g,x,y+4,32,32,v.palette[g]);txt(s,'key-title-'+g,label,x+47,y,1100,40,29,false,C.ink);}
 rule(s,72,2490,2256,3,C.brand);
 txt(s,'booking','Запись у администратора или в приложении YOGI ROOM',72,2520,1650,50,34);
 txt(s,'phone','+7 (995) 090-06-17',1750,2520,578,50,34,true,C.brand,'right');
 s.speakerNotes.text='Вариант оформления: '+v.name+'. Источник данных: https://docs.google.com/spreadsheets/d/1li0wzF_rvvS_k1iPb5-CKjI8h0kTr37v6EG_NxDUZ_k/edit#gid=857222307. Все 34 занятия сохранены. Перерыв без линий и отметок часов. Время среды исправлено по таблице: пилатес 19:30–20:30, йога 20:30–22:00. У йоги-нидры указано только начало. Легенда в один столбец с одинаковым левым краем квадратов. Предварительный вариант для согласования в чате, Google Slides не обновлялся.';
 const selected=logs.filter(x=>x.variant===v.id);assert.equal(selected.length,34);assert.equal(new Set(selected.map(x=>x.event)).size,34);
 contrasts[v.id]=Object.fromEntries(Object.entries(v.palette).map(([key,color])=>[key,ratio(C.ink,v.mode==='fill'?color:C.paper)]));
 assert(Object.values(contrasts[v.id]).every(x=>x>=4.5));
}
await fs.mkdir(root+'/output/approved-stripes',{recursive:true});
await (await PresentationFile.exportPptx(P)).save(root+'/.build/approved-stripes-candidate.pptx');
const final=await finalizePresentation({workspaceDir:root,candidatePath:root+'/.build/approved-stripes-candidate.pptx',finalPath:root+'/output/approved-stripes-editable.pptx',pythonExecutable:'/Users/olerain/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu',`${2400*9525},${2640*9525}`,'--validate-heading-fit'],explicitTotalSlideCount:1,fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:root+'/.build/approved-stripes-validation.json'});
for(let i=0;i<variants.length;i++){const blob=await P.export({slide:P.slides.items[i],format:'png',scale:1});await fs.writeFile(root+'/output/approved-stripes/'+variants[i].id+'.png',new Uint8Array(await blob.arrayBuffer()));}
await fs.writeFile(root+'/.build/approved-stripes-layout.json',JSON.stringify(logs,null,2));
await fs.writeFile(root+'/.build/approved-stripes-tests.json',JSON.stringify({timestamp:new Date().toISOString(),sourceComparison:'PASS: cell/time/title for all 34 events',eventCounts:[34],legendAlignment:"single left-aligned column",wednesdayPilates:"19:30–20:30",hourlyLinesOnly:true,breakHasNoLinesOrAxisLabels:true,contrasts,geometry:'PASS',finalizer:final},null,2));
console.log(JSON.stringify({status:'PASS',events:34,variants:1,minimumContrast:Math.min(...Object.values(contrasts).flatMap(Object.values)),files:variants.map(v=>root+'/output/approved-stripes/'+v.id+'.png')}));
