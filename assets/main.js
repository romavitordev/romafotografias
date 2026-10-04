/* ============================================================
   ROMA FOTOGRAFIAS — exposição
   Tudo sai de galeria/fotos.json: cada categoria é uma "sala",
   "destaques" é a parede da entrada. Pra adicionar foto, basta
   subir o arquivo na pasta da sala — o GitHub Action atualiza o
   manifesto e gera a miniatura.
   ============================================================ */

(() => {
  'use strict';

  const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const romano = (n) => ROMANOS[n - 1] || String(n);
  const dois = (n) => String(n).padStart(2, '0');
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  /** Mesma regra do scripts/gera-galeria.mjs */
  const miniatura = (arquivo) => `miniaturas/${arquivo.replace(/\.[^.]+$/, '')}.jpg`;

  /** Âncora do link direto de uma foto: vem do NOME DO ARQUIVO (não do
      título), pra que editar o título não quebre links já compartilhados.
      "ArquiteturaFotos/arq_sombra_na_esquina.jpg" -> "sombra-na-esquina" */
  const ancora = (arquivo) =>
    arquivo
      .replace(/^.*\//, '')
      .replace(/\.[^.]+$/, '')
      .replace(/^(arq|ret|res|tar|mem|nat|ani|car|for|game|capa)[_-]/i, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

  /* ---------- Abertura ----------
     Na primeira visita (por sessão) a entrada mostra a marca no centro
     de uma tela branca enquanto as fotos da parede carregam; depois a
     tela sobe como uma cortina. O <head> do index.html decide se ela
     aparece (classe "intro" no <html>) antes de qualquer pintura. */
  const telaIntro = document.documentElement.classList.contains('intro')
    ? document.querySelector('.intro-tela')
    : null;
  let introFeita;
  const introPronta = new Promise((ok) => (introFeita = ok));
  let fecharIntro = () => {};
  let acompanharIntro = () => {};

  if (!telaIntro) {
    document.documentElement.classList.remove('intro');
    introFeita();
  } else {
    const inicio = performance.now();
    const barra = telaIntro.querySelector('.intro-barra');
    let fechando = false;
    let terminou = false;

    const terminar = () => {
      if (terminou) return;
      terminou = true;
      document.documentElement.classList.remove('intro');
      telaIntro.remove();
      introFeita();
    };

    fecharIntro = () => {
      if (fechando) return;
      fechando = true;
      try { sessionStorage.setItem('roma-intro', '1'); } catch { /* navegação privada */ }
      barra.style.setProperty('--p', 1);
      // tempo mínimo pra marca ser vista, mesmo com tudo em cache
      const espera = Math.max(0, 1200 - (performance.now() - inicio));
      setTimeout(() => {
        telaIntro.classList.add('sai');
        telaIntro.addEventListener('transitionend', terminar, { once: true });
        setTimeout(terminar, 1500); // garantia se a transição não disparar
      }, espera);
    };

    acompanharIntro = (raiz) => {
      const imgs = [...raiz.querySelectorAll('img')];
      if (!imgs.length) return fecharIntro();
      let prontas = 0;
      const passo = () => {
        prontas += 1;
        barra.style.setProperty('--p', prontas / imgs.length);
        if (prontas >= imgs.length) fecharIntro();
      };
      imgs.forEach((im) => {
        if (im.complete) passo();
        else {
          im.addEventListener('load', passo, { once: true });
          im.addEventListener('error', passo, { once: true });
        }
      });
    };

    setTimeout(fecharIntro, 4000); // conexão lenta: não prende ninguém
  }

  /* ---------- Ano do rodapé ---------- */
  document.querySelectorAll('[data-ano]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Aparecer ao rolar ---------- */
  const observador =
    'IntersectionObserver' in window
      ? new IntersectionObserver(
          (entradas) =>
            entradas.forEach((e) => {
              if (e.isIntersecting) {
                e.target.classList.add('on');
                observador.unobserve(e.target);
              }
            }),
          { rootMargin: '0px 0px -8% 0px' }
        )
      : null;
  // Só começa depois da abertura, pra animação das obras acontecer à vista.
  const revelar = (raiz) =>
    introPronta.then(() =>
      raiz.querySelectorAll('.obra:not(.on)').forEach((el) => (observador ? observador.observe(el) : el.classList.add('on')))
    );

  /* ---------- Parede: como cada obra é pendurada ----------
     Larguras, recuos e respiros variam num ciclo fixo — dá o
     ritmo de uma parede de galeria sem parecer aleatório. */
  const PENDURA = [
    { w: 100, ml: 0, mb: 48 },
    { w: 74, ml: 26, mb: 70 },
    { w: 88, ml: 0, mb: 56 },
    { w: 64, ml: 10, mb: 80 },
    { w: 94, ml: 6, mb: 44 },
    { w: 70, ml: 0, mb: 64 },
    { w: 82, ml: 18, mb: 52 },
  ];

  // comLink: na sala, a foto aberta vira link direto (página.html#foto)
  function montarParede(el, fotos, rotuloDe, comLink = false) {
    el.classList.toggle('pequena', fotos.length <= 8);
    el.innerHTML = fotos
      .map((f, i) => {
        const p = PENDURA[i % PENDURA.length];
        const deitada = f.w > f.h;
        const w = deitada ? Math.max(p.w, 90) : p.w;
        const ml = Math.min(p.ml, 100 - w);
        return `
        <figure class="obra" style="--w:${w}%;--ml:${ml}%;--mb:${p.mb}px" tabindex="0" role="button"
                data-indice="${i}" aria-label="Ampliar: ${esc(f.titulo)}">
          <span class="moldura" style="aspect-ratio:${f.w || 4} / ${f.h || 5}">
            <img src="${encodeURI(miniatura(f.arquivo))}" alt="${esc(f.titulo)}" width="${f.w}" height="${f.h}"
                 loading="${i < 4 || telaIntro ? 'eager' : 'lazy'}" decoding="async"
                 onerror="this.onerror=null;this.src='${encodeURI(f.arquivo)}'">
          </span>
          <figcaption><span>${dois(i + 1)}</span><b>${esc(f.titulo)}</b>${rotuloDe ? `<span>${esc(rotuloDe(f))}</span>` : ''}</figcaption>
        </figure>`;
      })
      .join('');
    revelar(el);

    const abrir = (alvo) => {
      const fig = alvo.closest('.obra[data-indice]');
      if (fig) lightbox.abrir(fotos, Number(fig.dataset.indice), rotuloDe, comLink);
    };
    el.addEventListener('click', (e) => abrir(e.target));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        abrir(e.target);
      }
    });
  }

  /* ---------- Estatísticas (GoatCounter) ----------
     Cada foto aberta em tela cheia vira um evento "foto/<arquivo>",
     contado uma vez por foto a cada visita. A página views.html lê
     esses números. Sem cookies; se o GoatCounter não carregar, nada
     quebra. */
  // Uma "visita" por sessão (aba): conta na primeira página aberta e não
  // repete ao navegar por salas ou fotos; abrir o site de novo conta outra.
  (function contarVisita() {
    try { if (sessionStorage.getItem('roma-visita')) return; } catch { return; }
    const contar = (tentativa = 0) => {
      if (window.goatcounter && typeof window.goatcounter.count === 'function') {
        window.goatcounter.count({ path: 'visita', title: 'Visita ao site', event: true });
        try { sessionStorage.setItem('roma-visita', '1'); } catch {}
      } else if (tentativa < 10) {
        setTimeout(() => contar(tentativa + 1), 500); // o script do GoatCounter é assíncrono
      }
    };
    contar();
  })();

  const jaContadas = new Set();
  function contarVisualizacao(f) {
    if (jaContadas.has(f.arquivo)) return;
    const contar = () => {
      if (!window.goatcounter || typeof window.goatcounter.count !== 'function') return false;
      window.goatcounter.count({ path: `foto/${f.arquivo}`, title: f.titulo, event: true });
      jaContadas.add(f.arquivo);
      return true;
    };
    if (!contar()) setTimeout(contar, 1500); // o script do GoatCounter carrega de forma assíncrona
  }

  /* ---------- Lightbox ---------- */
  const lightbox = (() => {
    const raiz = document.getElementById('lightbox');
    if (!raiz) return { abrir() {}, fechar() {} };
    const img = raiz.querySelector('.lb-palco img');
    const titulo = raiz.querySelector('.lb-legenda b');
    const info = raiz.querySelector('.lb-legenda span');
    const contador = raiz.querySelector('.lb-contador');
    let lista = [];
    let atual = 0;
    let rotulo = null;
    let focoAnterior = null;
    let comLink = false;

    // Botão de compartilhar: só nas salas, onde cada foto tem link próprio.
    const fecharBtn = raiz.querySelector('.fechar');
    const linkBtn = document.createElement('button');
    linkBtn.type = 'button';
    linkBtn.className = 'lb-link';
    linkBtn.textContent = 'Copiar link';
    linkBtn.hidden = true;
    fecharBtn.before(linkBtn);
    const avisar = (texto) => {
      linkBtn.textContent = texto;
      setTimeout(() => (linkBtn.textContent = 'Copiar link'), 1800);
    };
    linkBtn.addEventListener('click', async () => {
      const url = location.href;
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        try { await navigator.share({ title: lista[atual].titulo, url }); } catch { /* cancelado */ }
        return;
      }
      try {
        await navigator.clipboard.writeText(url);
        avisar('Link copiado ✓');
      } catch {
        window.prompt('Copie o link:', url);
      }
    });

    const urlSemFoto = () => location.pathname + location.search;

    function mostrar(i) {
      atual = (i + lista.length) % lista.length;
      const f = lista[atual];
      img.classList.add('carregando');
      img.onload = () => img.classList.remove('carregando');
      img.src = encodeURI(f.arquivo);
      img.alt = f.titulo;
      titulo.textContent = f.titulo;
      info.textContent = rotulo ? rotulo(f) : '';
      contador.textContent = `${dois(atual + 1)} / ${dois(lista.length)}`;
      if (comLink) history.replaceState(null, '', `${urlSemFoto()}#${ancora(f.arquivo)}`);
      // pré-carrega a próxima
      const prox = lista[(atual + 1) % lista.length];
      if (prox) new Image().src = encodeURI(prox.arquivo);
      contarVisualizacao(f);
    }

    function abrir(fotos, i, rotuloDe, link = false) {
      lista = fotos;
      rotulo = rotuloDe || null;
      comLink = link;
      linkBtn.hidden = !link;
      focoAnterior = document.activeElement;
      mostrar(i);
      raiz.classList.add('aberto');
      raiz.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      raiz.querySelector('.fechar').focus();
    }

    function fechar() {
      if (!raiz.classList.contains('aberto')) return;
      if (comLink) history.replaceState(null, '', urlSemFoto());
      raiz.classList.remove('aberto');
      raiz.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (focoAnterior) focoAnterior.focus();
    }

    fecharBtn.addEventListener('click', fechar);
    raiz.querySelector('.ant').addEventListener('click', () => mostrar(atual - 1));
    raiz.querySelector('.prox').addEventListener('click', () => mostrar(atual + 1));
    raiz.querySelector('.lb-palco').addEventListener('click', (e) => {
      if (e.target !== img) fechar();
    });
    window.addEventListener('keydown', (e) => {
      if (!raiz.classList.contains('aberto')) return;
      if (e.key === 'Escape') fechar();
      if (e.key === 'ArrowLeft') mostrar(atual - 1);
      if (e.key === 'ArrowRight') mostrar(atual + 1);
    });

    // deslizar no celular
    let x0 = null;
    raiz.addEventListener('touchstart', (e) => (x0 = e.touches[0].clientX), { passive: true });
    raiz.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
      x0 = null;
    });

    return { abrir, fechar };
  })();

  /* ---------- Manifesto ---------- */
  const manifesto = fetch('galeria/fotos.json').then((r) => {
    if (!r.ok) throw new Error('manifesto indisponível');
    return r.json();
  });

  const falhou = (el, texto) => {
    if (el) el.innerHTML = `<p class="rotulo">${texto}</p>`;
  };

  /* ---------- Entrada: parede de destaques ---------- */
  const paredeDestaques = document.getElementById('parede-destaques');
  if (paredeDestaques) {
    manifesto
      .then((dados) => {
        const onde = new Map();
        dados.categorias.forEach((cat) => cat.fotos.forEach((f) => onde.set(f.arquivo, { f, cat })));
        const escolhidas = (dados.destaques || []).map((a) => onde.get(a)).filter(Boolean);
        const salaDe = new Map(escolhidas.map(({ f, cat }) => [f, cat.titulo]));
        montarParede(
          paredeDestaques,
          escolhidas.map(({ f }) => f),
          (f) => salaDe.get(f)
        );
        acompanharIntro(paredeDestaques);
      })
      .catch(() => {
        falhou(paredeDestaques, 'Não foi possível carregar a exposição agora.');
        fecharIntro();
      });
  }

  /* ---------- Entrada: índice das salas ---------- */
  const indice = document.getElementById('indice-salas');
  if (indice) {
    manifesto
      .then((dados) => {
        const total = dados.categorias.reduce((s, c) => s + c.fotos.length, 0);
        const contagem = document.getElementById('contagem-obras');
        if (contagem) contagem.textContent = `${dados.categorias.length} salas · ${total} obras`;

        indice.innerHTML = dados.categorias
          .map(
            (cat, i) => `
          <li>
            <a href="${cat.pagina}" data-capa="${encodeURI(miniatura(cat.capa))}">
              <span class="num">${romano(i + 1)}.</span>
              <img class="mini" src="${encodeURI(miniatura(cat.capa))}" alt="" loading="lazy">
              <span><span class="nome">${esc(cat.titulo)}</span><span class="desc">${esc(cat.descricao)}</span></span>
              <span class="qtd">${cat.fotos.length} obras</span>
            </a>
          </li>`
          )
          .join('');

        // prévia da capa seguindo o cursor
        const previa = document.createElement('div');
        previa.className = 'previa';
        previa.innerHTML = '<img alt="">';
        document.body.appendChild(previa);
        const previaImg = previa.querySelector('img');
        indice.addEventListener('mouseover', (e) => {
          const a = e.target.closest('a[data-capa]');
          if (!a) return;
          if (previaImg.getAttribute('src') !== a.dataset.capa) previaImg.src = a.dataset.capa;
          previa.classList.add('on');
        });
        indice.addEventListener('mouseleave', () => previa.classList.remove('on'));
        indice.addEventListener('mousemove', (e) => {
          const x = Math.min(e.clientX + 28, window.innerWidth - 260);
          const y = Math.min(Math.max(e.clientY - 150, 12), window.innerHeight - 340);
          previa.style.transform = `translate(${x}px, ${y}px)`;
        });
      })
      .catch(() => falhou(indice, 'Não foi possível carregar as salas agora.'));
  }

  /* ---------- Página de sala ---------- */
  const slug = document.body.dataset.sala;
  const paredeSala = document.getElementById('parede-sala');
  if (slug && paredeSala) {
    manifesto
      .then((dados) => {
        const i = dados.categorias.findIndex((c) => c.slug === slug);
        if (i < 0) throw new Error('sala não encontrada');
        const cat = dados.categorias[i];
        const n = dados.categorias.length;

        const numero = document.getElementById('sala-numero');
        const qtd = document.getElementById('sala-qtd');
        if (numero) numero.textContent = `Sala ${romano(i + 1)} de ${romano(n)}`;
        if (qtd) qtd.textContent = `${cat.fotos.length} obras`;

        const rotuloSala = () => `Sala ${romano(i + 1)} · ${cat.titulo}`;
        montarParede(paredeSala, cat.fotos, rotuloSala, true);

        // Link direto (sala.html#nome-da-foto): abre a foto já ampliada e
        // deixa a parede posicionada nela pra quando fecharem.
        const abrirDoLink = () => {
          const alvo = decodeURIComponent(location.hash.slice(1));
          const k = alvo ? cat.fotos.findIndex((f) => ancora(f.arquivo) === alvo) : -1;
          if (k < 0) return;
          const fig = paredeSala.querySelector(`.obra[data-indice="${k}"]`);
          if (fig) {
            fig.classList.add('on');
            fig.scrollIntoView({ block: 'center' });
          }
          lightbox.abrir(cat.fotos, k, rotuloSala, true);
        };
        abrirDoLink();
        window.addEventListener('hashchange', () => (location.hash ? abrirDoLink() : lightbox.fechar()));

        const corredor = document.getElementById('corredor');
        if (corredor) {
          const ant = dados.categorias[(i - 1 + n) % n];
          const prox = dados.categorias[(i + 1) % n];
          corredor.innerHTML = `
            <a href="${ant.pagina}"><span class="rotulo">← Sala ${romano(((i - 1 + n) % n) + 1)}</span><strong>${esc(ant.titulo)}</strong></a>
            <a href="${prox.pagina}"><span class="rotulo">Sala ${romano(((i + 1) % n) + 1)} →</span><strong>${esc(prox.titulo)}</strong></a>`;
        }
      })
      .catch(() => falhou(paredeSala, 'Não foi possível carregar esta sala agora.'));
  }

  /* ---------- Formulário (Formspree) ---------- */
  const form = document.getElementById('form-contato');
  const status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const botao = form.querySelector('button[type="submit"]');
      botao.disabled = true;
      status.className = 'form-status';
      status.textContent = 'Enviando…';
      try {
        const resposta = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!resposta.ok) throw new Error('falha no envio');
        status.className = 'form-status ok';
        status.textContent = 'Mensagem enviada. Respondo em breve.';
        form.reset();
      } catch {
        status.className = 'form-status erro';
        status.textContent = 'Não foi possível enviar. Tente pelo WhatsApp.';
      } finally {
        botao.disabled = false;
      }
    });
  }
})();
