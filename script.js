// app.js — modular single-file for Cloudi MVP
const SECONDS_PER_MONTH = 30*24*3600;
const DEFAULTS = {
  nodeCost:420, otherCost:980, nodesPerDC:4,
  competitors:{
    AWS:{nodeCap:180000000,nodeCost:500},
    GCP:{nodeCap:190000000,nodeCost:480},
    Azure:{nodeCap:175000000,nodeCost:520},
    NVIDIA:{nodeCap:220000000,nodeCost:1200}
  }
};

function $(id){ return document.getElementById(id); }
function fmt(n){ return typeof n==='number' ? n.toLocaleString() : n; }
function money(n){ if(n===0) return '$0.00'; if(Math.abs(n)<1e-6) return n.toExponential(3); return '$'+Number(n).toLocaleString(undefined,{maximumFractionDigits:6}); }
function now(){ return new Date().toLocaleTimeString(); }
function pushLog(msg){ const el=$('fullLog'); el.textContent = `${now()} — ${msg}\n` + el.textContent; }

// Read UI
function readParams(){
  return {
    ops: Math.max(1, Number($('ops').value) || 1),
    nodeCap: Math.max(1, Number($('nodeCap').value) || 200000000),
    nodesPerDC: Math.max(1, Number($('nodesPerDC').value) || DEFAULTS.nodesPerDC),
    savePct: Math.max(0, Math.min(90, Number($('savePct').value) || 30)),
    markup: Math.max(1, Number($('markup').value) || 3),
    blockSize: Math.max(1, Number($('blockSize').value) || 1000000),
    nodeType: $('nodeType').value
  };
}

// Compute core
function compute(params){
  const nodesRaw = Math.max(1, Math.ceil(params.ops / params.nodeCap));
  const effectiveCap = params.nodeCap * (1 + params.savePct/100);
  const nodesOpt = Math.max(1, Math.ceil(params.ops / effectiveCap));
  const dcs = Math.ceil(nodesOpt / params.nodesPerDC);
  const timeRaw = params.ops / (params.nodeCap * nodesRaw);
  const timeOpt = params.ops / (effectiveCap * nodesOpt);
  const infraMonth = nodesOpt * DEFAULTS.nodeCost + DEFAULTS.otherCost;
  const infraYear = infraMonth * 12;
  const opsPerMonth = effectiveCap * nodesOpt * SECONDS_PER_MONTH;
  const costPerOp = infraMonth / Math.max(1, opsPerMonth);
  const pricePerOp = costPerOp * params.markup;
  const totalPrice = pricePerOp * params.ops;
  const blocks = Math.ceil(params.ops / params.blockSize);
  return {nodesRaw,effectiveCap,nodesOpt,dcs,timeRaw,timeOpt,infraMonth,infraYear,costPerOp,pricePerOp,totalPrice,blocks};
}

// UI updates
function preview(){
  const p=readParams(), r=compute(p);
  $('val_nodecap').innerText = fmt(p.nodeCap);
  $('val_nodesraw').innerText = fmt(r.nodesRaw);
  $('val_nodesopt').innerText = fmt(r.nodesOpt);
  $('val_dcs').innerText = fmt(r.dcs);
  $('val_time').innerText = `${r.timeOpt.toFixed(6)} s (Cloudi) · raw ${r.timeRaw.toFixed(6)} s`;
  $('val_costop').innerText = (Math.abs(r.pricePerOp)<1e-6)? r.pricePerOp.toExponential(3): money(r.pricePerOp);
  $('infraMonthVal').innerText = money(r.infraMonth);
  $('infraYearVal').innerText = money(r.infraYear);
  renderDCs(r.nodesOpt,p.nodesPerDC);
  buildComparison(p,r);
  pushLog(`Preview: ops=${fmt(p.ops)}, nodeCap=${fmt(p.nodeCap)}, save=${p.savePct}%, nodes=${r.nodesOpt}, time=${r.timeOpt.toFixed(6)}s`);
}

// Render DCs/nodes
function renderDCs(nodes,nodesPerDC){
  const area = $('dcArea'); area.innerHTML='';
  const dcs = Math.max(1, Math.ceil(nodes / nodesPerDC));
  let idx=0;
  for(let d=0; d<dcs; d++){
    const dc = document.createElement('div'); dc.className='dc';
    dc.innerHTML = `<div style="font-weight:700">DC ${d+1}</div>`;
    for(let n=0;n<nodesPerDC;n++){
      const node = document.createElement('div'); node.className='node';
      if(idx < nodes){ node.dataset.active='1'; node.title='node-'+(idx+1); }
      else node.dataset.active='0';
      dc.appendChild(node); idx++;
    }
    area.appendChild(dc);
  }
  $('infraStatus').innerText = `Rendered ${nodes} nodes across ${Math.ceil(nodes/nodesPerDC)} DCs`;
}

// Packing
function generateMatrix(){
  const p=readParams(), r=compute(p);
  const blocks = r.blocks;
  const perNodeLimitBlocks = Math.max(1, Math.floor((r.effectiveCap*0.9) / p.blockSize));
  const nodesAssigned = []; let rem = blocks;
  while(rem>0){ const take = Math.min(perNodeLimitBlocks, rem); nodesAssigned.push(take); rem -= take; }
  const area = $('matrixArea'); area.innerHTML = `<div class="muted small">Blocks: ${blocks}, perNodeLimitBlocks: ${perNodeLimitBlocks}, nodesAssigned: ${nodesAssigned.length}</div>`;
  const tbl = document.createElement('table'); tbl.className = 'table';
  tbl.innerHTML = '<tr><th>Node</th><th>Assigned blocks</th><th>ops/node</th></tr>';
  nodesAssigned.forEach((b,i) => {
    const row = tbl.insertRow(-1);
    row.insertCell(0).textContent = 'node-'+(i+1);
    row.insertCell(1).textContent = `${b} blocks`;
    row.insertCell(2).textContent = fmt(b * p.blockSize);
    pushPack(`Assigned ${b} blocks -> node-${i+1}`);
  });
  area.appendChild(tbl);
  pushLog(`Compute Matrix generated: ${blocks} blocks into ${nodesAssigned.length} nodes.`);
}

function pushPack(msg){ const el = $('packLog'); el.textContent = `${now()} — ${msg}\n` + el.textContent; }

// ML loop (simulated)
let mlRunning=false, mlTimer=null;
function toggleML(){
  mlRunning = !mlRunning;
  $('btnML').innerText = mlRunning ? 'Stop ML loop' : 'Start ML loop';
  if(mlRunning){ mlTimer = setInterval(mlStep, 3000); pushLog('ML loop started'); }
  else { clearInterval(mlTimer); pushLog('ML loop stopped'); }
}
function mlStep(){
  const el = $('savePct'); let v = Number(el.value);
  if(v < 60){ v = +(v + Math.max(0.5, v*0.02)).toFixed(2); el.value = Math.min(60, v); preview(); updateMLChart(v); pushLog(`ML improved savePct -> ${el.value}%`); }
}

// Charts
let mlChart=null, nodesChart=null, cmpChart=null;
function initCharts(){
  try{
    const ctxML = $('mlChart').getContext('2d');
    mlChart = new Chart(ctxML, { type:'line', data:{labels:[],datasets:[{label:'save%',data:[],borderColor:'#0b63c6',fill:false}]}, options:{responsive:true,maintainAspectRatio:false}});
    const ctxN = $('nodesChart').getContext('2d');
    nodesChart = new Chart(ctxN, { type:'line', data:{labels:[],datasets:[{label:'active nodes',data:[],borderColor:'#16a34a',fill:false}]}, options:{responsive:true,maintainAspectRatio:false}});
    const ctxC = $('cmpChart').getContext('2d');
    cmpChart = new Chart(ctxC, { type:'bar', data:{labels:[],datasets:[{label:'Total $',data:[],backgroundColor:['#0b63c6','#3b82f6','#60a5fa','#93c5fd']}]}, options:{responsive:true,maintainAspectRatio:false}});
  }catch(e){ console.warn('Chart init error', e); }
}
function updateMLChart(val){ if(!mlChart) initCharts(); mlChart.data.labels.push(new Date().toLocaleTimeString()); mlChart.data.datasets[0].data.push(Number(val)); if(mlChart.data.labels.length>40){ mlChart.data.labels.shift(); mlChart.data.datasets[0].data.shift(); } mlChart.update(); }
function updateNodesChart(val){ if(!nodesChart) initCharts(); nodesChart.data.labels.push(new Date().toLocaleTimeString()); nodesChart.data.datasets[0].data.push(val); if(nodesChart.data.labels.length>40){ nodesChart.data.labels.shift(); nodesChart.data.datasets[0].data.shift(); } nodesChart.update(); }

// Start full simulation
async function startAll(){
  initCharts(); preview();
  const p = readParams(), r = compute(p);
  pushLog(`Start full simulation: ops=${fmt(p.ops)}, nodeCap=${fmt(p.nodeCap)}, save=${p.savePct}%`);
  const baseline = await baselineTest(); pushLog(`Baseline microtest: ${fmt(baseline)} ops/sec`);

  const steps = 6; const timeline = [];
  for(let i=0;i<steps;i++) timeline.push(0.7 + Math.random()*1.3);
  pushLog(`Predicted load timeline: [${timeline.map(x => x.toFixed(2)).join(', ')}]`);

  for(let i=0;i<timeline.length;i++){
    const factor = timeline[i];
    const nodesNeeded = Math.max(1, Math.ceil(r.nodesOpt * factor));
    await animateScale(nodesNeeded);
    updateNodesChart(nodesNeeded);
    pushLog(`Step ${i+1}: factor=${factor.toFixed(2)}, nodesNeeded=${nodesNeeded}`);
    await sleep(700);
  }
  pushLog(`Simulation complete. Final estimate time=${r.timeOpt.toFixed(6)} s, total price=${money(r.totalPrice)}`);
}

function animateScale(target){
  return new Promise(res=>{
    const nodes = Array.from(document.querySelectorAll('.node'));
    nodes.forEach((n,i)=> n.classList.toggle('busy', i<target));
    const perc = Math.min(100, Math.round((target / Math.max(1,nodes.length)) * 100));
    $('prog').style.width = perc+'%'; $('prog').textContent = perc+'%';
    $('eta').textContent = `ETA: ~${(Math.random()*1+0.2).toFixed(2)} s`;
    setTimeout(res,250);
  });
}

function baselineTest(){ return new Promise(resolve => { const ops=150000; const start=performance.now(); let s=0; for(let i=0;i<ops;i++) s += i%11; const dur=(performance.now()-start)/1000; const opsSec = Math.max(1, Math.round(ops / Math.max(dur, 0.0001))); resolve(opsSec); }); }

// Comparison
function buildComparison(p,r){
  const tbody = $('cmpTable').querySelector('tbody'); tbody.innerHTML='';
  addCmpRow(tbody, 'Cloudi (opt)', r.pricePerOp, r.totalPrice, r.timeOpt);
  const labels = ['Cloudi'], totals = [Number(r.totalPrice.toFixed(2))];
  for(const [k,v] of Object.entries(DEFAULTS.competitors)){
    const nodesC = Math.max(1, Math.ceil(p.ops / v.nodeCap));
    const infraC = nodesC * v.nodeCost + DEFAULTS.otherCost;
    const opsPerMonthC = v.nodeCap * nodesC * SECONDS_PER_MONTH;
    const costPerOpC = infraC / Math.max(1, opsPerMonthC);
    const pricePerOpC = costPerOpC * p.markup;
    const totalC = pricePerOpC * p.ops;
    const timeC = p.ops / (v.nodeCap * nodesC);
    addCmpRow(tbody, k, pricePerOpC, totalC, timeC);
    labels.push(k); totals.push(Number(totalC.toFixed(2)));
  }
  if(!cmpChart) initCharts();
  cmpChart.data.labels = labels; cmpChart.data.datasets[0].data = totals;
  cmpChart.update();
}

function addCmpRow(tbody, name, costOp, total, time){
  const tr = document.createElement('tr');
  tr.innerHTML = `<td>${name}</td><td>${(Math.abs(costOp)<1e-6)? costOp.toExponential(3) : money(costOp)}</td><td>${money(total)}</td><td>${time.toFixed(3)}</td>`;
  tbody.appendChild(tr);
}

// Storage
const BUCKETS = {};
function createBucket(){
  const name = $('bucketName').value.trim();
  if(!name) return alert('Enter bucket name');
  if(BUCKETS[name]) return alert('Bucket exists');
  BUCKETS[name] = [];
  renderBuckets(); pushLog(`Bucket created: ${name}`);
}
function renderBuckets(){
  const area = $('bucketsArea'); area.innerHTML = '';
  for(const k of Object.keys(BUCKETS)){
    const div = document.createElement('div'); div.className='card';
    div.style.marginBottom='8px';
    div.innerHTML = `<div style="font-weight:700">${k}</div><div class="muted small">${BUCKETS[k].length} objects • est ${(BUCKETS[k].length*0.001).toFixed(4)} $/mo</div>
      <div style="margin-top:6px"><button class="btn ghost" onclick="uploadFake('${k}')">Upload fake file</button></div>`;
    area.appendChild(div);
  }
}
function uploadFake(bucket){
  BUCKETS[bucket].push({name:'file_'+(BUCKETS[bucket].length+1), size: Math.round(Math.random()*1000)});
  renderBuckets(); pushLog(`Uploaded fake file to ${bucket}`);
}

// AI call
function callAI(){
  const prompt = $('aiPrompt').value || 'Hello';
  $('aiResp').innerText = 'Processing...';
  const latency = 120 + Math.random()*200;
  setTimeout(()=>{ const resp = `Simulated answer to: "${prompt}". (latency ${Math.round(latency)} ms)`; $('aiResp').innerText = resp; pushLog(`AI inference: prompt="${prompt}", latency=${Math.round(latency)} ms`); }, latency);
}

// Metrics & anomalies
function generateMetrics(){
  const p = readParams();
  const p95 = Number($('p95').value || 250);
  const rps = Number($('rps').value || 100000);
  $('metricsArea').innerText = `p50: ${(p95*0.6).toFixed(1)} ms • p95: ${p95} ms • p99: ${(p95*1.6).toFixed(1)} ms • RPS: ${fmt(rps)}`;
  pushLog(`Metrics generated: p95=${p95}ms, RPS=${rps}`);
}

function simulateAnom(){
  $('anomaly').innerText='true';
  $('slaLog').textContent = `${now()} — anomaly: latency spike\n` + $('slaLog').textContent;
  pushLog('Anomaly simulated. Auto-heal triggered.');
  const nodes = document.querySelectorAll('.node');
  nodes.forEach(n => n.classList.add('busy','err'));
  setTimeout(()=>{ nodes.forEach(n => n.classList.remove('err')); $('anomaly').innerText='false'; pushLog('Auto-heal complete'); }, 2800);
}
function resolveAnom(){ $('anomaly').innerText='false'; $('slaLog').textContent = `${now()} — anomaly resolved\n` + $('slaLog').textContent; pushLog('Anomaly resolved'); }

// API
function apiCall(){
  try{
    const req = JSON.parse($('apiReq').value);
    pushLog(`API request: ${JSON.stringify(req)}`);
    setTimeout(()=>{ const resp = {status:'accepted', estimate_s:(Math.random()*1).toFixed(3), nodes: Math.floor(Math.random()*6)+1}; $('apiResp').value = JSON.stringify(resp); pushLog(`API response: ${JSON.stringify(resp)}`); }, 600);
  }catch(e){ alert('Invalid JSON'); }
}

// Utilities
function sleep(ms){ return new Promise(r => setTimeout(r, ms)); }
function resetDefaults(){ $('ops').value='1000000000'; $('nodeCap').value='200000000'; $('savePct').value='30'; $('markup').value='3'; $('blockSize').value='1000000'; preview(); pushLog('Reset defaults'); }
function copySummary(){ const text = `Cloudi summary\nops: ${$('ops').value}\nnodeCap: ${$('nodeCap').value}\nsave%: ${$('savePct').value}\nnodes: ${$('val_nodesopt').innerText}\ntime: ${$('val_time').innerText}\ncost/op: ${$('val_costop').innerText}`; navigator.clipboard?.writeText(text).then(()=> alert('Summary copied')); }
function downloadReport(){ const blob = new Blob([$('fullLog').textContent], {type: 'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='cloudi_log.txt'; a.click(); URL.revokeObjectURL(url); }
function downloadJSON(){
  const p = readParams(); const r = compute(p);
  const obj = {params: p, result: r, ts: new Date().toISOString()};
  const blob = new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='cloudi_preview.json'; a.click(); URL.revokeObjectURL(url);
}

// Wire events
window.addEventListener('load', () => {
  $('btnPreview').addEventListener('click', preview);
  $('btnStart').addEventListener('click', startAll);
  $('btnGenMatrix').addEventListener('click', generateMatrix);
  $('btnCreateBucket').addEventListener('click', createBucket);
  $('btnAI').addEventListener('click', callAI);
  $('btnMetrics').addEventListener('click', generateMetrics);
  $('btnAnom').addEventListener('click', simulateAnom);
  $('btnResolve').addEventListener('click', resolveAnom);
  $('btnApi').addEventListener('click', apiCall);
  $('btnDownloadJson').addEventListener('click', downloadJSON);
  $('btnReset').addEventListener('click', resetDefaults);
  $('btnCopy').addEventListener('click', copySummary);
  $('btnDownloadLog').addEventListener('click', downloadReport);
  $('btnML').addEventListener('click', toggleML);
  $('btnPacking').addEventListener('click', () => alert('Packing uses greedy bin-packing for demo.'));
  initCharts(); preview(); pushLog('Cloudi: modular MVP ready');
});