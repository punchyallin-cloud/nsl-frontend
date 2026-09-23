const data=[['2D','N01260916006',['15','82','35','21']],['3D','N02260916006',['387','609','288','423']],['4D','N03260916006',['4267','0417','9020','4179']]];
const labels=['A','B','C','D'];
document.querySelector('#draws').innerHTML=data.map(r=>`<div class="draw"><div class="drawhead"><h2>${r[0]}</h2><span>Issue ${r[1]}</span></div><div class="positions">${r[2].map((n,i)=>`<div class="position"><b>[${labels[i]}]</b><div class="balls">${[...n].map(x=>`<i>${x}</i>`).join('')}</div></div>`).join('')}</div></div>`).join('');

const SOURCES=[
 {hour:18,minute:30,label:'18:30 · Northern Lottery Result',url:'https://xosothantai.mobi/xsmb-sxmb-xstd-xshn-kqxsmb-ket-qua-xo-so-mien-bac.html'},
 {hour:19,minute:30,label:'19:30 · ML Nh Ngoc Result',url:'https://www.mlnhngoc.net/'}
];
const frame=document.querySelector('#resultFrame'), wait=document.querySelector('#waitingAnimation'), pill=document.querySelector('#feedPill'), title=document.querySelector('#feedTitle'), sub=document.querySelector('#feedSub'), countdown=document.querySelector('#countdown'), sourceLabel=document.querySelector('#sourceLabel'), fallback=document.querySelector('#sourceFallback');
let activeUrl='';
function bangkokNow(){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date());
 return Object.fromEntries(parts.filter(x=>x.type!=='literal').map(x=>[x.type,Number(x.value)]));
}
function secondsTo(h,m,now){return (h*3600+m*60)-(now.hour*3600+now.minute*60+now.second)}
function fmt(sec){sec=Math.max(0,sec);return [Math.floor(sec/3600),Math.floor(sec%3600/60),sec%60].map(n=>String(n).padStart(2,'0')).join(':')}
function showWaiting(next,sec){
 frame.hidden=true; wait.hidden=false; pill.textContent='WAITING'; pill.classList.remove('is-live'); title.textContent='Waiting for Official Result'; sub.textContent=`Next source opens automatically at ${String(next.hour).padStart(2,'0')}:${String(next.minute).padStart(2,'0')}`; countdown.textContent=fmt(sec); sourceLabel.textContent='Schedule: 18:30 / 19:30 (UTC+7)'; fallback.hidden=true;
}
function showSource(src){
 wait.hidden=true; frame.hidden=false; pill.textContent='LIVE'; pill.classList.add('is-live'); sourceLabel.textContent=src.label; fallback.href=src.url; fallback.hidden=false;
 if(activeUrl!==src.url){ activeUrl=src.url; frame.src=src.url; }
}
function updateFeed(){
 const n=bangkokNow(), t=n.hour*60+n.minute;
 if(t<18*60+30){showWaiting(SOURCES[0],secondsTo(18,30,n));return}
 if(t<19*60+30){showSource(SOURCES[0]);return}
 showSource(SOURCES[1]);
}
updateFeed();setInterval(updateFeed,1000);
// Refresh the active provider periodically during result time without flashing the page.
setInterval(()=>{if(activeUrl&&!frame.hidden) frame.src=activeUrl;},60000);
