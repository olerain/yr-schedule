from pathlib import Path
from PIL import ImageFont
import json
r=Path('/Users/olerain/Documents/ChatGPT/yogi-room-schedule-october-2026/.build')
old=json.loads((r/'teal-tall-before.json').read_text())['structuredContent']
now=json.loads((r/'compact-teal-before.json').read_text())['structuredContent']
ids={e['objectId']:e for s in now['slides'] for e in s['pageElements']}
def tx(e):return ''.join(t.get('textRun',{}).get('content','') for t in e.get('shape',{}).get('text',{}).get('textElements',[])).strip()
def box(e):
 t=e['transform'];z=e['size'];return [t.get('translateX',0)/9525,t.get('translateY',0)/9525,z['width']['magnitude']*t['scaleX']/9525,z['height']['magnitude']*t['scaleY']/9525]
def near(a,b):return all(abs(x-y)<.08 for x,y in zip(a,b))
plans={};sizes={};oldmap={};changed=[]
for s in old['slides']:
 for e in s['pageElements']:
  oid=e['objectId'];oldmap[oid]=e
  if oid not in ids:continue
  plans[oid]=e['transform']
  run=next((t['textRun'] for t in e.get('shape',{}).get('text',{}).get('textElements',[]) if t.get('textRun',{}).get('content','').strip()),None)
  if run:sizes[oid]=run['style']['fontSize']
  if tx(e)!=tx(ids[oid]):changed.append(oid)
# Preserve the user's edited wording and fit its existing colored pill.
fitted=[]
for oid in changed:
 e=oldmap[oid];b=box(e)
 bg=next((v for v in oldmap.values() if not tx(v) and near(box(v),[b[0]-10,b[1],b[2]+20,b[3]])),None)
 if not bg or bg['objectId'] not in ids:continue
 label=tx(ids[oid]);px=sizes[oid]['magnitude']/0.75
 while True:
  font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',round(px*4))
  width=font.getlength(label)/4
  if width<=306 or px<=22:break
  px-=.5
 assert width<=306,(label,width)
 ob=box(bg);pw=min(326,max(190,width+32));cx=ob[0]+ob[2]/2
 for shape,bounds in [(bg,[cx-pw/2,ob[1],pw,ob[3]]),(e,[cx-pw/2+10,b[1],pw-20,b[3]])]:
  z=shape['size'];plans[shape['objectId']]={'scaleX':bounds[2]*9525/z['width']['magnitude'],'scaleY':bounds[3]*9525/z['height']['magnitude'],'translateX':bounds[0]*9525,'translateY':bounds[1]*9525,'unit':'EMU'}
 sizes[oid]={'magnitude':px*.75,'unit':'PT'}
 fitted.append({'id':oid,'text':label,'width':pw,'fontPx':px})
req=[{'updatePageElementTransform':{'objectId':oid,'applyMode':'ABSOLUTE','transform':t}} for oid,t in plans.items()]
req.extend({'updateTextStyle':{'objectId':oid,'textRange':{'type':'ALL'},'style':{'fontSize':fs},'fields':'fontSize'}} for oid,fs in sizes.items())
removed=[oid for oid in ids if oid.startswith('teacher_week_') or oid.startswith('teacher_sample_')]
assert len(removed)==49
req.extend({'deleteObject':{'objectId':oid}} for oid in removed)
(r/'compact-teal-revert-requests.json').write_text(json.dumps(req,separators=(',',':')))
(r/'compact-teal-revert-plan.json').write_text(json.dumps({'removedTeachers':49,'size':[2800,2700],'restoredObjects':len(plans),'userEditedTextsPreserved':len(changed),'fittedPills':fitted,'skippedMissingBlankObjects':[k for k in oldmap if k not in ids]},ensure_ascii=False,indent=2))
print(json.dumps({'requests':len(req),'userEditedTextsPreserved':len(changed),'fittedPills':len(fitted),'removedTeachers':49}))
