const data=[['2D','N01260916006',['15','82','35','21']],['3D','N02260916006',['387','609','288','423']],['4D','N03260916006',['4267','0417','9020','4179']]];
const labels=['A','B','C','D'];
document.querySelector('#draws').innerHTML=data.map(r=>`<div class="draw"><div class="drawhead"><h2>${r[0]}</h2><span>Issue ${r[1]}</span></div><div class="positions">${r[2].map((n,i)=>`<div class="position"><b>[${labels[i]}]</b><div class="balls">${[...n].map(x=>`<i>${x}</i>`).join('')}</div></div>`).join('')}</div></div>`).join('');

const SOURCES=[
 {hour:18,minute:30,label:'18:30 · Northern Lottery Result',url:'https://xosothantai.mobi/xsmb-sxmb-xstd-xshn-kqxsmb-ket-qua-xo-so-mien-bac.html'},
 {hour:19,minute:30,label:'19:30 · ML Nh Ngoc Result',url:'https://www.mlnhngoc.net/'}
];
const frame=document.querySelector('#resultFrame'), wait=document.querySelector('#waitingAnimation'), pill=document.querySelector('#feedPill'), title=document.querySelector('#feedTitle'), sub=document.querySelector('#feedSub'), countdown=document.querySelector('#countdown'), sourceLabel=document.querySelector('#sourceLabel'), fallback=document.querySelector('#sourceFallback');
let activeUrl='';
const nextSourceLabel=document.querySelector('#nextSourceLabel');
function feedState(date=new Date()){
 // UTC arithmetic keeps the schedule independent of the visitor's device timezone.
 const local=new Date(date.getTime()+7*3600000);
 const seconds=local.getUTCHours()*3600+local.getUTCMinutes()*60+local.getUTCSeconds();
 const first=SOURCES[0].hour*3600+SOURCES[0].minute*60;
 const second=SOURCES[1].hour*3600+SOURCES[1].minute*60;
 if(seconds<first) return {active:null,next:SOURCES[0],remaining:first-seconds,tomorrow:false};
 if(seconds<second) return {active:SOURCES[0],next:SOURCES[1],remaining:second-seconds,tomorrow:false};
 return {active:SOURCES[1],next:SOURCES[0],remaining:86400+first-seconds,tomorrow:true};
}
function fmt(sec){return [Math.floor(sec/3600),Math.floor(sec%3600/60),sec%60].map(n=>String(n).padStart(2,'0')).join(':')}
function updateFeed(){
 const state=feedState();
 const nextTime=String(state.next.hour).padStart(2,'0')+':'+String(state.next.minute).padStart(2,'0');
 nextSourceLabel.textContent='Next source: '+nextTime+(state.tomorrow?' tomorrow':' today')+' (UTC+7)';
 countdown.textContent=fmt(state.remaining);
 if(!state.active){
  frame.hidden=true; wait.hidden=false; pill.textContent='WAITING'; pill.classList.remove('is-live');
  title.textContent='Waiting for Official Result'; sub.textContent='Next source opens automatically at '+nextTime+' (UTC+7)';
  sourceLabel.textContent='Schedule: 18:30 / 19:30 (UTC+7)'; fallback.hidden=true;
  if(activeUrl){frame.removeAttribute('src');activeUrl='';}
  return;
 }
 const src=state.active;
 wait.hidden=true; frame.hidden=false; pill.textContent='SOURCE'; pill.classList.add('is-live');
 sourceLabel.textContent=src.label+' (UTC+7)'; fallback.href=src.url; fallback.hidden=false;
 if(activeUrl!==src.url){activeUrl=src.url;frame.src=src.url;}
}
updateFeed();setInterval(updateFeed,1000);
// Refresh only while a scheduled source is visible.
setInterval(()=>{if(activeUrl&&!frame.hidden) frame.src=activeUrl;},60000);
