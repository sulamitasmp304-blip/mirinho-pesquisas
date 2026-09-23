import { normalizarResposta } from './respostas.js';
export function dadosDaCapa(pesquisa, edicoes = {}) {
  return {
    cidade: edicoes.cidade ?? pesquisa.cidade ?? '',
    dataInicio: edicoes.dataInicio ?? pesquisa.dataInicio ?? '',
    dataFim: edicoes.dataFim ?? pesquisa.dataFim ?? '',
    totalEntrevistas: edicoes.totalEntrevistas ?? pesquisa.totalEntrevistas ?? 0,
  };
}

export function rotuloGrafico(nome) {
  return normalizarResposta(nome);
}
