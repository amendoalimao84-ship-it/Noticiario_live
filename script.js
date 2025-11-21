document.getElementById("content").innerHTML = `
  <h1>Carregando notícias...</h1>
`;
// RELÓGIO DE ISRAEL (GMT+2 / GMT+3 dependendo do horário)
function clockIsrael() {
  const now = new Date();
  const israel = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
  document.getElementById("clockIsrael").innerText = israel.toLocaleTimeString();
}

// RELÓGIO DOS EUA (Nova York)
function clockUSA() {
  const now = new Date();
  const usa = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  document.getElementById("clockUSA").innerText = usa.toLocaleTimeString();
}

// ATUALIZA OS DOIS RELÓGIOS A CADA 1s
setInterval(clockIsrael, 1000);
setInterval(clockUSA, 1000);

// NOTÍCIAS ROTATIVAS
const newsList = [
  "🌎 Grandes mudanças geopolíticas chamam atenção mundial.",
  "⚠️ Alertas de especialistas apontam tendências para os próximos anos.",
  "📡 Avanço das tecnologias acelera transformações globais.",
  "🔥 Conflitos intensificam tensões entre potências.",
  "🌙 Sinais proféticos despertam interesse em vários países."
];

let index = 0;

function updateNews() {
  document.getElementById("news-area").innerHTML = `<h1>${newsList[index]}</h1>`;
  index = (index + 1) % newsList.length;
}

updateNews();
setInterval(updateNews, 60000); // troca a cada 60 min? ajustei para 60 segundos para testar

// MENSAGENS BÍBLICAS ROTATIVAS
const verses = [
  "“O Senhor é meu pastor, nada me faltará.” — Salmo 23",
  "“Não temas, porque Eu sou contigo.” — Isaías 41:10",
  "“O Senhor é a minha luz e a minha salvação.” — Salmo 27:1",
  "“Entrega o teu caminho ao Senhor; confia nele.” — Salmo 37:5"
];

let v = 0;

function updateBible() {
  document.getElementById("bibleArea").innerText = verses[v];
  v = (v + 1) % verses.length;
}

setInterval(updateBible, 15000); // troca a cada 15s
