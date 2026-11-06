import json, math, re
from pathlib import Path
root=Path('/Users/olerain/Documents/ChatGPT/yogi-room-schedule-october-2026')
raw=json.loads((root/'.build/teal-tall-before.json').read_text())
p=raw['structuredContent']
logs=json.loads((root/'.build/reference-labels-layout.json').read_text())
source=json.loads((root/'.build/source-reference-labels.json').read_text())
EMU=9525
TEAL='#007F87'
INK='#302D38'
MUTED='#69696F'
plans={};fonts={};colors={};creates=[];used=set();checks=[]
def text(e):return ''.join(v.get('textRun',{}).get('content','') for v in e.get('shape',{}).get('text',{}).get('textElements',[])).strip()
def box(e):
 t=e['transform'];z=e['size']
 return [t.get('translateX',0)/EMU,t.get('translateY',0)/EMU,z['width']['magnitude']*t['scaleX']/EMU,z['height']['magnitude']*t['scaleY']/EMU]
def near(a,b):return all(abs(x-y)<.08 for x,y in zip(a,b))
def take(s,b,txt=None):
 found=[e for e in s['pageElements'] if e['objectId'] not in used and near(box(e),b) and ((not text(e)) if txt is None else text(e)==txt)]
 assert len(found)==1,(s['objectId'],b,txt,[(e['objectId'],text(e),box(e)) for e in found])
 e=found[0];used.add(e['objectId']);return e
def move(e,b,size=None):
 assert b[0]>=0 and b[1]>=0 and b[0]+b[2]<=2801 and b[1]+b[3]<=4501,b
 plans[e['objectId']]=b
 if size is not None:fonts[e['objectId']]=size
def rgb(h):return {k:int(h[i:i+2],16)/255 for k,i in [('red',1),('green',3),('blue',5)]}
def isbrand(c):return c and all(abs(c.get(k,0)-v)<.0001 for k,v in rgb('#584080').items())
allshapes={e['objectId']:e for s in p['slides'] for e in s['pageElements']}
for s in p['slides']:
 for e in s['pageElements']:
  plans[e['objectId']]=box(e)
  fill=e.get('shape',{}).get('shapeProperties',{}).get('shapeBackgroundFill',{}).get('solidFill',{}).get('color',{}).get('rgbColor')
  if isbrand(fill):colors[e['objectId']]='fill'
  for tr in e.get('shape',{}).get('text',{}).get('textElements',[]):
   c=tr.get('textRun',{}).get('style',{}).get('foregroundColor',{}).get('opaqueColor',{}).get('rgbColor')
   if isbrand(c):colors[e['objectId']]='text'
def teacher(e):
 cell=source['values'][int(e['event'][1:])-1][ord(e['event'][0])-65]
 a=[v.strip() for v in cell.split('\n') if re.match(r'^(Ольга|Дарья|Нина|Юлия|Инна|Светлана|Анна) ',v.strip())]
 return a[0] if a else None
def addteacher(s,e,x,y,w,h,size,suffix):
 full=teacher(e);label=full.replace(' ','\n',1) if full else 'Преподаватель\nуточняется'
 oid='teacher_'+suffix+'_'+e['event']
 creates.extend([
 {'createShape':{'objectId':oid,'shapeType':'TEXT_BOX','elementProperties':{'pageObjectId':s['objectId'],'size':{'width':{'magnitude':w*EMU,'unit':'EMU'},'height':{'magnitude':h*EMU,'unit':'EMU'}},'transform':{'scaleX':1,'scaleY':1,'translateX':x*EMU,'translateY':y*EMU,'unit':'EMU'}}}},
 {'insertText':{'objectId':oid,'text':label,'insertionIndex':0}},
 {'updateTextStyle':{'objectId':oid,'textRange':{'type':'ALL'},'style':{'fontFamily':'Arial','fontSize':{'magnitude':size*.75,'unit':'PT'},'foregroundColor':{'opaqueColor':{'rgbColor':rgb(MUTED)}},'bold':False},'fields':'fontFamily,fontSize,foregroundColor,bold'}},
 {'updateParagraphStyle':{'objectId':oid,'textRange':{'type':'ALL'},'style':{'alignment':'CENTER','lineSpacing':110,'spaceAbove':{'magnitude':0,'unit':'PT'},'spaceBelow':{'magnitude':0,'unit':'PT'}},'fields':'alignment,lineSpacing,spaceAbove,spaceBelow'}},
 {'updateShapeProperties':{'objectId':oid,'shapeProperties':{'contentAlignment':'MIDDLE','outline':{'propertyState':'NOT_RENDERED'},'shapeBackgroundFill':{'propertyState':'NOT_RENDERED'}},'fields':'contentAlignment,outline.propertyState,shapeBackgroundFill.propertyState'}}
 ])
 return full,label,oid
def fmt(v):return str(v//60)+':'+str(v%60).zfill(2)
top=358;oldscale=2.9;newscale=5.4
osplit=top+435*oldscale;oeven=osplit+86;obottom=oeven+225*oldscale
nsplit=top+435*newscale;neven=nsplit+110;nbottom=neven+225*newscale
def oy(t):return top+(t-480)*oldscale if t<=915 else oeven+(t-1110)*oldscale
def ny(t):return top+(t-480)*newscale if t<=915 else neven+(t-1110)*newscale
s=p['slides'][0]
for d in range(8):
 x=252+d*352
 move(take(s,[x,top,1,osplit-top]),[x,top,1,nsplit-top])
 move(take(s,[x,oeven,1,obottom-oeven]),[x,neven,1,nbottom-neven])
for t in [480,540,600,660,720,780,840,900,1140,1200,1260,1320]:
 move(take(s,[252,oy(t),2464,1]),[252,ny(t),2464,1])
 move(take(s,[84,oy(t)-20,140,40],fmt(t)),[84,ny(t)-22,140,44],32)
move(take(s,[800,osplit+20,1400,46],'15:15–18:30  ·  Перерыв'),[800,nsplit+30,1400,50],34)
missing=[]
for e in logs:
 x,y,bw,eh=e['x'],e['y'],e['width'],e['height']
 newy=ny(e['start'])+5;newh=(e['end']-e['start'])*newscale-10 if e['end'] is not None else 288
 move(take(s,[x,y,bw,eh]),[x,newy,bw,newh])
 oldnf=29 if e['title'].startswith('Здоровая спина /') else 30
 oldnh=oldnf*1.12*len(e['title'].split('\n'));oldcy=y+(eh-(36+8+oldnh+10+36))/2
 nf=32 if e['title'].startswith('Здоровая спина /') else 34
 nh=nf*1.12*len(e['title'].split('\n'))
 content=44+18+nh+18+72+22+40
 assert content<=newh-18,(e['event'],content,newh)
 cy=newy+(newh-content)/2
 tt=fmt(e['start'])+'–'+fmt(e['end']) if e['end'] is not None else 'с '+fmt(e['start'])
 move(take(s,[x+8,oldcy,bw-16,36],tt),[x+8,cy,bw-16,44],36)
 move(take(s,[x+8,oldcy+44,bw-16,oldnh],e['title']),[x+8,cy+62,bw-16,nh],nf)
 fullname,label,oid=addteacher(s,e,x+8,cy+62+nh+18,bw-16,72,30,'week')
 if fullname is None:missing.append(e['event'])
 oldpw=e['pill']['width'];oldpy=oldcy+44+oldnh+10
 newpw=min(bw-14,max(200,len(e['draftDescription'])*26*.57+32));px=x+(bw-newpw)/2;py=cy+62+nh+18+72+22
 move(take(s,[x+(bw-oldpw)/2,oldpy,oldpw,36]),[px,py,newpw,40])
 move(take(s,[x+(bw-oldpw)/2+10,oldpy,oldpw-20,36],e['draftDescription']),[px+10,py,newpw-20,40],26)
 if e['end'] is None:
  for k in range(0,int(math.ceil(bw)),18):move(take(s,[x+k,y+eh-2,min(8,bw-k),1.5]),[x+k,newy+newh-2,min(8,bw-k),1.5])
 checks.append({'event':e['event'],'title':e['title'],'time':tt,'teacher':fullname,'teacherText':label,'teacherObjectId':oid,'box':[x,newy,bw,newh],'contentHeight':content,'minGap':18})
for g,x,y in [('yoga',252,2420),('aero',252,2464),('nidra',252,2508),('pilates',1110,2420),('back',1110,2464),('fitness',1940,2420),('stretch',1940,2464)]:
 newy=4092+(y-2420)/44*50
 move(take(s,[x,y+6,28,28]),[x,newy+7,30,30])
 labels={'yoga':'Йога','aero':'Аэройога','nidra':'Йога-нидра','pilates':'Пилатес','back':'Здоровая спина','fitness':'Функциональная и пресс','stretch':'Растяжка и гибкость'}
 move(take(s,[x+44,y,730,40],labels[g]),[x+48,newy,730,44],31)
move(take(s,[84,2580,2632,1.5]),[84,4320,2632,1.5])
for txt,b in [('Запись у администратора или в приложении YOGI ROOM',[84,2604,1950,52]),('+7 (995) 090-06-17',[2050,2604,666,52])]:move(take(s,b,txt),[b[0],4355,b[2],58],37)
# Reuse the native sample objects on page two, with space for teacher names.
q=p['slides'][1]
unique={}
for e in logs:unique[e['title']]=e
for i,e in enumerate(unique.values()):
 x=100+(i%3)*905;y=430+(i//3)*402;newy=500+(i//3)*740;bw=790
 tt=fmt(e['start'])+'–'+fmt(e['end']) if e['end'] is not None else 'с '+fmt(e['start'])
 nh=len(e['title'].split('\n'))*52;newnh=len(e['title'].split('\n'))*58
 move(take(q,[x,y,bw,44],tt),[x,newy,bw,48],36)
 move(take(q,[x,y+62,bw,nh],e['title']),[x,newy+80,bw,newnh],48)
 addteacher(q,e,x,newy+80+newnh+30,bw,92,38,'sample')
 label=e['draftDescription'];oldpw=min(bw-50,max(190,len(label)*33*.57+28));oldpy=y+88+nh
 pw=min(bw-50,max(240,len(label)*35*.57+34));py=newy+80+newnh+30+92+32
 move(take(q,[x+(bw-oldpw)/2,oldpy,oldpw,54]),[x+(bw-pw)/2,py,pw,60])
 move(take(q,[x+(bw-oldpw)/2+10,oldpy,oldpw-20,54],label),[x+(bw-pw)/2+12,py,pw-24,60],35)
 move(take(q,[x,y+325,bw,1]),[x,newy+540,bw,1])
move(take(q,[84,2530,2632,58],'Правки образцов на этой странице не меняют расписание автоматически.'),[84,4370,2632,64],35)
requests=[]
for oid,b in plans.items():
 e=allshapes[oid];z=e['size']
 requests.append({'updatePageElementTransform':{'objectId':oid,'applyMode':'ABSOLUTE','transform':{'scaleX':b[2]*EMU/z['width']['magnitude'],'scaleY':b[3]*EMU/z['height']['magnitude'],'translateX':b[0]*EMU,'translateY':b[1]*EMU,'unit':'EMU'}}})
for oid,size in fonts.items():requests.append({'updateTextStyle':{'objectId':oid,'textRange':{'type':'ALL'},'style':{'fontSize':{'magnitude':size*.75,'unit':'PT'}},'fields':'fontSize'}})
for oid,kind in colors.items():
 if kind=='fill':requests.append({'updateShapeProperties':{'objectId':oid,'shapeProperties':{'shapeBackgroundFill':{'solidFill':{'color':{'rgbColor':rgb(TEAL)},'alpha':1}}},'fields':'shapeBackgroundFill.solidFill'}})
 else:requests.append({'updateTextStyle':{'objectId':oid,'textRange':{'type':'ALL'},'style':{'foregroundColor':{'opaqueColor':{'rgbColor':rgb(TEAL)}}},'fields':'foregroundColor'}})
requests.extend(creates)
assert len(checks)==34 and len(missing)==3
(root/'.build/teal-tall-requests.json').write_text(json.dumps(requests,ensure_ascii=False,separators=(',',':')))
(root/'.build/teal-tall-planned.json').write_text(json.dumps({'size':[2800,4500],'teal':TEAL,'hourScaleBefore':oldscale,'hourScaleAfter':newscale,'brandObjects':colors,'missingTeacherCells':missing,'checks':checks,'requests':len(requests)},ensure_ascii=False,indent=2))
print(json.dumps({'requests':len(requests),'events':len(checks),'missingTeacherCells':missing,'size':[2800,4500],'brandObjects':len(colors)},ensure_ascii=False))
