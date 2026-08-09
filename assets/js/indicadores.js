// Códigos das séries no SGS (Sistema Gerenciador de Séries Temporais) do Banco Central
// 432 = Selic meta (% a.a.) | 12 = CDI diário (% a.d.) | 13522 = IPCA acumulado 12 meses (%) | 1 = Dólar PTAX venda (R$)
const SERIES_BCB = {
  selic: 432,
  cdi: 12,
  ipca12m: 13522,
  dolar: 1
};

function formatarDataBR(dataStr) {
  // dataStr vem no formato dd/MM/yyyy
  return dataStr || '';
}

async function buscarSerie(codigo) {
  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados/ultimos/1?formato=json`;
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error('Falha ao buscar série ' + codigo);
  const dados = await resposta.json();
  if (!dados || !dados.length) throw new Error('Série vazia: ' + codigo);
  return dados[0]; // { data: "dd/MM/yyyy", valor: "10,75" }
}

function paraNumero(valorStr) {
  return parseFloat(String(valorStr).replace(',', '.'));
}

async function carregarIndicadores() {
  const status = document.getElementById('statusCarregamento');
  try {
    const [selic, cdi, ipca, dolar] = await Promise.all([
      buscarSerie(SERIES_BCB.selic),
      buscarSerie(SERIES_BCB.cdi),
      buscarSerie(SERIES_BCB.ipca12m),
      buscarSerie(SERIES_BCB.dolar)
    ]);

    // Selic meta já vem em % a.a.
    document.getElementById('valorSelic').textContent = paraNumero(selic.valor).toFixed(2).replace('.', ',') + '%';
    document.getElementById('dataSelic').textContent = 'Referência: ' + formatarDataBR(selic.data);

    // CDI vem como taxa diária (% a.d.) — anualiza em base 252 dias úteis
    const cdiDiario = paraNumero(cdi.valor) / 100;
    const cdiAnualizado = (Math.pow(1 + cdiDiario, 252) - 1) * 100;
    document.getElementById('valorCDI').textContent = cdiAnualizado.toFixed(2).replace('.', ',') + '%';
    document.getElementById('dataCDI').textContent = 'Referência: ' + formatarDataBR(cdi.data);

    // IPCA acumulado 12 meses já vem pronto em %
    document.getElementById('valorIPCA').textContent = paraNumero(ipca.valor).toFixed(2).replace('.', ',') + '%';
    document.getElementById('dataIPCA').textContent = 'Referência: ' + formatarDataBR(ipca.data);

    // Dólar PTAX vem em R$
    document.getElementById('valorDolar').textContent = 'R$ ' + paraNumero(dolar.valor).toFixed(4).replace('.', ',');
    document.getElementById('dataDolar').textContent = 'Referência: ' + formatarDataBR(dolar.data);

    status.textContent = 'Dados obtidos em tempo real do Banco Central do Brasil.';
  } catch (erro) {
    status.textContent = 'Não foi possível carregar os dados agora. Tente novamente em instantes ou consulte diretamente em bcb.gov.br.';
    console.error('Erro ao carregar indicadores BCB:', erro);
  }
}

carregarIndicadores();
