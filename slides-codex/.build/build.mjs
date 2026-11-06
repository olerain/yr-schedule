import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {finalizePresentation} from '/Users/olerain/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='/Users/olerain/Documents/ChatGPT/yogi-room-schedule-october-2026';
const skill='/Users/olerain/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations';
const src=JSON.parse(await fs.readFile(root+'/.build/source.json','utf8'));
const min=t=>{const [h,m]=t.split(':').map(Number);return h*60+m};
const fmt=t=>`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;
const names={
 'йога':'Йога','силовая йога':'Силовая йога','пилатес':'Пилатес','аэройога':'Аэройога',
 'функциональная тренировка':'Функциональная\nтренировка','растяжка+ гибкая спина':'Растяжка +\nгибкая спина',
 'растяжка+ мфр':'Растяжка + МФР','йога по методу айенгара':'Йога по методу\nАйенгара',
 'здоровая спина | йогатерапия':'Здоровая спина /\nйогатерапия','пресс+ягодицы':'Пресс + ягодицы',
 'шпагаты + гибкость':'Шпагаты +\nгибкость','здоровая спина':'Здоровая спина',
 'аэройога здоровая спина':'Аэройога\nздоровая спина','йога-нидра':'Йога-нидра','растяжка':'Растяжка'
};
const events=[];
for(let r=4;r<src.values.length;r++)for(let d=1;d<=7;d++){
 const raw=src.values[r]?.[d];if(!raw||raw==='*')continue;
 const lines=raw.split('\n').map(x=>x.trim()).filter(Boolean);
 const mt=lines[0].match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/);
 if(!mt&&lines[0]!=='ЙОГА-НИДРА')continue;
 const title=lines.slice(mt?1:0).filter(x=>!/^(Ольга|Дарья|Нина|Юлия|Инна|Светлана|Анна) /.test(x)).join(' ').replace(/\s+/g,' ').toLowerCase();
 assert(names[title],title);
 events.push({id:`${String.fromCharCode(65+d)}${r+1}`,day:d-1,start:mt?min(mt[1]):min(src.values[r][0]),end:mt?min(mt[2]):null,title:names[title],raw});
}
assert.equal(events.length,34);
await fs.writeFile(root+'/.build/events.json',JSON.stringify(events,null,2));
const P=Presentation.create({slideSize:{width:2400,height:2260}});
const C={ink:'#123F45',accent:'#007F87',pale:'#E6F4F3',paper:'#FFFFFF',grid:'#D2E4E3',muted:'#527176',soft:'#F6FAFA'};
const days=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
const logs=[];
function rect(s,n,x,y,w,h,fill){return s.shapes.add({name:n,geometry:'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0}})}
function text(s,n,value,x,y,w,h,size,bold=false,color=C.ink,align='left'){
const o=rect(s,n,x,y,w,h,'none');o.text=value;o.text.style={fontFamily:'Arial',typeface:'Arial',fontSize:size,bold,color,alignment:align,verticalAlignment:'middle',insets:0,autoFit:'none',wrap:'none',lineSpacing:1.06};return o;}
function rule(s,n,x,y,w,h,color=C.grid){return rect(s,n,x,y,w,h,color)}
const top=310,scale=2.55,gap=80,split=top+435*scale,even=split+gap,bottom=even+225*scale;
const Y=t=>t<=915?top+(t-480)*scale:even+(t-1110)*scale;
const views=[{days:[0,1,2,3,4,5,6],slug:'01-vsya-nedelya',label:'Вся неделя'},{days:[0,1,2,3],slug:'02-ponedelnik-chetverg',label:'Понедельник–четверг'},{days:[4,5,6],slug:'03-pyatnitsa-voskresenye',label:'Пятница–воскресенье'}];
for(const [index,v]of views.entries()){
 const s=P.slides.add();s.background.fill=C.paper;
 const full=index===0, fsBody=full?31:37, fsTime=full?30:37;
 text(s,'brand','YOGI ROOM',72,38,900,76,62,true);
 text(s,'month','Октябрь',1750,38,578,76,62,true,C.accent,'right');
 text(s,'heading','Расписание групповых занятий',72,126,1800,65,52,false);
 text(s,'address','Московский пр., 73 к. 5',72,200,1200,43,31,false,C.muted);
 text(s,'view-name',v.label,1500,200,828,43,31,false,C.muted,'right');
 const x0=202,w=2126/v.days.length;
 rule(s,'day-rule',72,258,2256,3,C.accent);
 text(s,'time-heading','Время',72,272,117,30,24,true,C.muted);
 for(const [col,d]of v.days.entries()){
  const x=x0+col*w;
  if(col%2===1){rect(s,`column-bg-${d}`,x,top,w,split-top,C.soft);rect(s,`column-bg-even-${d}`,x,even,w,bottom-even,C.soft);}
  text(s,`day-${d}`,days[d],x+8,269,w-16,38,full?27:38,true,C.accent,'center');
  rule(s,`column-${d}`,x,top,1,bottom-top);
 }
 rule(s,'grid-right',2328,top,1,bottom-top);
 for(const [begin,end]of[[480,915],[1110,1335]])for(let t=begin;t<=end;t+=15){
  const y=Y(t);const strong=t%60===0||t===begin||t===end;
  rule(s,`time-rule-${t}`,x0,y,2126,strong?1.8:0.65,strong?C.grid:'#EDF3F3');
  if(t%30===0||t===end)text(s,`axis-${t}`,fmt(t),72,y-17,112,34,full?25:29,strong,C.muted);
 }
 rect(s,'break-bg',202,split+2,2126,gap-4,C.paper);
 rule(s,'break-left',202,split+gap/2,660,1,C.grid);rule(s,'break-right',1660,split+gap/2,668,1,C.grid);
 text(s,'break-label','15:15–18:30  ·  перерыв',880,split+16,760,48,29,false,C.muted,'center');
 const selected=events.filter(e=>v.days.includes(e.day));
 for(const e of selected){
  const col=v.days.indexOf(e.day);let x=x0+col*w+5,bw=w-10;
  const overlap=e.day===2&&e.start>=1200;
  if(overlap){bw=(w-20)/2;x+=e.start===1230?bw+10:0;}
  const y=Y(e.start)+3,eh=e.end?(e.end-e.start)*scale-6:126;
  rect(s,`class-${e.id}`,x,y,bw,eh,C.pale);rule(s,`accent-${e.id}`,x,y,5,eh,C.accent);
  const pad=full?13:20;
  let tf=fsTime,nf=fsBody,tt=e.end?`${fmt(e.start)}–${fmt(e.end)}`:`с ${fmt(e.start)}`;
  let name=e.title;
  if(full&&overlap){tt=`${fmt(e.start)}–\n${fmt(e.end)}`;tf=26;nf=26;}
  if(full&&name==='Здоровая спина /\nйогатерапия')nf=28;
  if(full&&name==='Пресс + ягодицы')name='Пресс +\nягодицы';
  if(full&&name==='Силовая йога')name='Силовая йога';
  const th=tf*(tt.includes('\n')?2.15:1.2);
  text(s,`time-${e.id}`,tt,x+pad,y+10,bw-pad-8,th,tf,true);
  const lines=name.split('\n').length;
  const nh=nf*1.13*lines;
  text(s,`title-${e.id}`,name,x+pad,y+12+th,bw-pad-8,nh,nf,false);
  assert(y+12+th+nh<=y+eh+1,`text height ${v.slug} ${e.id}`);
  if(e.end===null){rect(s,`open-edge-${e.id}`,x,y+eh-3,bw,5,C.paper);for(let k=0;k<bw;k+=18)rule(s,`open-dash-${e.id}-${k}`,x+k,y+eh-3,Math.min(9,bw-k),2,C.accent);}
  logs.push({slide:index+1,event:e.id,start:e.start,end:e.end,x,y,width:bw,height:eh,title:name,time:tt});
 }
 rule(s,'footer-rule',72,2104,2256,3,C.accent);
 text(s,'booking','Запись у администратора или в приложении YOGI ROOM',72,2130,1700,50,34,false);
 text(s,'phone','+7 (995) 090-06-17',1750,2130,578,50,34,true,C.accent,'right');
 s.speakerNotes.text='Источник: https://docs.google.com/spreadsheets/d/1li0wzF_rvvS_k1iPb5-CKjI8h0kTr37v6EG_NxDUZ_k/edit#gid=857222307\nДанные вкладки «октябрь», проверены 15 октября 2026. '+(index===0?'34 занятия. ':'')+'В среду сохранено пересечение пилатеса 20:00–21:00 с йогой 20:30–22:00. Для йоги-нидры указано только начало, время окончания в источнике отсутствует.\nОбновление: редактируйте подписи и блоки на всех соответствующих страницах; автоматической связи с таблицей нет. Для экспорта: Файл → Скачать → PNG-изображение (текущий слайд).';
}
const seen=logs.filter(x=>x.slide>1).map(x=>x.event).sort();assert.deepEqual(seen,events.map(x=>x.id).sort());
assert.equal(logs.filter(x=>x.slide===1).length,34);
const lum=h=>{const a=h.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2]};
const contrasts={};for(const [n,f,b]of[['body',C.ink,C.pale],['accent',C.accent,C.paper],['muted',C.muted,C.paper]]){const l=[lum(f.slice(1)),lum(b.slice(1))].sort((a,b)=>b-a);contrasts[n]=(l[0]+.05)/(l[1]+.05);assert(contrasts[n]>=4.5);}
await fs.writeFile(root+'/.build/layout.json',JSON.stringify(logs,null,2));
await (await PresentationFile.exportPptx(P)).save(root+'/.build/candidate.pptx');
const result=await finalizePresentation({workspaceDir:root,candidatePath:root+'/.build/candidate.pptx',finalPath:root+'/output/yogi-room-october-v3.pptx',pythonExecutable:'/Users/olerain/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu',`${2400*9525},${2260*9525}`,'--validate-heading-fit'],explicitTotalSlideCount:3,fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:root+'/.build/validation-v3.json'});
for(let i=0;i<3;i++){
 const blob=await P.export({slide:P.slides.items[i],format:'png',scale:1});
 await fs.writeFile(root+'/.build/'+views[i].slug+'.png',new Uint8Array(await blob.arrayBuffer()));
}
await fs.writeFile(root+'/.build/test-results.json',JSON.stringify({timestamp:new Date().toISOString(),events:34,views:logs.reduce((a,x)=>(a[x.slide]=(a[x.slide]||0)+1,a),{}),coverage:'PASS',geometry:'PASS',contrasts,finalizer:result},null,2));
console.log(JSON.stringify({status:'PASS',events:34,contrasts,output:root+'/output/yogi-room-october-v3.pptx'}));
