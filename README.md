# Roma Fotografias 📷

> Portfólio de **Vitor Roma** montado como uma exposição: parede branca, salas temáticas e a foto como assunto.

🌐 **Ao vivo:** https://romavitordev.github.io/romafotografias/

Site estático feito à mão: HTML, CSS e JavaScript puros, sem frameworks e sem build. Tudo é renderizado a partir de um único manifesto ([`galeria/fotos.json`](galeria/fotos.json)).

## 🖼 Como a exposição funciona

- **Entrada** (`index.html`): a parede de destaques (lista `"destaques"` do manifesto), o índice das salas, o texto de parede (sobre) e o contato.
- **Salas**: cada categoria do manifesto é uma sala, numerada na ordem em que aparece no JSON.

| Sala | Página | Pasta | Prefixo |
|---|---|---|---|
| I. Retratos | `retratos.html` | `RetratosFotos/` | `ret_` |
| II. Maria e Mari | `maria-e-mari.html` | `MariaMariFotos/` | `mm_` |
| III. Resenha | `resenha.html` | `ResenhaFotos/` | `res_` |
| IV. Fim de tarde | `tarde.html` | `TardeFotos/` | `tar_` |
| V. Arquitetura | `arquitetura.html` | `ArquiteturaFotos/` | `arq_` |
| VI. Natureza | `natureza.html` | `NaturezaFotos/` | `nat_` |
| VII. Máquinas | `maquinas.html` | `CarrosFotos/` | `car_` |
| VIII. Capturas virtuais | `forza.html` | `ForzaFotos/` | `for_` |

## 📸 Como adicionar fotos (o jeito fácil)

1. Abra a pasta da sala aqui no GitHub.
2. **Add file → Upload files**, arraste as fotos e faça o commit.
3. Pronto. O resto é automático:
   - o [GitHub Action](.github/workflows/galeria.yml) **otimiza** as imagens (máx. 1920px, compressão web);
   - atualiza o **manifesto** `galeria/fotos.json` com as fotos novas;
   - gera as **miniaturas** (`miniaturas/`, 1000px) usadas na parede; a foto original abre no lightbox;
   - o GitHub Pages republica o site.

A foto entra na sala com um título derivado do nome do arquivo (`ret_ensaio_ana.jpg` → "Ensaio ana"). Quer um título melhor? Edite o campo `"titulo"` dela em `galeria/fotos.json`: títulos editados **nunca** são sobrescritos.

**Parede de destaques:** para escolher o que aparece na entrada, edite a lista `"destaques"` no manifesto (caminhos das fotos, na ordem de exibição).

> Dica: evite exportar com moldura branca. Na parede, a própria página já faz o papel de passe-partout.

Substituiu uma foto mantendo o mesmo nome? Apague a miniatura correspondente em `miniaturas/` para que ela seja gerada de novo.

## 🗂 Estrutura

```
index.html              entrada: destaques, salas, sobre, contato
<sala>.html             uma página por sala (conteúdo vem do manifesto)
galeria/fotos.json      manifesto: salas, títulos, dimensões e destaques
miniaturas/             versões leves para a parede (geradas)
assets/styles.css       visual da exposição (Cormorant Garamond + Jost)
assets/main.js          parede, índice das salas, lightbox, formulário
scripts/gera-galeria.mjs  manifesto + miniaturas (roda no Action ou local)
.github/workflows/galeria.yml  otimização, manifesto e miniaturas automáticos
```

### Criar uma sala nova

1. Crie a pasta (ex.: `EventosFotos/`) com as fotos.
2. Adicione a categoria em `galeria/fotos.json` (`slug`, `pagina`, `titulo`, `descricao`, `capa`, `pasta`, `fotos: []`).
3. Copie uma página de sala (ex.: `resenha.html`) para `eventos.html` e troque `data-sala`, `<title>` e o texto do cabeçalho.
4. Inclua a pasta nos `paths` e no laço de otimização do workflow, e a página no `sitemap.xml`.

## 🔧 Rodar local

Qualquer servidor estático serve (o `fetch` do manifesto não funciona via `file://`):

```bash
npx http-server . -p 3001
# http://localhost:3001
```

Para atualizar o manifesto e as miniaturas localmente (usa ImageMagick ou ffmpeg):

```bash
node scripts/gera-galeria.mjs
```

## ✉️ Contato do site

- Formulário: Formspree (endpoint em `index.html`)
- WhatsApp, e-mail, Instagram e VSCO: links diretos na seção de contato
