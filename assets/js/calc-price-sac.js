function formatarBRL(v) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function gerarSAC(P, i, n) {
  const amortizacao = P / n;
  let saldo = P;
  const parcelas = [];
  let totalJuros = 0;
  for (let mes = 1; mes <= n; mes++) {
    const juros = saldo * i;
    const parcela = amortizacao + juros;
    parcelas.push(parcela);
    totalJuros += juros;
    saldo -= amortizacao;
  }
  return { parcelas, totalJuros, totalPago: P + totalJuros };
}

function gerarPrice(P, i, n) {
  let parcela;
  if (i === 0) {
    parcela = P / n;
  } else {
    parcela = P * (i * Math.pow(1 + i, n)) / (Math.pow(1 + i, n) - 1);
  }
  const parcelas = new Array(n).fill(parcela);
  const totalPago = parcela * n;
  const totalJuros = totalPago - P;
  return { parcelas, totalJuros, totalPago };
}

function desenharGrafico(sacParcelas, priceParcelas) {
  const canvas = document.getElementById('grafico');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const padL = 70, padB = 30, padT = 12, padR = 12;
  ctx.clearRect(0, 0, W, H);

  const n = sacParcelas.length;
  const maxVal = Math.max(...sacParcelas, ...priceParcelas);
  const minVal = Math.min(...sacParcelas, ...priceParcelas);

  const x = idx => padL + (idx / (n - 1)) * (W - padL - padR);
  const y = val => H - padB - ((val - minVal) / (maxVal - minVal || 1)) * (H - padT - padB);

  // eixos
  ctx.strokeStyle = '#C7BFA6';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, padT);
  ctx.lineTo(padL, H - padB);
  ctx.lineTo(W - padR, H - padB);
  ctx.stroke();

  // labels eixo Y
  ctx.fillStyle = '#47564D';
  ctx.font = '11px IBM Plex Mono, monospace';
  ctx.textAlign = 'right';
  [maxVal, (maxVal + minVal) / 2, minVal].forEach(v => {
    ctx.fillText(formatarBRL(v).replace('R$', '').trim(), padL - 8, y(v) + 4);
  });

  function linha(dados, cor) {
    ctx.strokeStyle = cor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    dados.forEach((v, idx) => {
      const px = x(idx), py = y(v);
      if (idx === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();
  }

  linha(sacParcelas, '#B23A2E');
  linha(priceParcelas, '#B4872B');

  ctx.fillStyle = '#47564D';
  ctx.textAlign = 'left';
  ctx.fillText('mês 1', padL, H - 10);
  ctx.textAlign = 'right';
  ctx.fillText('mês ' + n, W - padR, H - 10);
}

function calcular() {
  const P = parseFloat(document.getElementById('valorFinanciado').value) || 0;
  const i = (parseFloat(document.getElementById('taxaMensal').value) || 0) / 100;
  const n = parseInt(document.getElementById('prazoMeses').value) || 1;

  const sac = gerarSAC(P, i, n);
  const price = gerarPrice(P, i, n);

  document.getElementById('sacPrimeira').textContent = formatarBRL(sac.parcelas[0]);
  document.getElementById('sacUltima').textContent = formatarBRL(sac.parcelas[sac.parcelas.length - 1]);
  document.getElementById('sacJuros').textContent = formatarBRL(sac.totalJuros);
  document.getElementById('sacTotal').textContent = formatarBRL(sac.totalPago);

  document.getElementById('pricePrimeira').textContent = formatarBRL(price.parcelas[0]);
  document.getElementById('priceUltima').textContent = formatarBRL(price.parcelas[price.parcelas.length - 1]);
  document.getElementById('priceJuros').textContent = formatarBRL(price.totalJuros);
  document.getElementById('priceTotal').textContent = formatarBRL(price.totalPago);

  desenharGrafico(sac.parcelas, price.parcelas);
}

['valorFinanciado', 'taxaMensal', 'prazoMeses'].forEach(id => {
  document.getElementById(id).addEventListener('input', calcular);
});
window.addEventListener('resize', calcular);
calcular();
