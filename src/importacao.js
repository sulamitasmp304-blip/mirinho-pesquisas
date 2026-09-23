import { read, utils } from 'xlsx';

const text = v => String(v ?? '').trim().replace(/\s+/g, ' ');
const key = v => text(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const setorInvalido = v => !text(v) || /this choice no longer accept response/i.test(v);

export function lerExcel(buffer) {
  const workbook = read(buffer, { type: 'array', cellDates: true });
  return workbook.SheetNames.map(nome => ({ nome, linhas: utils.sheet_to_json(workbook.Sheets[nome], { header: 1, defval: '', raw: true }) }));
}

export function analisar(linhas) {
  const inicio = linhas.findIndex(r => r.some(v => ['setor', 'bairro'].includes(key(v))));
  if (inicio < 0) throw new Error('Não encontrei a coluna Setor ou Bairro. Confira o cabeçalho do Excel.');
  const headers = linhas[inicio].map(text);
  const setor = headers.findIndex(v => ['setor', 'bairro'].includes(key(v)));
  const perguntas = headers.map((texto, coluna) => ({ texto, coluna })).filter(q => /^\d+\s*[-–.)]/.test(q.texto));
  if (!perguntas.length) throw new Error('Não encontrei perguntas numeradas, como “1- Pergunta”.');
  const rows = linhas.slice(inicio + 1).filter(r => r.some(v => text(v)));
  if (!rows.length) throw new Error('A planilha não tem entrevistas.');
  const setores = new Map();
  rows.forEach(r => { const nome = text(r[setor]); setores.set(nome, (setores.get(nome) || 0) + 1); });
  return { rows, headers, setor, perguntas, setores: [...setores].map(([nome, quantidade]) => ({ nome, quantidade })) };
}

export function resumir(modelo, destinos) {
  const grupos = new Map();
  modelo.setores.forEach(({ nome, quantidade }, i) => {
    const destino = text(destinos[i]);
    if (!destino || setorInvalido(destino)) return;
    const k = key(destino);
    const grupo = grupos.get(k) || { nome: destino, quantidade: 0 };
    grupo.quantidade += quantidade;
    grupos.set(k, grupo);
  });
  return [...grupos.values()];
}

export function gerarPesquisa(modelo, destinos, cidade) {
  if (!text(cidade)) throw new Error('Informe a cidade.');
  if (modelo.setores.some((_, i) => setorInvalido(destinos[i]))) throw new Error('Escolha um destino válido para todos os setores.');
  const grupos = resumir(modelo, destinos);
  const nomes = new Map(grupos.map(g => [key(g.nome), g.nome]));
  const mapa = new Map(modelo.setores.map((s, i) => [s.nome, nomes.get(key(destinos[i]))]));
  const perguntas = modelo.perguntas.map((q, i) => ({ id: i + 1, texto: q.texto.replace(/^\d+\s*[-–.)]\s*/, ''), tipo: /nota.*0.*10/i.test(q.texto) ? 'nota' : 'multipla', opcoes: [...new Set(modelo.rows.map(r => text(r[q.coluna])).filter(Boolean))] }));
  const resultados = { _por_bairro: Object.create(null) };
  grupos.forEach(g => { resultados._por_bairro[g.nome] = Object.create(null); });
  const adicionar = (obj, q, valor) => {
    if (!text(valor)) return;
    if (q.tipo === 'nota') {
      const n = Number(String(valor).replace(',', '.'));
      if (!Number.isFinite(n) || n < 0 || n > 10) throw new Error(`Nota inválida em “${q.texto}”: ${valor}. Corrija no Excel e envie novamente.`);
      const atual = obj[q.id] || { soma: 0, total: 0, media: 0 };
      atual.soma += n; atual.total++; atual.media = Math.round(atual.soma / atual.total * 10) / 10;
      obj[q.id] = atual;
    } else {
      const atual = obj[q.id] || { contagem: Object.create(null), votos: Object.create(null), total: 0 };
      const v = text(valor); atual.contagem[v] = (atual.contagem[v] || 0) + 1; atual.total++;
      obj[q.id] = atual;
    }
  };
  modelo.rows.forEach(r => perguntas.forEach((q, i) => {
    adicionar(resultados, q, r[modelo.perguntas[i].coluna]);
    adicionar(resultados._por_bairro[mapa.get(text(r[modelo.setor]))], q, r[modelo.perguntas[i].coluna]);
  }));
  [resultados, ...Object.values(resultados._por_bairro)].forEach(obj => perguntas.forEach(q => {
    const r = obj[q.id];
    if (r?.contagem) Object.entries(r.contagem).forEach(([v, n]) => { r.votos[v] = Math.round(n / r.total * 1000) / 10; });
  }));
  const datas = modelo.rows.flatMap(r => r.filter(v => v instanceof Date && !isNaN(v)).map(d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`)).sort();
  return { cidade: text(cidade), dataInicio: datas[0] || '', dataFim: datas.at(-1) || '', totalEntrevistas: modelo.rows.length, status: 'concluida', bairros: grupos.map((g, i) => ({ id: i+1, nome: g.nome, feitas: g.quantidade, cota: g.quantidade })), perguntas, entrevistadoras: [], resultados };
}
