/* ============================================================
   ROMA FOTOGRAFIAS — scripts
   Galerias renderizadas a partir de galeria/fotos.json:
   pra adicionar foto, basta subir o arquivo na pasta da
   categoria — o manifesto é atualizado pelo GitHub Action.
   ============================================================ */

(() => {
  'use strict';

  /* ---------- Navbar: fundo sólido ao rolar ---------- */
  const nav = document.querySelector('.nav');
  const aoRolar = () => nav && nav.classList.toggle('scrolled', window.scrollY > 24);
  aoRolar();
  window.addEventListener('scroll', aoRolar, { passive: true });

  /* ---------- Ano do footer ---------- */
  document.querySelectorAll('[data-ano]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Reveal on scroll ---------- */
  const revelar = () => {
    const els = document.querySelectorAll('.reveal:not(.on)');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('on'));
      return;
    }
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('on');
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: '-40px' }
    );
    els.forEach((el) => obs.observe(el));
  };
  revelar();

  /* ---------- Carrega o manifesto ---------- */
  const carregarManifesto = () =>
    fetch('galeria/fotos.json').then((r) => {
      if (!r.ok) throw new Error('manifesto indisponível');
      return r.json();
    });

  /* ---------- Home: cards de categoria ---------- */
  const gridCategorias = document.getElementById('grid-categorias');
  if (gridCategorias) {
    carregarManifesto()
      .then((dados) => {
        gridCategorias.innerHTML = dados.categorias
          .map(
            (cat) => `
          <a class="cat-card reveal" href="${cat.pagina}">
            <img src="${encodeURI(cat.capa)}" alt="${cat.titulo}" loading="lazy" decoding="async">
            <div class="cat-card-info">
              <div>
                <h3>${cat.titulo}</h3>
                <p>${cat.descricao}</p>
              </div>
              <span class="cat-card-count">${cat.fotos.length} fotos</span>
            </div>
          </a>`
          )
          .join('');
        revelar();
      })
      .catch(() => {
        gridCategorias.innerHTML =
          '<p style="color:var(--muted)">Não foi possível carregar o portfólio agora.</p>';
      });
  }

  /* ---------- Páginas de galeria ---------- */
  const galeria = document.getElementById('galeria');
  const slug = document.body.dataset.galeria;

  let fotos = [];
  let indiceAtual = 0;

  if (galeria && slug) {
    carregarManifesto()
      .then((dados) => {
        const cat = dados.categorias.find((c) => c.slug === slug);
        if (!cat) throw new Error('categoria não encontrada');
        fotos = cat.fotos;

        galeria.innerHTML = fotos
          .map(
            (f, i) => `
          <figure class="reveal" tabindex="0" role="button" aria-label="Ampliar: ${f.titulo}" data-indice="${i}">
            <img src="${encodeURI(f.arquivo)}" alt="${f.titulo}" width="${f.w}" height="${f.h}"
                 loading="${i < 6 ? 'eager' : 'lazy'}" decoding="async">
            <figcaption>${f.titulo}</figcaption>
          </figure>`
          )
          .join('');
        revelar();

        galeria.addEventListener('click', (e) => {
          const fig = e.target.closest('figure[data-indice]');
          if (fig) abrirLightbox(Number(fig.dataset.indice));
        });
        galeria.addEventListener('keydown', (e) => {
          const fig = e.target.closest('figure[data-indice]');
          if (fig && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            abrirLightbox(Number(fig.dataset.indice));
          }
        });
      })
      .catch(() => {
        galeria.innerHTML =
          '<p style="color:var(--muted)">Não foi possível carregar a galeria agora.</p>';
      });
  }

  /* ---------- Lightbox ---------- */
  const lightbox = document.getElementById('lightbox');
  const lbImg = lightbox ? lightbox.querySelector('img') : null;
  const lbLegenda = lightbox ? lightbox.querySelector('.legenda') : null;

  function mostrarFoto(i) {
    indiceAtual = (i + fotos.length) % fotos.length;
    const f = fotos[indiceAtual];
    lbImg.src = encodeURI(f.arquivo);
    lbImg.alt = f.titulo;
    lbLegenda.textContent = `${f.titulo} — ${indiceAtual + 1} de ${fotos.length}`;
  }

  function abrirLightbox(i) {
    if (!lightbox) return;
    mostrarFoto(i);
    lightbox.classList.add('aberto');
    document.body.style.overflow = 'hidden';
    lightbox.querySelector('.fechar').focus();
  }

  function fecharLightbox() {
    lightbox.classList.remove('aberto');
    document.body.style.overflow = '';
  }

  if (lightbox) {
    lightbox.querySelector('.fechar').addEventListener('click', fecharLightbox);
    lightbox.querySelector('.ant').addEventListener('click', () => mostrarFoto(indiceAtual - 1));
    lightbox.querySelector('.prox').addEventListener('click', () => mostrarFoto(indiceAtual + 1));
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) fecharLightbox();
    });
    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('aberto')) return;
      if (e.key === 'Escape') fecharLightbox();
      if (e.key === 'ArrowLeft') mostrarFoto(indiceAtual - 1);
      if (e.key === 'ArrowRight') mostrarFoto(indiceAtual + 1);
    });
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
        if (resposta.ok) {
          status.className = 'form-status ok';
          status.textContent = 'Mensagem enviada! Respondo em breve.';
          form.reset();
        } else {
          throw new Error('falha no envio');
        }
      } catch {
        status.className = 'form-status erro';
        status.textContent = 'Não foi possível enviar. Tente pelo WhatsApp!';
      } finally {
        botao.disabled = false;
      }
    });
  }
})();
