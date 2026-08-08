# Calculadoras Financeiras — site estático

Site 100% estático (HTML/CSS/JS puro), sem backend. Roda em qualquer hospedagem
de arquivos estáticos.

## Estrutura
```
index.html                          → página inicial
calculadoras/juros-compostos.html   → 1ª calculadora (exemplo funcional)
assets/css/style.css                → design system do site
assets/js/calc-juros-compostos.js   → lógica da calculadora
```

## Deploy no Cloudflare Pages (recomendado)

1. Crie um repositório no GitHub e suba esta pasta:
   ```
   git init
   git add .
   git commit -m "Site inicial"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPO.git
   git push -u origin main
   ```
2. Em dash.cloudflare.com → **Workers & Pages** → **Criar aplicação** → **Pages** → **Conectar ao Git**
3. Selecione o repositório. Como é um site estático puro, deixe o campo
   "Comando de build" **vazio** e o "Diretório de saída" como `/` (raiz).
4. Deploy automático a cada `git push`.

## Conectar o domínio próprio
Depois do primeiro deploy: Pages → seu projeto → **Domínios personalizados** →
adicionar o domínio. Se o domínio já estiver na Cloudflare (registrado ou com
DNS apontado para lá), a conexão é automática.

## Próximos passos
- Adicionar novas calculadoras seguindo o padrão de `calculadoras/juros-compostos.html`
- Página de Política de Privacidade (obrigatória para aplicar ao Google AdSense)
- Sitemap.xml e submissão ao Google Search Console
