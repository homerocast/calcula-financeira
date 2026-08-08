(function () {
  var CHAVE = 'calculafin_cookie_consent';
  if (localStorage.getItem(CHAVE)) return;

  var barra = document.createElement('div');
  barra.className = 'cookie-banner';
  barra.innerHTML =
    '<span>Usamos cookies para exibir anúncios e entender o uso do site. ' +
    'Saiba mais na <a href="/privacidade.html">Política de Privacidade</a>.</span>' +
    '<button type="button" class="btn-stamp" id="cookieAceitar">Entendi</button>';
  document.body.appendChild(barra);

  document.getElementById('cookieAceitar').addEventListener('click', function () {
    localStorage.setItem(CHAVE, '1');
    barra.remove();
    if (window.calculaFinIniciarAnalytics) window.calculaFinIniciarAnalytics();
  });
})();
