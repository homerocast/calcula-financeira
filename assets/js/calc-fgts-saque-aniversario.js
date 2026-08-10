function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function calcularSaqueAniversario(saldo) {
  const faixas = [
    { ate: 500, aliq: 0.50, adicional: 0 },
    { ate: 1000, aliq: 0.40, adicional: 50 },
    { ate: 5000, aliq: 0.30, adicional: 150 },
    { ate: 10000, aliq: 0.20, adicional: 650 },
    { ate: 15000, aliq: 0.15, adicional: 1150 },
    { ate: 20000, aliq: 0.10, adicional: 1900 },
    { ate: Infinity, aliq: 0.05, adicional: 2900 }
  ];
  const faixa = faixas.find(f => saldo <= f.ate) || faixas[faixas.length - 1];
  return Math.min(saldo, saldo * faixa.aliq + faixa.adicional);
}

function calcular() {
  const saldo = parseFloat(document.getElementById('saldoFGTS').value) || 0;
  const multa = saldo * 0.40;
  const saqueAniversario = calcularSaqueAniversario(saldo);

  document.getElementById('resSaqueAniversario').textContent = formatarBRL(saqueAniversario);
  document.getElementById('resAniversarioDemissao').textContent = formatarBRL(multa) + ' (só a multa)';
  document.getElementById('resRescisaoDemissao').textContent = formatarBRL(saldo + multa) + ' (saldo + multa)';

  const diferencaSeDemitido = (saldo + multa) - multa; // o que fica retido no saque-aniversário
  const narrativa = document.getElementById('resultadoNarrativo');
  narrativa.innerHTML = `Com <strong>${formatarBRL(saldo)}</strong> de saldo, o saque-aniversário libera <strong>${formatarBRL(saqueAniversario)}</strong> agora. Mas se você for demitido sem justa causa optando por essa modalidade, recebe só a multa de <strong>${formatarBRL(multa)}</strong> — ficando <span class="alerta">${formatarBRL(diferencaSeDemitido)} retidos</span> na conta, contra receber tudo de uma vez (${formatarBRL(saldo + multa)}) no saque-rescisão tradicional.`;
}

document.getElementById('saldoFGTS').addEventListener('input', calcular);
const btnCalcular = document.getElementById('btnCalcular');
if (btnCalcular) btnCalcular.addEventListener('click', calcular);
calcular();
