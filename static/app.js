const labels=['A','B','C','D'];
const state={records:[],schedule:[],currentDate:'',currentTime:'',filtered:[],page:1,pageSize:10};
const $=s=>document.querySelector(s);
const formatDate=iso=>new Date(`${iso}T00:00:00`).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'});
function drawBlock(type,issue,values){return `<div class="draw"><div class="drawhead"><h2>${type}</h2><span>Issue ${issue}</span></div><div class="positions">${values.map((n,i)=>`<div class="position"><b>[${labels[i]}]</b><div class="balls">${[...n].map(x=>`<i>${x}</i>`).join('')}</div></div>`).join('')}</div></div>`}
function currentRecord(){return state.records.find(r=>r.date===state.currentDate&&r.time===state.currentTime)}
function renderCurrent(){
  const rec=currentRecord();
  $('#draw-meta').textContent=`${formatDate(state.currentDate)} · ${state.currentTime}`;
  if(!rec){
    $('#draws').innerHTML=`<div class="no-result"><strong>No verified result available for this round.</strong><span>Please select another draw time or view the official archive below.</span></div>`;
    $('#notice-copy').textContent=`No verified 2D, 3D and 4D record is available for ${formatDate(state.currentDate)}, ${state.currentTime}.`;
  }else{
    $('#draws').innerHTML=drawBlock('2D',rec.issue2,rec['2D'])+drawBlock('3D',rec.issue3,rec['3D'])+drawBlock('4D',rec.issue4,rec['4D']);
    $('#notice-copy').textContent=`Official 2D, 3D and 4D results for ${formatDate(rec.date)}, ${rec.time} draw.`;
  }
  const idx=state.schedule.indexOf(state.currentTime);
  $('#next-draw-label').textContent=idx===state.schedule.length-1?'Final draw of the day · 20:00':`Next draw: ${state.schedule[idx+1]||'—'}`;
}
function populateSchedules(){
  $('#draw-time').innerHTML=state.schedule.map(t=>`<option value="${t}">${t}</option>`).join('');
  $('#history-time').innerHTML='<option value="">All Draws</option>'+state.schedule.map(t=>`<option value="${t}">${t}</option>`).join('');
  $('#draw-time').value=state.currentTime;
}
function applyFilters(){
  const fromEl=$('#from-date'),toEl=$('#to-date'),timeEl=$('#history-time');
  const from=fromEl && fromEl.value ? fromEl.value : '0000-01-01';
  const to=toEl && toEl.value ? toEl.value : '9999-12-31';
  const time=timeEl ? timeEl.value : '';
  if(from>to){
    if($('#history-summary')) $('#history-summary').textContent='The From date must be earlier than or equal to the To date.';
    return;
  }
  state.filtered=state.records.filter(r=>r.date>=from&&r.date<=to&&(!time||r.time===time));
  state.page=1;
  renderHistory();
}

function rowHtml(r){return `<tr class="history-row" data-date="${r.date}" data-time="${r.time}" title="Open this draw"><td>${r.date}</td><td>${r.time}</td><td><b>${r['2D'].join(' · ')}</b><small>${r.issue2}</small></td><td><b>${r['3D'].join(' · ')}</b><small>${r.issue3}</small></td><td><b>${r['4D'].join(' · ')}</b><small>${r.issue4}</small></td></tr>`}
function renderHistory(){
  const total=state.filtered.length,totalPages=Math.max(1,Math.ceil(total/state.pageSize)); if(state.page>totalPages)state.page=totalPages;
  const start=(state.page-1)*state.pageSize,end=Math.min(start+state.pageSize,total),slice=state.filtered.slice(start,end);
  $('#history-summary').textContent=total?`Showing ${start+1}–${end} of ${total} verified draw records`:'No records found for the selected period.';
  $('#history-body').innerHTML=slice.map(rowHtml).join('')||'<tr><td colspan="5" class="empty-cell">No verified results found.</td></tr>';
  renderPagination(totalPages);
  document.querySelectorAll('.history-row').forEach(row=>row.addEventListener('click',()=>{state.currentDate=row.dataset.date;state.currentTime=row.dataset.time;$('#draw-time').value=state.currentTime;renderCurrent();window.scrollTo({top:0,behavior:'smooth'})}));
}
function renderPagination(totalPages){
  const box=$('#pagination'); if(totalPages<=1){box.innerHTML='';return}
  const parts=[];
  parts.push(`<button data-page="${state.page-1}" ${state.page===1?'disabled':''}>← Previous</button>`);
  let start=Math.max(1,state.page-4),end=Math.min(totalPages,start+9); start=Math.max(1,end-9);
  if(start>1){parts.push(`<button data-page="1">1</button>`); if(start>2)parts.push('<i>…</i>')}
  for(let p=start;p<=end;p++)parts.push(p===state.page?`<b>${p}</b>`:`<button data-page="${p}">${p}</button>`);
  if(end<totalPages){if(end<totalPages-1)parts.push('<i>…</i>');parts.push(`<button data-page="${totalPages}">${totalPages}</button>`)}
  parts.push(`<button data-page="${state.page+1}" ${state.page===totalPages?'disabled':''}>Next →</button>`);
  box.innerHTML=parts.join('');
  box.querySelectorAll('button[data-page]').forEach(btn=>btn.addEventListener('click',()=>{const p=Number(btn.dataset.page);if(p>=1&&p<=totalPages){state.page=p;renderHistory();document.querySelector('#results').scrollIntoView({behavior:'smooth',block:'start'})}}));
}
async function init(){
  try{
    const res=await fetch('./static/results-data.json',{cache:'no-store'}); const data=await res.json(); state.records=data.records; state.schedule=data.schedule;
    const latest=state.records[0]; state.currentDate=latest.date; state.currentTime=latest.time;
    populateSchedules(); renderCurrent(); applyFilters();
    $('#draw-time').addEventListener('change',e=>{state.currentTime=e.target.value;renderCurrent()});
    const form=$('#history-filter-form');
    if(form) form.addEventListener('submit',e=>{e.preventDefault();applyFilters();});
    const searchBtn=$('#search-results');
    if(searchBtn) searchBtn.addEventListener('click',e=>{e.preventDefault();applyFilters();});
    $('#history-time').addEventListener('change',applyFilters);
    $('#from-date').addEventListener('change',()=>{state.page=1;});
    $('#to-date').addEventListener('change',()=>{state.page=1;});
  }catch(err){console.error(err);$('#draws').innerHTML='<div class="no-result"><strong>Unable to load result data.</strong><span>Please refresh the page.</span></div>'}
}
init();
