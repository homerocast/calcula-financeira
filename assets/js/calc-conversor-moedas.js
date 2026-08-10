function formatarMoeda(v, moeda) {
  try {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: moeda });
  } catch (e) {
    return moeda + ' ' + v.toFixed(2);
  }
}

let taxas = null; // taxas relativas a 1 EUR (base da API)

async function carregarTaxas() {
  const status = document.getElementById('statusCarregamento');
  try {
    const resposta = await fetch('https://api.frankfurter.app/latest?from=EUR');
    if (!resposta.ok) throw new Error('Falha na resposta');
    const dados = await resposta.json();
    taxas = dados.rates;
    taxas.EUR = 1; // a própria base
    status.textContent = 'Cotações atualizadas em ' + dados.date + '.';
    calcular();
  } catch (erro) {
    status.textContent = 'Não foi possível carregar as cotações agora. Tente novamente em instantes.';
    console.error('Erro ao carregar cotações:', erro);
  }
}

function converter(valor, de, para) {
  if (!taxas || !taxas[de] || !taxas[para]) return null;
  const valorEmEUR = valor / taxas[de];
  return valorEmEUR * taxas[para];
}

function calcular() {
  if (!taxas) return;
  const valor = parseFloat(document.getElementById('valorOrigem').value) || 0;
  const de = document.getElementById('moedaOrigem').value;
  const para = document.getElementById('moedaDestino').value;

  const resultado = converter(valor, de, para);
  document.getElementById('labelResultado').textContent = `${valor} ${de} equivale a`;
  document.getElementById('resValorConvertido').textContent = resultado !== null ? formatarMoeda(resultado, para) : '—';
}

document.getElementById('btnInverter').addEventListener('click', () => {
  const origem = document.getElementById('moedaOrigem');
  const destino = document.getElementById('moedaDestino');
  const temp = origem.value;
  origem.value = destino.value;
  destino.value = temp;
  calcular();
});

['valorOrigem', 'moedaOrigem', 'moedaDestino'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
  document.getElementById(id).addEventListener('change', calcular);
});

carregarTaxas();
