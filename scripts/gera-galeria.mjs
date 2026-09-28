#!/usr/bin/env node
/**
 * Atualiza galeria/fotos.json a partir das pastas de fotos.
 *
 * - Fotos NOVAS nas pastas entram no manifesto com título derivado
 *   do nome do arquivo (ex.: "ret_pai_bw.jpg" -> "Pai bw").
 * - Títulos já existentes são SEMPRE preservados (edite à vontade).
 * - Entradas cujo arquivo sumiu são removidas.
 * - Gera miniaturas (miniaturas/<pasta>/<foto>.jpg, 1000px) usadas
 *   na parede da exposição; a foto original abre no lightbox.
 *
 * Uso local:  node scripts/gera-galeria.mjs
 * No GitHub:  roda sozinho via Action a cada push com fotos.
 */

import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
const MANIFESTO = join(RAIZ, 'galeria', 'fotos.json');
const EXTENSOES = /\.(jpe?g|png|webp)$/i;

function dimensoes(caminho) {
  const tentativas = [
    `magick identify -format "%w %h" "${caminho}"`,
    `identify -format "%w %h" "${caminho}"`,
    `ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=\\ :p=0 "${caminho}"`,
  ];
  for (const cmd of tentativas) {
    try {
      const saida = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
      const [w, h] = saida.split(/[\s,x]+/).map(Number);
      if (w > 0 && h > 0) return { w, h };
    } catch {
      /* tenta a próxima ferramenta */
    }
  }
  return { w: 0, h: 0 };
}

/** Caminho da miniatura de uma foto — o main.js usa a mesma regra. */
const caminhoMiniatura = (arquivo) => `miniaturas/${arquivo.replace(/\.[^.]+$/, '')}.jpg`;

function gerarMiniatura(arquivo) {
  const origem = join(RAIZ, arquivo);
  const destino = join(RAIZ, caminhoMiniatura(arquivo));
  if (existsSync(destino)) return false;
  mkdirSync(dirname(destino), { recursive: true });
  const tentativas = [
    `magick "${origem}" -auto-orient -resize "1000x1000>" -strip -quality 80 "${destino}"`,
    `convert "${origem}" -auto-orient -resize "1000x1000>" -strip -quality 80 "${destino}"`,
    `ffmpeg -v error -y -i "${origem}" -vf "scale='if(gt(iw,ih),min(1000,iw),-2)':'if(gt(iw,ih),-2,min(1000,ih))'" -map_metadata -1 -q:v 4 "${destino}"`,
  ];
  for (const cmd of tentativas) {
    try {
      execSync(cmd, { stdio: 'ignore' });
      if (existsSync(destino)) return true;
    } catch {
      /* tenta a próxima ferramenta */
    }
  }
  console.warn(`! não consegui gerar a miniatura de ${arquivo}`);
  return false;
}

function tituloDoArquivo(nome) {
  const semExt = nome.replace(EXTENSOES, '');
  const semPrefixo = semExt.replace(/^(arq|for|nat|ret|capa)[_-]/i, '');
  const texto = semPrefixo.replace(/[_-]+/g, ' ').trim();
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

const dados = JSON.parse(readFileSync(MANIFESTO, 'utf8'));
let adicionadas = 0;
let removidas = 0;

for (const cat of dados.categorias) {
  const pasta = join(RAIZ, cat.pasta);

  // Remove entradas cujo arquivo não existe mais
  const antes = cat.fotos.length;
  cat.fotos = cat.fotos.filter((f) => existsSync(join(RAIZ, f.arquivo)));
  removidas += antes - cat.fotos.length;

  // Adiciona arquivos novos da pasta
  const conhecidos = new Set(cat.fotos.map((f) => f.arquivo.toLowerCase()));
  const arquivos = readdirSync(pasta).filter((n) => EXTENSOES.test(n)).sort();

  for (const nome of arquivos) {
    const rel = `${cat.pasta}/${nome}`;
    if (conhecidos.has(rel.toLowerCase())) continue;
    const { w, h } = dimensoes(join(pasta, nome));
    cat.fotos.push({ arquivo: rel, titulo: tituloDoArquivo(nome), w, h });
    adicionadas++;
    console.log(`+ ${rel}`);
  }
}

// Destaques da home: descarta os que apontam pra fotos removidas
if (Array.isArray(dados.destaques)) {
  const existentes = new Set(dados.categorias.flatMap((c) => c.fotos.map((f) => f.arquivo)));
  dados.destaques = dados.destaques.filter((a) => existentes.has(a));
}

// Miniaturas de todas as fotos e capas
let miniaturas = 0;
for (const cat of dados.categorias) {
  for (const arquivo of [cat.capa, ...cat.fotos.map((f) => f.arquivo)]) {
    if (arquivo && existsSync(join(RAIZ, arquivo)) && gerarMiniatura(arquivo)) miniaturas++;
  }
}

writeFileSync(MANIFESTO, JSON.stringify(dados, null, 2) + '\n', 'utf8');
console.log(`Manifesto atualizado: ${adicionadas} adicionada(s), ${removidas} removida(s), ${miniaturas} miniatura(s) nova(s).`);
