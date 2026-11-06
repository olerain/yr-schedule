import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {Presentation,PresentationFile} from '@oai/artifact-tool';
import {finalizePresentation} from '/Users/olerain/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations/container_tools/artifact_tool_utils.mjs';
const root='/Users/olerain/Documents/ChatGPT/yogi-room-schedule-october-2026';
const skill='/Users/olerain/.codex/plugins/cache/openai-primary-runtime/presentations/26.1013.11914/skills/presentations';
const source=JSON.parse(await fs.readFile(root+'/.build/source-reference-labels.json','utf8'));
const events=JSON.parse(await fs.readFile(root+'/.build/events-approved-stripes.json','utf8'));
const min=t=>{const[h,m]=t.split(':').map(Number);return 60*h+m};
const fmt=t=>`${Math.floor(t/60)}:${String(t%60).padStart(2,'0')}`;
const norm=t=>t.toLowerCase().replace(/[^а-яёa-z0-9]/g,'');
for(const e of events){e.raw=source.values[Number(e.id.slice(1))-1][e.id.charCodeAt(0)-65];const m=e.raw.match(/^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);if(m){e.start=min(m[1]);e.end=min(m[2]);}assert(norm(e.raw).includes(norm(e.title)));}
const groups={yoga:{fill:'#DCEB99',ink:'#263421',label:'Йога'},aero:{fill:'#C6DEF4',ink:'#24344A',label:'Аэройога'},pilates:{fill:'#DCCAF0',ink:'#382638',label:'Пилатес'},fitness:{fill:'#FFBC8A',ink:'#442D23',label:'Функциональная и пресс'},stretch:{fill:'#F6BDD5',ink:'#46273D',label:'Растяжка и гибкость'},back:{fill:'#FFE38F',ink:'#45391F',label:'Здоровая спина'},nidra:{fill:'#65406E',ink:'#FFFFFF',label:'Йога-нидра'}};
const classify=e=>{const n=e.title.toLowerCase();if(n.startsWith('аэройога'))return'aero';if(n.includes('нидра'))return'nidra';if(n.includes('йога')&&!n.includes('йогатерапия'))return'yoga';if(n.includes('пилатес'))return'pilates';if(n.includes('функциональная')||n.includes('пресс'))return'fitness';if(n.includes('растяжка')||n.includes('шпагаты'))return'stretch';if(n.includes('спина'))return'back';throw Error(n)};
const draft={
'Йога':'Движение и дыхание',
'Силовая йога':'Сила и баланс',
'Йога по методу\nАйенгара':'Практика с опорами',
'Аэройога':'Практика в гамаке',
'Аэройога\nздоровая спина':'Гамак и спина',
'Пилатес':'Контроль движений',
'Функциональная\nтренировка':'Сила и выносливость',
'Растяжка +\nгибкая спина':'Гибкость и спина',
'Растяжка + МФР':'Растяжка и самомассаж',
'Здоровая спина':'Подвижность спины',
'Здоровая спина /\nйогатерапия':'Подвижность спины',
'Пресс + ягодицы':'Мышцы корпуса и ног',
'Шпагаты +\nгибкость':'Растяжка ног',
'Йога-нидра':'Расслабление лёжа',
'Растяжка':'Гибкость тела'};
assert.equal(events.length,34);
for(const e of events)assert(draft[e.title],e.title);
const P=Presentation.create({slideSize:{width:2800,height:2700}});
const C={ink:'#302D38',plum:'#584080',muted:'#6A6870',grid:'#EEECEF',white:'#FFFFFF'};
let seq=0;
function rect(s,n,x,y,w,h,fill,round=0){assert(w>0&&h>0&&x>=0&&y>=0&&x+w<=2801&&y+h<=2701,n);return s.shapes.add({name:n,geometry:round?'roundRect':'rect',position:{left:x,top:y,width:w,height:h},fill,line:{fill:'none',width:0},...(round?{borderRadius:round}:{})});}
function txt(s,n,value,x,y,w,h,size,bold=false,color=C.ink,align='center'){const o=rect(s,n,x,y,w,h,'none');o.text=value;o.text.style={fontFamily:'Arial',typeface:'Arial',fontSize:size,bold,color,alignment:align,verticalAlignment:'middle',insets:0,autoFit:'none',wrap:'none',lineSpacing:1.06};return o;}
function line(s,x,y,w,h,color=C.grid){return rect(s,'rule-'+seq++,x,y,w,h,color);}
function pill(s,n,label,group,cx,y,maxWidth,size=25,h=36){const g=groups[group];const pw=Math.min(maxWidth,Math.max(190,label.length*size*.57+28));rect(s,'pill-'+n,cx-pw/2,y,pw,h,g.fill,h/2);txt(s,'explain-'+n,label,cx-pw/2+10,y,pw-20,h,size,false,g.ink);return{fill:g.fill,ink:g.ink,width:pw};}
const top=358,scale=2.9,split=top+435*scale,gap=86,even=split+gap,bottom=even+225*scale;
const Y=t=>t<=915?top+(t-480)*scale:even+(t-1110)*scale;
const x0=252,colw=352;
const days=['Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье'];
const logs=[];
const s=P.slides.add();s.background.fill=C.white;
txt(s,'brand','YOGI ROOM',84,38,1200,60,46,true,C.plum,'left');
txt(s,'title','Расписание групповых занятий',84,112,2200,80,64,false,C.ink,'left');
txt(s,'address','Московский пр., 73 к. 5',84,204,1800,42,32,false,C.muted,'left');
txt(s,'month','Октябрь',2080,112,636,80,64,true,C.plum,'right');
rect(s,'day-band',84,266,2632,82,C.plum);
txt(s,'time-caption','Время',96,266,144,82,28,true,C.white);
for(let d=0;d<7;d++)txt(s,'day-'+d,days[d],x0+d*colw+8,266,colw-16,82,29,true,C.white);
for(let d=0;d<=7;d++){const x=x0+d*colw;line(s,x,top,1,split-top);line(s,x,even,1,bottom-even);}
for(const t of[480,540,600,660,720,780,840,900,1140,1200,1260,1320]){const y=Y(t);line(s,x0,y,2464,1);txt(s,'axis-'+t,fmt(t),84,y-20,140,40,29,true,C.muted);}
txt(s,'break','15:15–18:30  ·  Перерыв',800,split+20,1400,46,31,false,C.muted);
for(const e of events){
 const x=x0+e.day*colw+6,bw=colw-12,y=Y(e.start)+3,eh=e.end?(e.end-e.start)*scale-6:158;
 const group=classify(e),time=e.end?`${fmt(e.start)}–${fmt(e.end)}`:`с ${fmt(e.start)}`;
 const name=e.title==='Пресс + ягодицы'?'Пресс + ягодицы':e.title;
 const tf=32,nf=e.title.startsWith('Здоровая спина /')?29:30;
 const nh=nf*1.12*name.split('\n').length,contentH=36+8+nh+10+36;
 assert(contentH<=eh,`content height ${e.id}`);
 const cy=y+(eh-contentH)/2;
 rect(s,'class-'+e.id,x,y,bw,eh,C.white);
 txt(s,'time-'+e.id,time,x+8,cy,bw-16,36,tf,true);
 txt(s,'title-'+e.id,name,x+8,cy+44,bw-16,nh,nf,true);
 const pp=pill(s,e.id,draft[e.title],group,x+bw/2,cy+44+nh+10,bw-14,24.5,36);
 if(e.end===null)for(let k=0;k<bw;k+=18)line(s,x+k,y+eh-2,Math.min(8,bw-k),1.5,C.muted);
 logs.push({event:e.id,day:e.day,start:e.start,end:e.end,title:e.title,draftDescription:draft[e.title],group,x,y,width:bw,height:eh,pill:pp});
}
const key=[['yoga',252,2420],['aero',252,2464],['nidra',252,2508],['pilates',1110,2420],['back',1110,2464],['fitness',1940,2420],['stretch',1940,2464]];
for(const[g,x,y]of key){rect(s,'legend-'+g,x,y+6,28,28,groups[g].fill,14);txt(s,'legend-text-'+g,groups[g].label,x+44,y,730,40,29,false,C.ink,'left');}
line(s,84,2580,2632,1.5,'#DED9E5');
txt(s,'booking','Запись у администратора или в приложении YOGI ROOM',84,2604,1950,52,35,false,C.ink,'left');
txt(s,'phone','+7 (995) 090-06-17',2050,2604,666,52,35,true,C.plum,'right');
s.speakerNotes.text='Данные: только вкладка «октябрь», https://docs.google.com/spreadsheets/d/1li0wzF_rvvS_k1iPb5-CKjI8h0kTr37v6EG_NxDUZ_k/edit#gid=857222307. 34 занятия. Среда: пилатес 19:30–20:30, йога 20:30–22:00. Окончание йоги-нидры не указано. Цветные пояснения — редакционные черновики, не подтверждённые описания студии. Дизайн по приложенному пользователем референсу: белые блоки, время, название, цветная плашка. Все элементы нативные и редактируемые.';
const q=P.slides.add();q.background.fill=C.white;
txt(q,'sample-brand','YOGI ROOM',84,38,1200,60,46,true,C.plum,'left');
txt(q,'sample-title','Подписи занятий',84,112,2400,90,68,true,C.ink,'left');
txt(q,'sample-subtitle','Черновики пояснений — можно менять текст, цвет и расположение',84,220,2632,58,37,false,C.muted,'left');
txt(q,'sample-guide','На первой странице — расписание. Здесь — крупные образцы подписей для правок.',84,296,2632,60,34,false,C.ink,'left');
const uniques=[...new Map(events.map(e=>[e.title,e])).values()];
assert.equal(uniques.length,15);
for(let i=0;i<uniques.length;i++){
 const e=uniques[i],x=100+(i%3)*905,y=430+Math.floor(i/3)*402,bw=790;
 const tt=e.end?`${fmt(e.start)}–${fmt(e.end)}`:`с ${fmt(e.start)}`;
 txt(q,'sample-time-'+e.id,tt,x,y,bw,44,32,true,C.muted);
 const nh=e.title.split('\n').length*52;
 txt(q,'sample-name-'+e.id,e.title,x,y+62,bw,nh,44,true);
 pill(q,'sample-'+e.id,draft[e.title],classify(e),x+bw/2,y+88+nh,bw-50,33,54);
 line(q,x,y+325,bw,1,'#E5DFEC');
}
txt(q,'sample-footnote','Правки образцов на этой странице не меняют расписание автоматически.',84,2530,2632,58,33,false,C.muted,'left');
q.speakerNotes.text='Рабочая страница для совместного редактирования подписей. Все пояснения — авторские черновики, требуют проверки пользователем. Не указаны уровни подготовки, допуски и медицинские обещания. Время на образцах взято из реальных занятий первой страницы. Внесённые здесь правки следует повторить в нужных блоках расписания.';
function lum(h){const a=h.match(/\w\w/g).map(x=>parseInt(x,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];}
function contrast(a,b){const l=[lum(a.slice(1)),lum(b.slice(1))].sort((a,b)=>b-a);return(l[0]+.05)/(l[1]+.05);}
const contrasts=Object.fromEntries(Object.entries(groups).map(([k,g])=>[k,contrast(g.fill,g.ink)]));
contrasts.header=contrast(C.plum,C.white);assert(Object.values(contrasts).every(x=>x>=4.5));assert.equal(logs.length,34);
await fs.mkdir(root+'/output/reference-labels',{recursive:true});
await(await PresentationFile.exportPptx(P)).save(root+'/.build/reference-labels-candidate.pptx');
const final=await finalizePresentation({workspaceDir:root,candidatePath:root+'/.build/reference-labels-candidate.pptx',finalPath:root+'/output/reference-labels-editable.pptx',pythonExecutable:'/Users/olerain/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3',integrityValidatorPath:skill+'/container_tools/inspect_presentation_package_integrity.py',layoutValidatorPath:skill+'/container_tools/inspect_presentation_layout_geometry.py',layoutArgs:['--expected-slide-size-emu',`${2800*9525},${2700*9525}`,'--validate-heading-fit'],explicitTotalSlideCount:2,fontPolicy:{basis:'design',families:['Arial']},verifyArtifactToolImport:true,receiptPath:root+'/.build/reference-labels-validation.json'});
for(let i=0;i<2;i++){const blob=await P.export({slide:P.slides.items[i],format:'png',scale:1});await fs.writeFile(root+'/output/reference-labels/'+(i===0?'01-vsya-nedelya':'02-podpisi-zanyatij')+'.png',new Uint8Array(await blob.arrayBuffer()));}
await fs.writeFile(root+'/.build/reference-labels-layout.json',JSON.stringify(logs,null,2));
await fs.writeFile(root+'/.build/reference-labels-tests.json',JSON.stringify({timestamp:new Date().toISOString(),source:'октябрь',events:34,uniqueClassNames:15,sourceComparison:'PASS',geometry:'PASS',contrasts,draftDescriptions:true,finalizer:final},null,2));
console.log(JSON.stringify({status:'PASS',events:34,uniqueClasses:15,minContrast:Math.min(...Object.values(contrasts)),file:root+'/output/reference-labels-editable.pptx'}));
