(function () {
  // Troque pelo Measurement ID da sua propriedade (formato G-XXXXXXXXXX)
  var MEASUREMENT_ID = 'G-VJVLXBN37E';
  var CHAVE_CONSENTIMENTO = 'calculafin_cookie_consent';

  window.calculaFinIniciarAnalytics = function () {
    if (window.calculaFinAnalyticsCarregado) return;
    if (MEASUREMENT_ID.indexOf('XXXX') !== -1) return; // ainda não configurado
    window.calculaFinAnalyticsCarregado = true;

    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + MEASUREMENT_ID;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', MEASUREMENT_ID, { anonymize_ip: true });
  };

  // Se a pessoa já aceitou os cookies em uma visita anterior, carrega direto
  if (localStorage.getItem(CHAVE_CONSENTIMENTO)) {
    window.calculaFinIniciarAnalytics();
  }
})();
