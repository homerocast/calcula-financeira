function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function paraDataBCB(isoStr) {
  // AAAA-MM-DD -> dd/MM/yyyy
  const [ano, mes, dia] = isoStr.split('-');
  return `${dia}/${mes}/${ano}`;
}

async function calcular() {
  const status = document.getElementById('statusCarregamento');
  const narrativa = document.getElementById('resultadoNarrativo');
  const valor = parseFloat(document.getElementById('valorOriginal').value) || 0;
  const dataInicial = document.getElementById('dataInicial').value;
  const dataFinal = document.getElementById('dataFinal').value;
  const codigo = document.getElementById('indice').value;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataInicial) || !/^\d{4}-\d{2}-\d{2}$/.test(dataFinal)) {
    status.textContent = 'Informe as datas no formato AAAA-MM-DD.';
    return;
  }

  status.textContent = 'Buscando dados do Banco Central...';
  narrativa.style.display = 'none';

  try {
    const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados?dataInicial=${paraDataBCB(dataInicial)}&dataFinal=${paraDataBCB(dataFinal)}&formato=json`;
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error('Falha na API do BCB');
    const dados = await resposta.json();

    if (!dados || dados.length === 0) {
      status.textContent = 'Nenhum dado encontrado para o período informado.';
      document.getElementById('resVariacao').textContent = '—';
      document.getElementById('resValorCorrigido').textContent = '—';
      return;
    }

    let fator = 1;
    dados.forEach(ponto => {
      const variacaoMensal = parseFloat(String(ponto.valor).replace(',', '.')) / 100;
      fator *= (1 + variacaoMensal);
    });

    const variacaoAcumulada = (fator - 1) * 100;
    const valorCorrigido = valor * fator;

    document.getElementById('resVariacao').textContent = variacaoAcumulada.toFixed(2).replace('.', ',') + '%';
    document.getElementById('resValorCorrigido').textContent = formatarBRL(valorCorrigido);

    const nomeIndice = document.getElementById('indice').selectedOptions[0].text;
    narrativa.style.display = 'block';
    narrativa.innerHTML = `Corrigindo <strong>${formatarBRL(valor)}</strong> de ${dataInicial.split('-').reverse().join('/')} até ${dataFinal.split('-').reverse().join('/')} pelo <strong>${nomeIndice}</strong>, a variação acumulada foi de <strong>${variacaoAcumulada.toFixed(2).replace('.', ',')}%</strong> — o valor corrigido é de <span class="ok">${formatarBRL(valorCorrigido)}</span>.`;

    status.textContent = `${dados.length} meses de dados usados no cálculo, obtidos do Banco Central.`;
  } catch (erro) {
    status.textContent = 'Não foi possível buscar os dados agora. Tente novamente em instantes.';
    console.error('Erro na correção monetária:', erro);
  }
}

['valorOriginal', 'dataInicial', 'dataFinal', 'indice'].forEach(id => {
  document.getElementById(id).addEventListener('change', calcular);
});
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
