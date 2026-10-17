/* ============================================================
   ROMA FOTOGRAFIAS — idioma (PT / EN)
   Carrega no <head>, antes da página aparecer, pra decidir o idioma
   sem piscar texto em português pra quem lê em inglês.

   Ordem de decisão: ?lang= na URL → escolha salva → idioma do
   navegador (português → PT; qualquer outro → EN).

   O HTML continua escrito em português (é a fonte). Elementos com
   data-i18n="chave" recebem o texto em inglês do dicionário abaixo;
   data-i18n-attr="atributo:chave;outro:chave" faz o mesmo em atributos.
   A descrição das salas vem do manifesto (descricao_en). Os nomes das
   fotos e das salas são originais do autor e não são traduzidos.
   ============================================================ */

(function () {
  'use strict';

  var IDIOMAS = ['pt', 'en'];
  var CHAVE = 'roma-idioma';

  function escolher() {
    try {
      var daUrl = new URLSearchParams(location.search).get('lang');
      if (IDIOMAS.indexOf(daUrl) >= 0) {
        try { localStorage.setItem(CHAVE, daUrl); } catch (e) {}
        return daUrl;
      }
    } catch (e) {}
    try {
      var salvo = localStorage.getItem(CHAVE);
      if (IDIOMAS.indexOf(salvo) >= 0) return salvo;
    } catch (e) {}
    // Robôs de busca leem a versão em português (a principal); o inglês
    // tem endereço próprio (?lang=en), anunciado com hreflang.
    if (/bot|crawl|spider|slurp|lighthouse/i.test(navigator.userAgent)) return 'pt';
    var lista = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < lista.length; i++) {
      if (/^pt\b/i.test(lista[i])) return 'pt';
    }
    return lista.length && lista[0] ? 'en' : 'pt';
  }

  var idioma = escolher();
  var raiz = document.documentElement;
  raiz.lang = idioma === 'en' ? 'en' : 'pt-BR';

  // Inglês: esconde o corpo até trocar os textos (no máximo 2,5s).
  if (idioma === 'en') {
    raiz.classList.add('i18n-carregando');
    setTimeout(function () { raiz.classList.remove('i18n-carregando'); }, 2500);
  }

  /* ---------- Textos fixos das páginas ---------- */
  var EN = {
    'titulo-inicio': 'Vitor Roma — Photography | Sorocaba, Brazil',
    'desc-inicio': 'Permanent exhibition by Vitor Roma, photographer in Sorocaba, Brazil: portraits, the city, nature and nights with flash. Sessions on request.',
    'pular': 'Skip to the photos',
    'inicio': 'Vitor Roma — home',
    'assinatura': 'Photography · Sorocaba, Brazil',
    'nav': 'Main navigation',
    'nav-obras': 'Works',
    'nav-salas': 'Rooms',
    'nav-sobre': 'About',
    'nav-contato': 'Contact',
    'expo-rotulo': 'Permanent exhibition · 2024 — <span data-ano></span>',
    'expo-titulo': 'Photographing <em>life.</em>',
    'expo-texto': 'Portraits of the people close to me, the city we walk through without looking, animals, flowers and a few nights with flash. Come in, take your time.',
    'destaques': 'Featured works',
    'salas-titulo': 'The <em>rooms</em>',
    'sobre-titulo': 'About the <em>photographer</em>',
    'sobre-rotulo': 'Wall text',
    'sobre-legenda': 'Vitor Roma, self-portrait',
    'sobre-grande': 'I take photos to turn moments into memories.',
    'sobre-1': 'I’m Vitor Roma, a photographer and developer in Sorocaba, Brazil. I started with a <span class="inteiro">Sony DSC-H400</span> and today I shoot with a <span class="inteiro">Canon T5i</span>, always with the same drive: turning ordinary moments into memories you can relive just by looking. I’m still early in the journey, and that’s exactly why every session gets my full attention and special care.',
    'sobre-2': 'I believe it isn’t enough to look at an image: you have to feel what it carries. Whether it’s a portrait, an event or a personal project, I look for photos that tell <em>your</em> stories.',
    'sobre-3': 'And since I’m also a developer, I can take your shoot beyond the photos: a website to gather and show the images as a portfolio, or even a system built from scratch for your business.',
    'citacao': 'True art is only a reflection of the feelings of those who behold it (…) <cite>Rafael Lange</cite>',
    'ficha': '<dt>Based in</dt><dd>Sorocaba, Brazil</dd><dt>Technique</dt><dd>Digital photography, natural light and flash</dd><dt>Gear</dt><dd><span class="inteiro">Canon T5i</span> (before, <span class="inteiro">Sony DSC-H400</span>)</dd><dt>Sessions</dt><dd>Portraits, photo shoots, family, events and custom projects</dd><dt>Extra</dt><dd>Portfolio website or custom system for the client</dd>',
    'contato-titulo': 'Shall we <em>shoot?</em>',
    'contato-rotulo': 'Sessions on request',
    'convite': 'Portrait, photo shoot, family or a different idea — tell me what you have in mind.',
    'whatsapp': 'https://wa.me/5515991023998?text=Hi%2C%20Vitor!%20I%20saw%20your%20website%20and%20would%20like%20to%20talk%20about%20a%20photo%20session.',
    'form-nome': 'Name',
    'form-email': 'Email',
    'form-mensagem': 'Message',
    'form-enviar': 'Send message',
    'rodape-autorais': 'All photos are original work',
    'rodape-agendar': 'Book a session →',
    'lightbox': 'Enlarged work',
    'fechar': 'Close ✕',
    'anterior': '← Previous',
    'proxima': 'Next →',
    'corredor': 'Other rooms',
    'idiomas': 'Language'
  };

  /* ---------- Textos montados pelo main.js ---------- */
  var FRASES = {
    pt: {
      copiar: 'Copiar link',
      copiado: 'Link copiado ✓',
      copieAqui: 'Copie o link:',
      ampliar: 'Ampliar: {t}',
      salasObras: '{s} salas · {o} obras',
      obras: '{n} obras',
      salaDe: 'Sala {i} de {n}',
      sala: 'Sala {i}',
      erroExpo: 'Não foi possível carregar a exposição agora.',
      erroSalas: 'Não foi possível carregar as salas agora.',
      erroSala: 'Não foi possível carregar esta sala agora.',
      enviando: 'Enviando…',
      enviado: 'Mensagem enviada. Respondo em breve.',
      erroEnvio: 'Não foi possível enviar. Tente pelo WhatsApp.',
      tituloSala: '{t} | Vitor Roma — Fotografia'
    },
    en: {
      copiar: 'Copy link',
      copiado: 'Link copied ✓',
      copieAqui: 'Copy the link:',
      ampliar: 'Enlarge: {t}',
      salasObras: '{s} rooms · {o} works',
      obras: '{n} works',
      salaDe: 'Room {i} of {n}',
      sala: 'Room {i}',
      erroExpo: 'The exhibition could not be loaded right now.',
      erroSalas: 'The rooms could not be loaded right now.',
      erroSala: 'This room could not be loaded right now.',
      enviando: 'Sending…',
      enviado: 'Message sent. I’ll get back to you soon.',
      erroEnvio: 'The message could not be sent. Try WhatsApp.',
      tituloSala: '{t} | Vitor Roma — Photography'
    }
  };

  function t(chave, vars) {
    var texto = FRASES[idioma][chave] || FRASES.pt[chave] || chave;
    return texto.replace(/\{(\w+)\}/g, function (_, k) { return vars && k in vars ? vars[k] : ''; });
  }

  /** Campo traduzido de um item do manifesto, com o português como reserva. */
  function campo(obj, nome) {
    if (!obj) return '';
    return (idioma === 'en' && obj[nome + '_en']) || obj[nome] || '';
  }

  var aplicado = false;
  function aplicar() {
    if (aplicado) return;
    aplicado = true;
    if (idioma === 'en') {
      document.querySelectorAll('[data-i18n]').forEach(function (el) {
        var texto = EN[el.getAttribute('data-i18n')];
        if (texto != null) el.innerHTML = texto;
      });
      document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
        el.getAttribute('data-i18n-attr').split(';').forEach(function (par) {
          var p = par.split(':');
          var texto = EN[(p[1] || '').trim()];
          if (texto != null) el.setAttribute(p[0].trim(), texto);
        });
      });
      var og = document.querySelector('meta[property="og:locale"]');
      if (og) og.setAttribute('content', 'en_US');
      var canonica = document.querySelector('link[rel="canonical"]');
      if (canonica) canonica.setAttribute('href', canonica.getAttribute('href').split('?')[0] + '?lang=en');
    }
    // Seletor PT | EN do menu: marca o atual e guarda a escolha ao clicar.
    document.querySelectorAll('[data-idioma]').forEach(function (a) {
      var este = a.getAttribute('data-idioma');
      if (este === idioma) a.setAttribute('aria-current', 'true');
      a.addEventListener('click', function () {
        try { localStorage.setItem(CHAVE, este); } catch (e) {}
      });
    });
    raiz.classList.remove('i18n-carregando');
  }

  window.ROMA_I18N = { idioma: idioma, t: t, campo: campo, aplicar: aplicar };
  document.addEventListener('DOMContentLoaded', aplicar);
})();
