import { useRef, useState } from 'react';
import { analisar, lerExcel, resumir, gerarPesquisa, setorInvalido } from './importacao';
import './importacao.css';
import ResultadoImportado from './ResultadoImportado';

export default function ImportarExcel({ onConfirmar, inicial }) {
  const [arquivo, setArquivo] = useState(inicial?.nome || '');
  const [abas, setAbas] = useState(inicial?.abas || []);
  const [indice, setIndice] = useState(0);
  const [modelo, setModelo] = useState(() => inicial ? analisar(inicial.abas[0].linhas) : null);
  const [destinos, setDestinos] = useState(() => inicial ? analisar(inicial.abas[0].linhas).setores.map(s => setorInvalido(s.nome) ? (/riol[aâ]ndia/i.test(inicial.nome) && /this choice/i.test(s.nome) ? 'Centro' : '') : s.nome) : []);
  const [cidade, setCidade] = useState(inicial ? 'Riolândia' : '');
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [arrastando, setArrastando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [pesquisaPronta, setPesquisaPronta] = useState(null);
  const trava = useRef(false);
  const input = useRef(null);
  function selecionar(abasNovas, i, nomeArquivo = arquivo) {
    setIndice(i); setErro(''); setModelo(null); setDestinos([]); setSucesso(false); setPesquisaPronta(null);
    try {
      const m = analisar(abasNovas[i].linhas); setModelo(m);
      // Correção solicitada para este arquivo de Riolândia, sempre visível e editável.
      const riolandia = /riol[aâ]ndia/i.test(nomeArquivo);
      setDestinos(m.setores.map(s => setorInvalido(s.nome) ? (riolandia && /this choice/i.test(s.nome) ? 'Centro' : '') : s.nome));
    } catch(e) { setErro(e.message); }
  }
  async function carregar(file) {
    if (!file || trava.current) return;
    setErro(''); setSucesso(false); setModelo(null); setAbas([]); setArquivo(''); setPesquisaPronta(null);
    if (!/\.xlsx?$/i.test(file.name)) { setErro('Selecione um arquivo Excel (.xlsx ou .xls).'); return; }
    if (file.size > 20 * 1024 * 1024) { setErro('O arquivo deve ter no máximo 20 MB.'); return; }
    trava.current = true; setOcupado(true);
    try {
      const novas = lerExcel(await file.arrayBuffer());
      if (!novas.length) throw new Error('Este arquivo não contém abas.');
      setArquivo(file.name); setAbas(novas); setCidade(file.name.replace(/\.(xlsx|xls)$/i, '').replace(/\s*\(Respostas\)/i, '').trim());
      selecionar(novas, 0, file.name);
    } catch(e) { setErro(`Não foi possível ler o Excel. ${e.message}`); }
    finally { setOcupado(false); trava.current = false; }
  }
  const grupos = modelo ? resumir(modelo, destinos) : [];
  const pendentes = modelo ? modelo.setores.filter((_, i) => setorInvalido(destinos[i])).reduce((s, x) => s + x.quantidade, 0) : 0;
  async function confirmar() {
    if (trava.current) return;
    trava.current = true; setOcupado(true); setErro('');
    try {
      const pesquisa = gerarPesquisa(modelo, destinos, cidade);
      await onConfirmar(pesquisa);
      setPesquisaPronta(pesquisa); setSucesso(true);
    }
    catch(e) { setErro(`Não foi possível gerar a pesquisa: ${e.message}`); }
    finally { trava.current = false; setOcupado(false); }
  }
  return <section className="importacao">
    <div className="imp-eyebrow">PESQUISAS / IMPORTAÇÃO</div>
    <h1>Do Excel à pesquisa pronta</h1>
    <p className="imp-muted">Envie as respostas, confira os setores e gere sua pesquisa.</p>
    <ol className="imp-steps"><li className="active">1 · Enviar arquivo</li><li className={modelo ? 'active' : ''}>2 · Conferir setores</li><li className={sucesso ? 'active' : ''}>3 · Gerar pesquisa</li></ol>
    <fieldset disabled={ocupado || sucesso}>
      <div className={`imp-upload ${arrastando ? 'drag' : ''}`} onDragOver={e => { e.preventDefault(); setArrastando(true); }} onDragLeave={() => setArrastando(false)} onDrop={e => { e.preventDefault(); setArrastando(false); if (!sucesso) carregar(e.dataTransfer.files[0]); }}>
        <span className="imp-file-icon">↥</span><div><strong>{arquivo || 'Arraste seu Excel para cá'}</strong><p className="imp-muted">{arquivo ? 'Arquivo carregado. Confira a distribuição abaixo.' : 'Arquivos .xlsx ou .xls, até 20 MB'}</p></div>
        <button type="button" className="imp-secondary" onClick={() => input.current.click()}>{arquivo ? 'Trocar arquivo' : 'Escolher arquivo'}</button>
        <input ref={input} type="file" accept=".xlsx,.xls" aria-label="Enviar Excel" hidden onChange={e => { carregar(e.target.files[0]); e.target.value = ''; }}/>
      </div>
      {abas.length > 1 && <label>Aba do Excel<select value={indice} onChange={e => selecionar(abas, Number(e.target.value))}>{abas.map((a, i) => <option key={i} value={i}>{a.nome}</option>)}</select></label>}
      {modelo && <>
        <div className="imp-stats"><div><span>Entrevistas no arquivo</span><b>{modelo.rows.length}</b></div><div><span>Setores após correção</span><b>{grupos.length}</b></div><div><span>Perguntas identificadas</span><b>{modelo.perguntas.length}</b></div></div>
        <div className="imp-card"><label className="imp-city">Cidade da pesquisa<input value={cidade} onChange={e => setCidade(e.target.value)}/></label><h2>Confira os setores</h2><p className="imp-muted">Escolha um setor existente ou digite um novo nome. Nomes iguais serão unidos.</p>
          <datalist id="imp-setores">{[...new Set([...modelo.setores.filter(s => !setorInvalido(s.nome)).map(s => s.nome), ...grupos.map(g => g.nome)])].map(n => <option key={n} value={n}/>)}</datalist>
          <div className="imp-table-wrap"><table><thead><tr><th>Setor no Excel</th><th>Entrevistas</th><th>Enviar para o setor</th></tr></thead><tbody>{modelo.setores.map((s, i) => <tr key={i} className={setorInvalido(s.nome) ? 'imp-warning-row' : ''}><td>{s.nome || 'Sem setor'}{setorInvalido(s.nome) && <small>Conferir destino</small>}</td><td>{s.quantidade}</td><td><input aria-label={`Destino de ${s.nome || 'Sem setor'}`} list="imp-setores" value={destinos[i] || ''} placeholder="Escolha ou digite o setor" onChange={e => setDestinos(ds => ds.map((d, j) => j === i ? e.target.value : d))}/></td></tr>)}</tbody></table></div>
          <div className="imp-summary" aria-live="polite"><h3>Como vai ficar</h3>{grupos.map(g => <div key={g.nome}><span>{g.nome}</span><strong>{g.quantidade}</strong></div>)}{pendentes > 0 && <div className="imp-pending"><span>Aguardando correção</span><strong>{pendentes}</strong></div>}<div className="imp-total"><span>Total de entrevistas</span><strong>{modelo.rows.length}</strong></div></div>
        </div>
        <div className="imp-footer"><p className="imp-muted">{pendentes ? `Defina o setor de ${pendentes} entrevista(s) para continuar.` : 'Distribuição conferida? Gere a pesquisa com estes setores.'}</p><button className="imp-primary" disabled={pendentes > 0 || !cidade.trim()} onClick={confirmar}>Confirmar e gerar pesquisa →</button></div>
      </>}
    </fieldset>
    {ocupado && <p role="status">Processando…</p>}
    {erro && <p role="alert" className="imp-error">{erro}</p>}
    {sucesso && <p role="status" className="imp-success">Pesquisa gerada com sucesso. Os setores e resultados foram conferidos.</p>}
    {pesquisaPronta && <ResultadoImportado pesquisa={pesquisaPronta}/>}
    {sucesso && <button className="imp-secondary" style={{ marginTop:16 }} onClick={() => { setSucesso(false); setPesquisaPronta(null); setModelo(null); setAbas([]); setArquivo(''); setDestinos([]); setCidade(''); setErro(''); }}>Importar outra pesquisa</button>}
  </section>;
}
