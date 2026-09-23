import test from 'node:test';
import assert from 'node:assert/strict';
import { analisar, gerarPesquisa, resumir } from './importacao.js';
import { pesquisaSimulada, redistribuirPercentuais } from './simulacao.js';
import { buildPdfHtml } from './pdf.js';
import { dadosDaCapa, rotuloGrafico } from './capa.js';

const linhas = [
  ['Carimbo de data/hora', 'Setor', '1- QUE NOTA DE 0 A 10?', '2- VOTARIA NOVAMENTE?', '3- CENÁRIO?', '4- CENÁRIO?'],
  [new Date(2026, 8, 23), 'Centro', 10, 'SIM', 'A', 'B'],
  [new Date(2026, 8, 23), 'This choice no longer accept response', 6, 'NÃO', 'B', 'A'],
  [new Date(2026, 8, 23), '', 8, 'SIM', 'A', 'B'],
  ['', '', '', '', '', ''],
];
test('correção de setores preserva entrevistas, cenários e resultados', () => {
  const m = analisar(linhas);
  assert.equal(m.rows.length, 3);
  assert.throws(() => gerarPesquisa(m, ['Centro', '', ''], 'Cidade'));
  const p = gerarPesquisa(m, ['Centro', 'Centro', ' centro '], 'Cidade');
  assert.deepEqual(resumir(m, ['Centro', 'Centro', ' centro ']), [{nome:'Centro',quantidade:3}]);
  assert.equal(p.totalEntrevistas, 3); assert.equal(p.bairros.length, 1);
  assert.equal(p.resultados[1].media, 8); assert.equal(p.resultados[2].contagem.SIM, 2);
  assert.equal(p.resultados._por_bairro.Centro[2].total, 3);
  assert.equal(p.perguntas.length, 4); assert.equal(p.resultados[3].contagem.A, 2);
  assert.equal(p.resultados[4].contagem.A, 1); assert.equal(p.dataInicio, '2026-09-23');
});
test('percentual fixado em 70 com ajuste proporcional exato', () => {
  const pesos = {SIM:53,NÃO:21,'NÃO VOTEI NELE':11,INDECISOS:2};
  const resultado = redistribuirPercentuais(pesos, 'SIM', '70');
  assert.deepEqual(resultado, {SIM:70,NÃO:18.5,'NÃO VOTEI NELE':9.7,INDECISOS:1.8});
  assert.equal(pesos.SIM, 53);
  for (const valor of [0, 0.1, 33.3, 70, 99.9, 100]) {
    const r = redistribuirPercentuais(pesos, 'SIM', valor);
    assert.equal(r.SIM, valor);
    assert.equal(Object.values(r).reduce((n, v) => n + Math.round(v * 10), 0), 1000);
    assert.ok(Object.values(r).every(v => v >= 0));
  }
});
test('entradas inválidas e distribuições sem alternativas', () => {
  for (const n of ['', -1, 101, 'a', '7.25', Infinity]) assert.throws(() => redistribuirPercentuais({A:1,B:1}, 'A', n));
  assert.throws(() => redistribuirPercentuais({A:1}, 'A', 70));
  assert.throws(() => redistribuirPercentuais({A:100,B:0}, 'A', 70));
  assert.deepEqual(redistribuirPercentuais({A:1}, 'A', 100), {A:100});
  assert.equal(redistribuirPercentuais({A:1,B:1}, 'A', '70,1').A, 70.1);
});
test('PDF usa o modelo compartilhado, marca simulação e preserva originais', () => {
  const p = gerarPesquisa(analisar(linhas), ['Centro', 'Centro', 'Centro'], '<Cidade>');
  const antes = JSON.stringify(p);
  const ajustes = {2: redistribuirPercentuais(p.resultados[2].contagem,'SIM',70)};
  const sim = pesquisaSimulada(p, ajustes);
  assert.equal(sim.resultados[2].votos.SIM,70);
  assert.equal(sim.resultados._por_bairro.Centro[2].votos.SIM,66.7);
  assert.equal(JSON.stringify(p),antes);
  assert.equal(pesquisaSimulada(p,{}),p);
  const html = buildPdfHtml(sim, d => d);
  assert.ok(html.includes('Geral — SIMULAÇÃO'));
  assert.ok(html.includes('&lt;CIDADE&gt;'));
  assert.equal((html.match(/<div class="simulacao-aviso">/g)||[]).length,9);
  assert.ok(!buildPdfHtml(p,d=>d).includes('Geral — SIMULAÇÃO'));
});

test('edições da capa não alteram perguntas, contagens, percentuais ou setores', () => {
  const p = gerarPesquisa(analisar(linhas), ['Centro', 'Centro', 'Centro'], 'Cidade');
  const antes = JSON.stringify(p);
  const original = buildPdfHtml(p, d => d);
  const editado = buildPdfHtml(p, d => d, {cidade:'Outra cidade',dataInicio:'2026-10-01',dataFim:'',totalEntrevistas:'300'});
  assert.ok(editado.includes('OUTRA CIDADE'));
  assert.ok(editado.includes('2026-10-01 (300 entrevistas)'));
  // Todas as páginas após a capa permanecem byte a byte iguais.
  assert.equal(editado.slice(editado.indexOf('<div class="page">')), original.slice(original.indexOf('<div class="page">')));
  assert.equal(JSON.stringify(p), antes);
  assert.equal(dadosDaCapa(p,{}).totalEntrevistas,3);
  assert.equal(dadosDaCapa(p,{totalEntrevistas:0}).totalEntrevistas,0);
  assert.equal(rotuloGrafico('BRANCOS/NULOS/INDECISOS'),'B/NU/IND');
  assert.equal(rotuloGrafico('Outro nome comprido'),'Outro nome comprido');
});
