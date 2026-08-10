// ---------- Chaves opcionais para os índices de bolsa ----------
// Deixe em branco para esconder esses itens da barra. Ambas são gratuitas:
// BRAPI_TOKEN: crie em https://brapi.dev/dashboard (cobre o Ibovespa)
// FMP_API_KEY: crie em https://site.financialmodelingprep.com/developer/docs (cobre S&P 500, Dow Jones e Nasdaq — 250 chamadas/dia grátis)
const BRAPI_TOKEN = 'pmHQwgwkC9rf3ftqAoLrjy';
const FMP_API_KEY = 'kTzXZ6TzuPCcE0zFuM5i0hjrCwX4eojC';

function paraNumeroBR(valorStr) {
  return parseFloat(String(valorStr).replace(',', '.'));
}

async function buscarSerieBCB(codigo) {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados/ultimos/1?formato=json`;
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error('Falha BCB ' + codigo);
  const dados = await resposta.json();
  return dados[0];
}

function esconderItem(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function preencherItem(idValor, texto) {
  const el = document.getElementById(idValor);
  if (el) el.textContent = texto;
}

async function carregarIndicadoresBCB() {
  try {
    const [selic, cdi, ipca, dolar] = await Promise.all([
      buscarSerieBCB(432), buscarSerieBCB(12), buscarSerieBCB(13522), buscarSerieBCB(1)
    ]);
    preencherItem('tickerSelic', paraNumeroBR(selic.valor).toFixed(2).replace('.', ',') + '%');

    const cdiDiario = paraNumeroBR(cdi.valor) / 100;
    const cdiAnualizado = (Math.pow(1 + cdiDiario, 252) - 1) * 100;
    preencherItem('tickerCDI', cdiAnualizado.toFixed(2).replace('.', ',') + '%');

    preencherItem('tickerIPCA', paraNumeroBR(ipca.valor).toFixed(2).replace('.', ',') + '%');
    preencherItem('tickerDolar', 'R$' + paraNumeroBR(dolar.valor).toFixed(2).replace('.', ','));
  } catch (erro) {
    ['itemSelic', 'itemCDI', 'itemIPCA', 'itemDolar'].forEach(esconderItem);
    console.error('Erro ao carregar indicadores BCB na barra:', erro);
  }
}

async function carregarIbovespa() {
  if (!BRAPI_TOKEN) { esconderItem('itemIbov'); return; }
  try {
    const resposta = await fetch(`https://brapi.dev/api/quote/%5EBVSP?token=${BRAPI_TOKEN}`);
    if (!resposta.ok) throw new Error('Falha brapi');
    const dados = await resposta.json();
    const resultado = dados.results && dados.results[0];
    if (!resultado) throw new Error('Sem resultado Ibovespa');
    const pontos = resultado.regularMarketPrice.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    const variacao = resultado.regularMarketChangePercent;
    preencherItem('tickerIbov', pontos + ' (' + (variacao >= 0 ? '+' : '') + variacao.toFixed(2) + '%)');
  } catch (erro) {
    esconderItem('itemIbov');
    console.error('Erro ao carregar Ibovespa:', erro);
  }
}

async function carregarIndicesEUA() {
  if (!FMP_API_KEY) { ['itemSP500', 'itemDow', 'itemNasdaq'].forEach(esconderItem); return; }
  try {
    const resposta = await fetch(`https://financialmodelingprep.com/api/v3/quote/%5EGSPC,%5EDJI,%5EIXIC?apikey=${FMP_API_KEY}`);
    if (!resposta.ok) throw new Error('Falha FMP');
    const dados = await resposta.json();
    const mapa = {};
    dados.forEach(d => { mapa[d.symbol] = d; });

    if (mapa['^GSPC']) {
      const d = mapa['^GSPC'];
      preencherItem('tickerSP500', d.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' (' + (d.changesPercentage >= 0 ? '+' : '') + d.changesPercentage.toFixed(2) + '%)');
    } else { esconderItem('itemSP500'); }

    if (mapa['^DJI']) {
      const d = mapa['^DJI'];
      preencherItem('tickerDow', d.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' (' + (d.changesPercentage >= 0 ? '+' : '') + d.changesPercentage.toFixed(2) + '%)');
    } else { esconderItem('itemDow'); }

    if (mapa['^IXIC']) {
      const d = mapa['^IXIC'];
      preencherItem('tickerNasdaq', d.price.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' (' + (d.changesPercentage >= 0 ? '+' : '') + d.changesPercentage.toFixed(2) + '%)');
    } else { esconderItem('itemNasdaq'); }
  } catch (erro) {
    ['itemSP500', 'itemDow', 'itemNasdaq'].forEach(esconderItem);
    console.error('Erro ao carregar índices dos EUA:', erro);
  }
}

if (document.getElementById('tickerBar')) {
  carregarIndicadoresBCB();
  carregarIbovespa();
  carregarIndicesEUA();
}
