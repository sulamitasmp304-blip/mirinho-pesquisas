import { dadosDaCapa } from './capa';

export default function CapaEditor({ pesquisa, value, onChange }) {
  const capa = dadosDaCapa(pesquisa, value);
  const mudar = (campo, valor) => onChange({ ...value, [campo]: valor });
  return <details className="imp-cover-editor">
    <summary>Editar dados da capa</summary>
    <p>Esses campos alteram somente a capa do relatório. As entrevistas, os percentuais e os gráficos permanecem iguais.</p>
    <div className="imp-cover-fields">
      <label>Cidade na capa<input value={capa.cidade} onChange={e => mudar('cidade', e.target.value)} /></label>
      <label>Total de entrevistas na capa<input type="number" min="0" step="1" value={capa.totalEntrevistas} onChange={e => { if (/^\d*$/.test(e.target.value)) mudar('totalEntrevistas', e.target.value); }} /></label>
      <label>Data inicial na capa<input type="date" value={capa.dataInicio} onChange={e => mudar('dataInicio', e.target.value)} /></label>
      <label>Data final na capa (opcional)<input type="date" value={capa.dataFim} onChange={e => mudar('dataFim', e.target.value)} /></label>
    </div>
    <p>Base original: {pesquisa.totalEntrevistas} entrevistas. As edições da capa valem para o PDF gerado nesta tela.</p>
    <button type="button" className="imp-secondary" onClick={() => onChange({})}>Restaurar dados da capa</button>
  </details>;
}
