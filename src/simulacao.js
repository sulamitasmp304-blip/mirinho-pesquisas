// Redistribui em décimos de ponto percentual, com total exato de 100%.
export function redistribuirPercentuais(pesos, opcao, percentual) {
  const entries = Object.entries(pesos);
  if (!Object.hasOwn(pesos, opcao)) throw new Error('Escolha uma opção da pergunta.');
  const numero = typeof percentual === 'number' ? percentual : Number(String(percentual).trim().replace(',', '.'));
  if (String(percentual).trim() === '' || !Number.isFinite(numero) || numero < 0 || numero > 100) {
    throw new Error('Informe um percentual entre 0 e 100.');
  }
  if (Math.abs(numero * 10 - Math.round(numero * 10)) > 1e-7) throw new Error('Use no máximo uma casa decimal.');
  if (entries.some(([, n]) => !Number.isFinite(n) || n < 0)) throw new Error('A distribuição de origem é inválida.');
  const fixo = Math.round(numero * 10);
  const outros = entries.filter(([nome]) => nome !== opcao);
  if (!outros.length && fixo !== 1000) throw new Error('Uma pergunta com apenas uma opção precisa totalizar 100%.');
  const soma = outros.reduce((n, [, v]) => n + v, 0);
  if (soma === 0 && fixo !== 1000) throw new Error('As outras opções estão zeradas. Restaure os valores originais para redistribuir.');
  const partes = outros.map(([nome, peso], i) => {
    const exato = soma ? (1000 - fixo) * peso / soma : 0;
    return { nome, unidades: Math.floor(exato), resto: exato - Math.floor(exato), i };
  });
  let restantes = 1000 - fixo - partes.reduce((n, p) => n + p.unidades, 0);
  [...partes].sort((a, b) => b.resto - a.resto || a.i - b.i).forEach(p => { if (restantes > 0) { p.unidades++; restantes--; } });
  const valores = new Map(partes.map(p => [p.nome, p.unidades / 10]));
  valores.set(opcao, fixo / 10);
  return Object.fromEntries(entries.map(([nome]) => [nome, valores.get(nome)]));
}

export function pesquisaSimulada(original, ajustes) {
  const ids = Object.keys(ajustes);
  if (!ids.length) return original;
  const resultados = { ...original.resultados };
  for (const id of ids) resultados[id] = { ...original.resultados[id], votos: { ...ajustes[id] } };
  return { ...original, resultados, simulacao: { perguntas: ids, escopo: 'geral' } };
}
