import { useMemo, useState } from 'react';
import { buildPdfHtml } from './pdf';
import { pesquisaSimulada, redistribuirPercentuais } from './simulacao';

const formatarData = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '—';
const pct = n => `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

export default function ResultadoImportado({ pesquisa }) {
  const perguntas = pesquisa.perguntas.filter(q => pesquisa.resultados[q.id]?.votos);
  const [ajustes, setAjustes] = useState({});
  const [pergunta, setPergunta] = useState(String(perguntas[0]?.id ?? ''));
  const [opcao, setOpcao] = useState('');
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [editar, setEditar] = useState(false);
  const original = pesquisa.resultados[pergunta];
  const votos = ajustes[pergunta] || original?.votos || {};
  const simulado = Object.keys(ajustes).length > 0;
  const html = useMemo(() => buildPdfHtml(pesquisaSimulada(pesquisa, ajustes), formatarData), [pesquisa, ajustes]);
  function aplicar(e) {
    e.preventDefault(); setErro('');
    try {
      // O primeiro ajuste usa contagens exatas; os seguintes usam a simulação atual.
      const pesos = ajustes[pergunta] || original.contagem || original.votos;
      const novos = redistribuirPercentuais(pesos, opcao, valor);
      setAjustes(a => ({ ...a, [pergunta]: novos }));
      setMensagem('Simulação atualizada. As opções desta pergunta totalizam 100%.');
    } catch(e) { setErro(e.message); }
  }
  function restaurar() { setAjustes({}); setValor(''); setErro(''); setMensagem('Resultados originais restaurados.'); }
  return <div className="imp-card">
    <h2>Resultado da prévia</h2>
    <p className="imp-muted">Relatório no modelo Mirinho Tribuna, com capa e gráficos gerais e por setor.</p>
    <div className="imp-actions">
      {perguntas.length > 0 && <button className="imp-secondary" onClick={() => setEditar(v => !v)} aria-expanded={editar}>{editar ? 'Fechar edição' : 'Simular percentuais'}</button>}
      {simulado && <button className="imp-secondary" onClick={restaurar}>Restaurar resultados originais</button>}
      <button className="imp-primary" onClick={() => {
        const win = window.open('', '_blank');
        if (!win) { setErro('Permita a abertura de uma nova janela para imprimir o relatório.'); return; }
        win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 800);
      }}>{simulado ? 'Imprimir / salvar PDF da simulação' : 'Imprimir / salvar PDF'}</button>
    </div>
    {editar && <div className="imp-simulation">
      <h3>Simular percentuais do resultado geral</h3>
      <p className="imp-muted">Altere uma opção e as demais serão redistribuídas proporcionalmente. Os resultados do Excel e dos setores são preservados. A simulação fica nesta tela e não substitui a pesquisa salva.</p>
      <label>Pergunta<select value={pergunta} onChange={e => { setPergunta(e.target.value); setOpcao(''); setValor(''); setErro(''); setMensagem(''); }}>{perguntas.map(q => <option key={q.id} value={q.id}>{q.id}- {q.texto}</option>)}</select></label>
      <form onSubmit={aplicar} className="imp-simulation-form">
        <label>Opção a ajustar<select value={opcao} onChange={e => { setOpcao(e.target.value); setValor(String(votos[e.target.value] ?? '')); setErro(''); }}><option value="">Escolha uma opção</option>{Object.keys(votos).map(n => <option key={n} value={n}>{n}</option>)}</select></label>
        <label>Novo percentual (%)<input inputMode="decimal" placeholder="Ex.: 70" value={valor} onChange={e => setValor(e.target.value)} /></label>
        <button type="submit" className="imp-primary" disabled={!opcao}>Aplicar simulação</button>
      </form>
      <table><thead><tr><th>Opção</th><th>Excel original</th><th>{ajustes[pergunta] ? 'Simulação' : 'Prévia'}</th></tr></thead><tbody>{Object.entries(votos).map(([n, v]) => <tr key={n}><td>{n}</td><td>{pct(original.votos[n])}</td><td><strong>{pct(v)}</strong></td></tr>)}</tbody></table>
      <p className="imp-muted">Total: {pct(Math.round(Object.values(votos).reduce((n, v) => n + v, 0) * 10) / 10)}{!ajustes[pergunta] && ' · Percentuais originais arredondados a uma casa decimal.'}</p>
      {ajustes[pergunta] && <button className="imp-secondary" onClick={() => { setAjustes(a => { const novo = { ...a }; delete novo[pergunta]; return novo; }); setValor(''); setErro(''); setMensagem('Esta pergunta voltou aos resultados originais.'); }}>Restaurar esta pergunta</button>}
    </div>}
    {simulado && <p className="imp-simulation-label">SIMULAÇÃO · Percentuais gerais ajustados manualmente. Resultados por setor mantidos conforme o Excel.</p>}
    {erro && <p role="alert" className="imp-error">{erro}</p>}
    {mensagem && <p role="status" className="imp-muted">{mensagem}</p>}
    <iframe title="Prévia do PDF Mirinho Tribuna" sandbox="" srcDoc={html} style={{ width:'100%', height:720, border:'1px solid #ddd', marginTop:20, background:'white' }}/>
  </div>;
}
