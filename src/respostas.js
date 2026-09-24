const chave = nome => String(nome ?? '').trim().replace(/\s+/g, ' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s*\/\s*/g, '/');
const equivalentes = new Set(['nao sabe', 'nenhum', 'ninguem', 'branco', 'nao tem', 'nao lembra o nome', 'nao sei', 'brancos/nulos/indecisos', 'b/nu/ind']);

export function normalizarResposta(nome) {
  return equivalentes.has(chave(nome)) ? 'B/NU/IND' : String(nome ?? '').trim().replace(/\s+/g, ' ');
}

export function ordenarGrafico(valores = {}) {
  return Object.entries(valores).sort(([nomeA, valorA], [nomeB, valorB]) => {
    const aUltimo = normalizarResposta(nomeA) === 'B/NU/IND';
    const bUltimo = normalizarResposta(nomeB) === 'B/NU/IND';
    return Number(aUltimo) - Number(bUltimo) || valorB - valorA;
  });
}

export function agruparValores(valores = {}) {
  const grupos = new Map();
  Object.entries(valores).forEach(([nome, quantidade]) => {
    const destino = normalizarResposta(nome);
    grupos.set(destino, (grupos.get(destino) || 0) + quantidade);
  });
  return Object.fromEntries(grupos);
}

export function agruparResultado(resultado, preservarPercentuais = false) {
  if (!resultado?.votos) return resultado;
  const contagem = resultado.contagem ? agruparValores(resultado.contagem) : undefined;
  // Resultados antigos podem ter percentuais manuais. Nunca os substitua por contagens incompatíveis.
  const calculado = !preservarPercentuais && resultado.total > 0 && resultado.contagem &&
    Object.keys(resultado.votos).length === Object.keys(resultado.contagem).length &&
    Object.entries(resultado.votos).every(([nome, pct]) => Object.hasOwn(resultado.contagem, nome) && Math.abs(pct - Math.round(resultado.contagem[nome] / resultado.total * 1000) / 10) < 0.00001);
  const votos = calculado
    ? Object.fromEntries(Object.entries(contagem).map(([nome, n]) => [nome, Math.round(n / resultado.total * 1000) / 10]))
    : Object.fromEntries(Object.entries(agruparValores(resultado.votos)).map(([nome, n]) => [nome, Math.round(n * 1000000) / 1000000]));
  return { ...resultado, ...(contagem ? { contagem } : {}), votos };
}

export function agruparPesquisa(pesquisa) {
  const resultados = { ...(pesquisa.resultados || {}) };
  for (const id of Object.keys(resultados)) {
    if (id !== '_por_bairro') resultados[id] = agruparResultado(resultados[id], pesquisa.simulacao?.perguntas?.includes(id));
  }
  if (resultados._por_bairro) resultados._por_bairro = Object.fromEntries(Object.entries(resultados._por_bairro).map(([bairro, perguntas]) => [bairro, Object.fromEntries(Object.entries(perguntas).map(([id, r]) => [id, agruparResultado(r)]))]));
  return { ...pesquisa, resultados, perguntas: (pesquisa.perguntas || []).map(q => q.tipo === 'nota' ? q : { ...q, opcoes: [...new Set((q.opcoes || []).map(normalizarResposta))] }) };
}
