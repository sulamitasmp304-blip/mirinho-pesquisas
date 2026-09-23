import { dadosDaCapa, rotuloGrafico } from './capa.js';
const CORES_G = ["#00b4d8","#4a4e69","#f4a261","#2ec4b6","#e63946","#8338ec","#06d6a0","#ffb703"];
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const RODAPE = "A empresa Mirinho Tribuna não autoriza o contratante ou qualquer pessoa a levar este trabalho ao conhecimento público, seja qual for a forma, de acordo com a lei eleitoral.";

export const buildPdfHtml = (p, fmtD, edicoesCapa = {}) => {
  const paginas = [];
  const capa = dadosDaCapa(p, edicoesCapa);
  const simulando = Boolean(p.simulacao?.perguntas?.length);
  const aviso = simulando ? '<div class="simulacao-aviso">SIMULAÇÃO · Percentuais gerais ajustados manualmente. Resultados por setor preservados.</div>' : '';
  const rodape = simulando ? 'SIMULAÇÃO — Este relatório contém percentuais ajustados manualmente. ' + RODAPE : RODAPE;

  // CAPA
  paginas.push(`
    <div class="page capa">
      ${aviso}
      <div class="capa-titulo">TRIBUNA<br>PESQUISA<br>NA CIDADE:</div>
      <div class="cidade-title">${escapeHtml(capa.cidade.toUpperCase())}</div>
      <div class="data-title">Realizada em: ${escapeHtml(fmtD(capa.dataInicio))}${capa.dataFim&&capa.dataFim!==capa.dataInicio?` e ${escapeHtml(fmtD(capa.dataFim))}`:""} (${escapeHtml(capa.totalEntrevistas)} entrevistas)</div>
      ${p.bairros&&p.bairros.length>0?`
      <div class="capa-setores">
        ${p.bairros.map((b,i)=>`<div><b>Setor ${i+1}:</b> ${escapeHtml(b.nome)}</div>`).join("")}
      </div>`:"" }
    </div>
  `);

  // PÁGINAS DE PERGUNTAS

  const buildGrafico = (perg, r, titulo) => {
    if (!r) return `<p style="color:#aaa;text-align:center;margin:40px 0;">Sem resultados.</p>`;
    if (perg.tipo === "nota" && r?.media !== undefined) {
      const pct = r.media / 10;
      const radius = 70, circ = 2 * Math.PI * radius;
      const filled = circ * pct;
      return `
        <div style="text-align:center;margin:20px 0;">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;">${escapeHtml(titulo)}</div>
          <div style="position:relative;display:inline-block;">
            <svg width="180" height="180" style="transform:rotate(-90deg)">
              <circle cx="90" cy="90" r="${radius}" fill="none" stroke="#F1EFE8" stroke-width="22"/>
              <circle cx="90" cy="90" r="${radius}" fill="none" stroke="#1D9E75" stroke-width="22"
                stroke-dasharray="${filled} ${circ-filled}" stroke-linecap="round"/>
            </svg>
            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;">
              <div style="font-size:36px;font-weight:900;">${r.media}</div>
              <div style="font-size:12px;color:#999;">nota</div>
            </div>
          </div>
        </div>`;
    } else if (r?.votos) {
      const entries = Object.entries(r.votos).sort((a,b)=>b[1]-a[1]);
      const max = Math.max(...entries.map(e=>e[1]), 1);
      const bars = entries.map(([nome,pct],ci)=>`
        <div class="grafico-linha">
          <div class="grafico-rotulo">${escapeHtml(rotuloGrafico(nome))}</div>
          <div class="grafico-trilho">
            <div style="width:${(pct/max)*100}%;height:100%;background:${CORES_G[ci%CORES_G.length]};border-radius:4px;"></div>
          </div>
          <div class="grafico-percentual">${pct}%</div>
        </div>`).join("");
      return `<div style="margin:20px 0;"><div style="font-size:16px;font-weight:700;text-align:center;margin-bottom:16px;">${escapeHtml(titulo)}</div>${bars}</div>`;
    }
    return `<p style="color:#aaa;text-align:center;margin:40px 0;">Sem resultados.</p>`;
  };

  const porBairro = p.resultados?._por_bairro || {};

  // POR PERGUNTA: geral + todos os bairros juntos
  p.perguntas.forEach((perg, i) => {
    const key = String(perg.id !== undefined ? perg.id : i);
    const rGeral = p.resultados?.[key];

    // Página Geral da pergunta
    paginas.push(`
      <div class="page">
        ${aviso}
        <div class="pergunta-titulo">${i+1}- ${escapeHtml(perg.texto)}</div>
        ${buildGrafico(perg, rGeral, p.simulacao?.perguntas?.includes(key) ? "Geral — SIMULAÇÃO" : "Geral")}
        <div class="rodape">${rodape}</div>
      </div>
    `);

    // Páginas por bairro logo após o geral
    p.bairros.forEach(b => {
      const rBairro = porBairro[b.nome]?.[key];
      if (!rBairro) return;
      paginas.push(`
        <div class="page">
          ${aviso}
          <div class="pergunta-titulo">${i+1}- ${escapeHtml(perg.texto)}</div>
          ${buildGrafico(perg, rBairro, b.nome)}
          <div class="rodape">${rodape}</div>
        </div>
      `);
    });
  });

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:Arial,sans-serif;background:#fff;}
    .page{width:210mm;min-height:297mm;padding:30mm 25mm;position:relative;page-break-after:always;display:flex;flex-direction:column;}
    .capa{padding:12.7mm 12.7mm 12.7mm 15mm;text-align:center;align-items:stretch;justify-content:flex-start;}
    .capa-titulo{font-family:'Arial Black',Arial,sans-serif;font-size:65pt;font-weight:900;line-height:1.08;}
    .capa-setores{margin-top:44pt;text-align:left;font-size:16pt;line-height:1.35;overflow-wrap:anywhere;}
    .capa-setores>div{margin-bottom:4pt;break-inside:avoid;}
    .grafico-linha{display:grid;grid-template-columns:160px minmax(0,1fr) 50px;align-items:center;column-gap:12px;margin-bottom:12px;break-inside:avoid;}
    .grafico-rotulo{min-width:0;font-size:12px;text-align:right;font-weight:500;line-height:1.4;overflow-wrap:anywhere;word-break:normal;}
    .grafico-trilho{min-width:0;background:#F1EFE8;border-radius:4px;height:24px;overflow:hidden;}
    .grafico-percentual{font-size:12px;font-weight:600;white-space:nowrap;}
    .simulacao-aviso{font-size:9pt;color:#7a4d00;border:1px solid #b48b44;background:#fff8e8;padding:10px;margin-bottom:20px;width:100%;text-align:center;font-weight:700;}
    .cidade-title{font-family:'Arial Black',Arial,sans-serif;font-size:60pt;line-height:1.15;font-weight:900;color:#1F3864;overflow-wrap:anywhere;}
    .data-title{font-size:22pt;line-height:1.2;font-weight:700;margin-top:60pt;}
    .pergunta-titulo{font-size:14pt;font-weight:700;margin-bottom:20px;line-height:1.4;}
    .rodape{position:absolute;bottom:15mm;left:25mm;right:25mm;font-size:8pt;color:#aaa;text-align:center;font-style:italic;border-top:1px solid #eee;padding-top:8px;}
    svg{display:block !important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    circle{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    div[style*="background"]{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    @media print{
      @page{margin:0;}
      .page{page-break-after:always;}
      header,footer{display:none !important;}
    }
  </style>
  </head><body>${paginas.join("")}</body></html>`;
};

