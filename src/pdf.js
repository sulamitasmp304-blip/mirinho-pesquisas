const CORES_G = ["#00b4d8","#4a4e69","#f4a261","#2ec4b6","#e63946","#8338ec","#06d6a0","#ffb703"];
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export const RODAPE = "A empresa Mirinho Tribuna não autoriza o contratante ou qualquer pessoa a levar este trabalho ao conhecimento público, seja qual for a forma, de acordo com a lei eleitoral.";

export const buildPdfHtml = (p, fmtD) => {
  const paginas = [];
  const simulando = Boolean(p.simulacao?.perguntas?.length);
  const aviso = simulando ? '<div class="simulacao-aviso">SIMULAÇÃO · Percentuais gerais ajustados manualmente. Resultados por setor preservados.</div>' : '';
  const rodape = simulando ? 'SIMULAÇÃO — Este relatório contém percentuais ajustados manualmente. ' + RODAPE : RODAPE;

  // CAPA
  const LOGO_B64 = "data:image/png;base64,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";
  paginas.push(`
    <div class="page capa">
      ${aviso}
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px;">
        <img src="${LOGO_B64}" style="width:80px;height:80px;object-fit:contain;" alt="logo"/>
        <div>
          <div class="logo-title">MIRINHO TRIBUNA</div>
          <div style="font-size:10pt;color:#555;margin-top:2px;">Fone: (17) 997-777240</div>
          <div style="font-size:10pt;color:#555;">E-mail: mirinhotribuna@gmail.com</div>
        </div>
      </div>
      <div style="border-top:2px solid #000;margin:16px 0 40px;"></div>
      <div class="subtitulo">Pesquisas – Enquetes – Sondagens</div>
      <div class="cidade-title">${escapeHtml(p.cidade.toUpperCase())}</div>
      <div class="data-title">Realizada em: ${fmtD(p.dataInicio)}${p.dataFim&&p.dataFim!==p.dataInicio?` e ${fmtD(p.dataFim)}`:""}. (${p.totalEntrevistas} entrevistas)</div>
      ${p.bairros&&p.bairros.length>0?`
      <div style="margin-top:40px;text-align:center;">
        ${p.bairros.map((b,i)=>`<div style="font-size:11pt;margin-bottom:6px;"><b>Setor ${i+1}:</b> ${escapeHtml(b.nome)}</div>`).join("")}
      </div>`:"" }
      <div class="rodape">${rodape}</div>
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
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <div style="width:160px;font-size:12px;text-align:right;font-weight:500;">${escapeHtml(nome)}</div>
          <div style="flex:1;background:#F1EFE8;border-radius:4px;height:24px;overflow:hidden;">
            <div style="width:${(pct/max)*100}%;height:100%;background:${CORES_G[ci%CORES_G.length]};border-radius:4px;"></div>
          </div>
          <div style="width:50px;font-size:12px;font-weight:600;">${pct}%</div>
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
    .capa{align-items:center;justify-content:center;text-align:center;}
    .simulacao-aviso{font-size:9pt;color:#7a4d00;border:1px solid #b48b44;background:#fff8e8;padding:10px;margin-bottom:20px;width:100%;text-align:center;font-weight:700;}
    .logo-title{font-size:28pt;font-weight:900;letter-spacing:2px;color:#003399;text-decoration:underline;margin-bottom:4px;}
    .subtitulo{font-size:13pt;color:#333;margin-bottom:60px;font-weight:500;}
    .cidade-title{font-size:72pt;font-weight:900;margin:20px 0;color:#000;}
    .data-title{font-size:14pt;font-weight:700;margin-top:30px;}
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

