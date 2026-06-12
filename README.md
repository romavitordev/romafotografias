# Roma Fotografias 📷

> Landing page de fotografia de **Vitor Roma** — retratos, natureza, arquitetura e capturas virtuais.

🌐 **Ao vivo:** https://romavitordev.github.io/romafotografias/

Site estático feito à mão — HTML, CSS e JavaScript puros, sem frameworks e sem build. As galerias são renderizadas a partir de um único manifesto ([`galeria/fotos.json`](galeria/fotos.json)).

## 📸 Como adicionar fotos (o jeito fácil)

1. Abra a pasta da categoria aqui no GitHub (`RetratosFotos/`, `NaturezaFotos/`, `ArquiteturaFotos/` ou `ForzaFotos/`).
2. **Add file → Upload files**, arraste as fotos e commit.
3. Pronto. O resto é automático:
   - o [GitHub Action](.github/workflows/galeria.yml) **otimiza** as imagens (máx. 1920px, compressão web);
   - atualiza o **manifesto** `galeria/fotos.json` com as fotos novas;
   - o GitHub Pages republica o site.

A foto entra na galeria com um título derivado do nome do arquivo. Quer um título melhor? Edite a linha dela em `galeria/fotos.json` (campo `"titulo"`) — títulos editados **nunca** são sobrescritos.

> Dica: nomeie os arquivos com o prefixo da categoria (`ret_`, `nat_`, `arq_`, `for_`) + descrição: `ret_ensaio_ana.jpg` → título "Ensaio ana".

## 🗂 Estrutura

```
index.html              home (hero, portfólio, sobre, serviços, contato)
retratos.html           galerias — renderizadas do manifesto
natureza.html
arquitetura.html
forza.html
galeria/fotos.json      manifesto único: categorias, títulos e dimensões
assets/styles.css       design system (dark premium, Playfair + Inter)
assets/main.js          render das galerias, lightbox, reveals, formulário
scripts/gera-galeria.mjs  gerador do manifesto (roda no Action ou local)
.github/workflows/galeria.yml  otimização + manifesto automáticos
```

## 🔧 Rodar local

Qualquer servidor estático serve (o `fetch` do manifesto não funciona via `file://`):

```bash
npx http-server . -p 3001
# http://localhost:3001
```

Para atualizar o manifesto localmente depois de adicionar fotos:

```bash
node scripts/gera-galeria.mjs
```

## ✉️ Contato do site

- Formulário: Formspree (endpoint em `index.html`)
- WhatsApp/Instagram/E-mail: links diretos nos cards de contato
