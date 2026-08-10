document.querySelectorAll('.dropdown-trigger').forEach(function (btn) {
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    var dropdown = btn.closest('.nav-dropdown');
    var jaAberto = dropdown.classList.contains('open');
    document.querySelectorAll('.nav-dropdown.open').forEach(function (d) { d.classList.remove('open'); });
    if (!jaAberto) dropdown.classList.add('open');
  });
});

document.addEventListener('click', function (e) {
  document.querySelectorAll('.nav-dropdown.open').forEach(function (d) {
    if (!d.contains(e.target)) d.classList.remove('open');
  });
});
