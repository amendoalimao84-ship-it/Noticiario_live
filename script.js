/* ============================
   CONFIGURAÇÕES
   ============================
   - Exemplos reais de API: NewsAPI (https://newsapi.org)
   - GOOGLE TRENDS: exige proxy / servidor por CORS; aqui há fallback
   - Se quiser dados reais, crie chaves e substitua os placeholders abaixo.
*/

const CONFIG = {
  NEWSAPI_KEY: '', // COLE AQUI SUA NEWSAPI KEY (opcional). Sem chave usa fallback.
  NEWSAPI_COUNTRY: 'us', // país para manchetes (us, gb, br, etc)
  GOOGLE_TRENDS_PROXY: '', // se tiver um endpoint proxy que retorne trends JSON, cole aqui
  COUNTDOWN_TARGET: '2030-01-01T00:00:00Z' // data alvo (UTC) - ajustável
};

/* -----------------------
   Relógios: Israel e NY
   ----------------------- */
function updateClocks(){
  const now = new Date();
  const israel = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Jerusalem' }));
  const ny = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  document.getElementById('clock-israel').innerText = israel.toLocaleTimeString();
  document.getElementById('clock-usa').innerText = ny.toLocaleTimeString();
}
setInterval(updateClocks, 1000);
updateClocks();

/* -----------------------
   Contagem regressiva até 2030
   ----------------------- */
function updateCountdown(){
  const target = new Date(CONFIG.COUNTDOWN_TARGET);
  const now = new Date();
  let diff = target - now;
  if(diff <= 0){
    document.getElementById('countdown').innerText = 'É 2030!';
    return;
  }
  const days = Math.floor(diff / (1000*60*60*24));
  const hours = Math.floor((diff / (1000*60*60)) % 24);
  const minutes = Math.floor((diff / (1000*60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  document.getElementById('countdown').innerText = `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* -----------------------
   NEWS: tenta NewsAPI, senão fallback
   ----------------------- */
async function fetchNews(){
  const newsEl = document.getElementById('newsList');
  const featured = document.getElementById('featured');
  newsEl.innerHTML = '<li>Carregando notícias...</li>';
  featured.innerText = 'Carregando destaque...';

  try{
    if(CONFIG.NEWSAPI_KEY){
      const url = `https://newsapi.org/v2/top-headlines?language=pt&pageSize=6&apiKey=${CONFIG.NEWSAPI_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      if(data && data.articles && data.articles.length){
        const list = data.articles.slice(0,5);
        newsEl.innerHTML = '';
        list.forEach(a => {
          const li = document.createElement('li');
          li.innerHTML = `<strong>${a.source.name}</strong> — ${a.title}`;
          newsEl.appendChild(li);
        });
        featured.innerHTML = `<strong>${data.articles[0].title}</strong><p style="color:#ccc;margin-top:6px">${data.articles[0].description || ''}</p>`;
        updateTickerFromList(list.map(x => x.title));
        return;
      }
    }
  }catch(e){
    console.warn('NewsAPI falhou:', e);
  }

  // FALLBACK (exemplos)
  const fallback = [
    {title: "Sinais globais chamam atenção de líderes", source:{name:"GlobalReport"}},
    {title: "Mercados reagem a notícias sobre tecnologia", source:{name:"World Tech"}},
    {title: "Descobertas científicas intrigam comunidade", source:{name:"Science Daily"}},
    {title: "Clima extremo afeta regiões costeiras", source:{name:"Climate Now"}},
    {title: "Novas tensões geopolíticas entre grandes potências", source:{name:"Diplomacy Today"}}
  ];
  newsEl.innerHTML = '';
  fallback.forEach(a=>{
    const li=document.createElement('li');
    li.innerHTML = `<strong>${a.source.name}</strong> — ${a.title}`;
    newsEl.appendChild(li);
  });
  featured.innerHTML = `<strong>${fallback[0].title}</strong><p style="color:#ccc;margin-top:6px">Exemplo de manchete — substitua pela API para dados reais.</p>`;
  updateTickerFromList(fallback.map(x => x.title));
}
fetchNews();
setInterval(fetchNews, 1000 * 60 * 5); // atualiza a cada 5 minutos

/* -----------------------
   TRENDS: tenta proxy (opcional) senão fallback
   ----------------------- */
async function fetchTrends(){
  const el = document.getElementById('trendsList');
  el.innerHTML = '<li>Carregando tendências...</li>';
  try{
    if(CONFIG.GOOGLE_TRENDS_PROXY){
      const r = await fetch(CONFIG.GOOGLE_TRENDS_PROXY);
      const j = await r.json();
      // espera array: [{title: '...'}]
      if(Array.isArray(j) && j.length){
        el.innerHTML = '';
        j.slice(0,5).forEach(t => {
          const li = document.createElement('li');
          li.innerText = t.title || t;
          el.appendChild(li);
        });
        return;
      }
    }
  }catch(e){
    console.warn('Trends fetch falhou:', e);
  }

  // fallback estático
  const fallback = [
    'Tendência 1 — Tecnologia emergente',
    'Tendência 2 — Preocupações com economia global',
    'Tendência 3 — Novidades em criptomoeda',
    'Tendência 4 — Eventos esportivos de grande alcance',
    'Tendência 5 — Filmes e cultura viral'
  ];
  el.innerHTML = '';
  fallback.forEach(t=>{
    const li=document.createElement('li');
    li.innerText = t;
    el.appendChild(li);
  });
}
fetchTrends();
setInterval(fetchTrends, 1000 * 60 * 10);

/* -----------------------
   Ticker: atualiza a partir das manchetes
   ----------------------- */
function updateTickerFromList(titles = []){
  const ticker = document.getElementById('ticker');
  if(!titles || !titles.length){
    ticker.innerHTML = '<span>Sem manchetes disponíveis.</span>';
    return;
  }
  // criar spans separados para rolar
  ticker.innerHTML = '';
  titles.forEach((t,i)=>{
    const span = document.createElement('span');
    span.innerText = `📰 ${t} `;
    ticker.appendChild(span);
  });
}

/* inicial: se não tiver sido setado por news fetch */
updateTickerFromList(['Carregando feed do ticker...']);

/* -----------------------
   GRÁFICO pequeno: simula dados (random walk)
   ----------------------- */
const ctx = document.getElementById('miniChart').getContext('2d');
let chartAsset = 'BTC'; // BTC or USD
let chartData = generateInitialSeries();

const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: chartData.map(d => d.t),
    datasets: [{
      label: 'Preço simulado',
      data: chartData.map(d => d.v),
      tension: 0.25,
      borderWidth: 2,
      pointRadius: 0,
      fill: false
    }]
  },
  options: {
    animation:false,
    responsive:true,
    plugins:{legend:{display:false}},
    scales:{
      x:{display:false},
      y:{ticks:{color:'#fff'}}
    }
  }
});

function generateInitialSeries(){
  const arr=[];
  let base = chartAsset === 'BTC' ? 60000 : 1.0;
  for(let i=0;i<30;i++){
    base = +(base * (1 + (Math.random()-0.48)/200)).toFixed(4);
    arr.push({t: `${i}`, v: base});
  }
  return arr;
}

function stepChart(){
  // random walk step
  let last = chart.data.datasets[0].data.slice(-1)[0] || 1;
  let next = +(last * (1 + (Math.random()-0.48)/200)).toFixed(4);
  chart.data.labels.push(new Date().toLocaleTimeString());
  chart.data.datasets[0].data.push(next);
  if(chart.data.labels.length > 60){
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update('none');
  document.getElementById('chartTime').innerText = new Date().toLocaleTimeString();
}
setInterval(stepChart, 5000);

document.getElementById('toggleAsset').addEventListener('click', ()=>{
  chartAsset = chartAsset === 'BTC' ? 'USD' : 'BTC';
  document.getElementById('toggleAsset').innerText = `Ativo: ${chartAsset}`;
  // reset chart with different base
  chart.data.labels = [];
  chart.data.datasets[0].data = [];
  chart.data.datasets[0].data = generateInitialSeries().map(x=>x.v);
  chart.data.labels = generateInitialSeries().map((x,i)=>i);
  chart.update();
});

/* -----------------------
   Top 5 tendências de pesquisa (mostrar no painel) - já feito via fetchTrends
   ----------------------- */

/* -----------------------
   Profético: 3 tópicos (editáveis)
   ----------------------- */
const propheticStatic = [
  "1) Aumento de sinais nos céus e eventos climáticos que impulsionam movimentos de arrependimento.",
  "2) Grandes realinhamentos políticos entre nações que cumprem profecias sobre migrações e alianças.",
  "3) Crescente movimento espiritual com sinais, curas e também perseguições — chamado ao discernimento."
];
function loadProphetic(){
  const el = document.getElementById('propheticList');
  el.innerHTML = '';
  propheticStatic.forEach(s => {
    const li = document.createElement('li');
    li.innerText = s;
    el.appendChild(li);
  });
}
loadProphetic();

/* -----------------------
   Inicializar ticker com manchetes básicas se nada carregar
   ----------------------- */
setTimeout(()=>{
  // se ticker não atualizado até aqui, define fallback
  const t = document.getElementById('ticker');
  if(!t.innerText || t.innerText.includes('Carregando')){
    updateTickerFromList([
      "Últimas: projeto de teste ativo.",
      "Dica: coloque NEWSAPI_KEY em CONFIG para receber manchetes reais.",
      "Siga as instruções para personalizar tendências e contagem."
    ]);
  }
}, 2500);

/* FIM DO SCRIPT */
