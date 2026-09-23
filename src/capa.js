export function dadosDaCapa(pesquisa, edicoes = {}) {
  return {
    cidade: edicoes.cidade ?? pesquisa.cidade ?? '',
    dataInicio: edicoes.dataInicio ?? pesquisa.dataInicio ?? '',
    dataFim: edicoes.dataFim ?? pesquisa.dataFim ?? '',
    totalEntrevistas: edicoes.totalEntrevistas ?? pesquisa.totalEntrevistas ?? 0,
  };
}

export function rotuloGrafico(nome) {
  return /^brancos\s*\/\s*nulos\s*\/\s*indecisos$/i.test(String(nome).trim()) ? 'B/NU/IND' : nome;
}
