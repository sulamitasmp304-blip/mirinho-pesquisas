import { useState, useEffect, useCallback } from "react";

// ─── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SB_URL = "https://jcsxcovhvpyciybexlho.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impjc3hjb3ZodnB5Y2l5YmV4bGhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4ODM0MzIsImV4cCI6MjA5NTQ1OTQzMn0.K6VFYa8PQLp9Ym0F5t7eJoaO7dxNTthu2sU17ObvkEU";

const sbHeaders = {
  "apikey": SB_KEY,
  "Authorization": `Bearer ${SB_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

const sb = {
  get: async (table, params="") => {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?${params}`, { headers: sbHeaders });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  post: async (table, body) => {
    const r = await fetch(`${SB_URL}/rest/v1/${table}`, { method:"POST", headers: sbHeaders, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  patch: async (table, id, body) => {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, { method:"PATCH", headers: sbHeaders, body: JSON.stringify(body) });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  },
  delete: async (table, id) => {
    const r = await fetch(`${SB_URL}/rest/v1/${table}?id=eq.${id}`, { method:"DELETE", headers: sbHeaders });
    if (!r.ok) throw new Error(await r.text());
  },
};

const USERS_INIT = [
  { id: 1, nome: "Admin", login: "admin", senha: "admin123", role: "admin" },
];
const CORES_AVATAR = [
  { bg: "#E1F5EE", cor: "#0F6E56" }, { bg: "#E6F1FB", cor: "#185FA5" },
  { bg: "#FAEEDA", cor: "#854F0B" }, { bg: "#FBEAF0", cor: "#993556" },
  { bg: "#EAF3DE", cor: "#3B6D11" }, { bg: "#F3E6FB", cor: "#6B21A8" },
];
const CORES_G = ["#00b4d8","#4a4e69","#f4a261","#2ec4b6","#e63946","#8338ec","#06d6a0","#ffb703"];
const MACROS = [
  { label:"Nota Prefeito", q:{ texto:"Que nota de 0 a 10 você dá para o trabalho do Prefeito?", tipo:"nota", opcoes:[] } },
  { label:"Nota Saúde", q:{ texto:"Que nota de 0 a 10 você dá para o trabalho da Saúde?", tipo:"nota", opcoes:[] } },
  { label:"Nota Educação", q:{ texto:"Que nota de 0 a 10 você dá para o trabalho da Educação?", tipo:"nota", opcoes:[] } },
  { label:"Nota Segurança", q:{ texto:"Que nota de 0 a 10 você dá para o trabalho da Segurança?", tipo:"nota", opcoes:[] } },

];

const ini = (n) => n.trim().split(" ").filter(Boolean).map(p=>p[0]).slice(0,2).join("").toUpperCase();
const fmtD = (d) => d ? new Date(d+"T12:00:00").toLocaleDateString("pt-BR") : "—";

const Av = ({ nome, bg="#E1F5EE", cor="#0F6E56", size=32 }) => (
  <div style={{ width:size, height:size, borderRadius:"50%", background:bg, color:cor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:size*0.35, fontWeight:600, flexShrink:0 }}>{ini(nome)}</div>
);
const Tag = ({ children, color="green" }) => {
  const p={green:{bg:"#E1F5EE",c:"#0F6E56"},blue:{bg:"#E6F1FB",c:"#185FA5"},amber:{bg:"#FAEEDA",c:"#854F0B"},gray:{bg:"#F1EFE8",c:"#5F5E5A"},purple:{bg:"#F3E6FB",c:"#6B21A8"}}[color]||{bg:"#F1EFE8",c:"#5F5E5A"};
  return <span style={{ display:"inline-flex", alignItems:"center", fontSize:11, padding:"2px 8px", borderRadius:99, background:p.bg, color:p.c, fontWeight:500, whiteSpace:"nowrap" }}>{children}</span>;
};
const PBar = ({ value, max, color="#1D9E75", height=5 }) => {
  const pct = max>0?Math.min(100,(value/max)*100):0;
  return <div style={{ background:"#F1EFE8", borderRadius:99, height, overflow:"hidden", minWidth:40 }}><div style={{ width:`${pct}%`, height:"100%", background:color, borderRadius:99 }}/></div>;
};
const Card = ({ children, style={}, onClick }) => <div onClick={onClick} style={{ background:"#fff", border:"1px solid #E8E6DF", borderRadius:12, padding:"16px 20px", marginBottom:12, ...style }}>{children}</div>;
const ST = ({ children }) => <div style={{ fontSize:11, fontWeight:600, color:"#9B9890", textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:10 }}>{children}</div>;
const Btn = ({ children, onClick, v="primary", style={}, disabled=false }) => {
  const vs={primary:{background:"#1a1a1a",color:"#fff"},secondary:{background:"transparent",color:"#666",border:"1px solid #DDD"},green:{background:"#1D9E75",color:"#fff"},blue:{background:"#185FA5",color:"#fff"}}[v]||{};
  return <button onClick={disabled?undefined:onClick} style={{ padding:"8px 18px", borderRadius:8, fontSize:13, fontWeight:500, cursor:disabled?"not-allowed":"pointer", border:"none", opacity:disabled?0.5:1, fontFamily:"inherit", ...vs, ...style }}>{children}</button>;
};
const FI = ({ label, value, onChange, type="text", placeholder="" }) => (
  <div style={{ marginBottom:14 }}>
    {label&&<div style={{ fontSize:12, fontWeight:500, color:"#666", marginBottom:5 }}>{label}</div>}
    <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{ width:"100%", fontSize:13, padding:"8px 10px", border:"1px solid #DDD", borderRadius:8, boxSizing:"border-box", fontFamily:"inherit" }}/>
  </div>
);

const GRosca = ({ nota }) => {
  const r=36, c=2*Math.PI*r, f=c*(nota/10);
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:"16px 0", position:"relative" }}>
      <svg width={100} height={100} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={50} cy={50} r={r} fill="none" stroke="#F1EFE8" strokeWidth={12}/>
        <circle cx={50} cy={50} r={r} fill="none" stroke="#1D9E75" strokeWidth={12} strokeDasharray={`${f} ${c-f}`} strokeLinecap="round"/>
      </svg>
      <div style={{ position:"absolute", textAlign:"center" }}>
        <div style={{ fontSize:22, fontWeight:700 }}>{nota}</div>
        <div style={{ fontSize:10, color:"#999" }}>nota</div>
      </div>
    </div>
  );
};
const GBarras = ({ dados }) => {
  const entries = Object.entries(dados).sort((a,b)=>b[1]-a[1]);
  const max = Math.max(...entries.map(e=>e[1]),1);
  return (
    <div style={{ padding:"8px 0" }}>
      {entries.map(([nome,pct],i)=>(
        <div key={nome} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
          <div style={{ width:130, fontSize:11, color:"#555", textAlign:"right", flexShrink:0 }}>{nome}</div>
          <div style={{ flex:1, background:"#F1EFE8", borderRadius:4, height:20, overflow:"hidden" }}>
            <div style={{ width:`${(pct/max)*100}%`, height:"100%", background:CORES_G[i%CORES_G.length], borderRadius:4 }}/>
          </div>
          <div style={{ width:42, fontSize:11, color:"#555", flexShrink:0 }}>{pct}%</div>
        </div>
      ))}
    </div>
  );
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
const Login = ({ onLogin }) => {
  const [l,setL]=useState(""); const [s,setS]=useState(""); const [err,setErr]=useState(""); const [loading,setLoading]=useState(false);
  const go = async () => {
    setLoading(true); setErr("");
    try {
      const users = await sb.get("usuarios", `login=eq.${encodeURIComponent(l.trim())}&senha=eq.${encodeURIComponent(s)}&limit=1`);
      if(users.length>0) {
        const u = users[0];
        onLogin({ id:u.id, nome:u.nome, login:u.login, role:u.role, avatar:{ bg:u.avatar_bg, cor:u.avatar_cor } });
      } else {
        setErr("Login ou senha incorretos.");
      }
    } catch(e) {
      // fallback local se Supabase falhar
      const u = USERS_INIT.find(u=>u.login===l.trim()&&u.senha===s);
      if(u) onLogin(u); else setErr("Login ou senha incorretos.");
    }
    setLoading(false);
  };
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#0f2027,#203a43,#2c5364)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"Georgia,serif" }}>
      <div style={{ background:"#fff", borderRadius:16, padding:36, width:"100%", maxWidth:360, boxShadow:"0 24px 80px rgba(0,0,0,0.3)" }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <div style={{ background:"#fff", display:"inline-block", padding:8, borderRadius:12, marginBottom:12, boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}>
            <img src="data:image/png;base64,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" style={{ width:64, height:64, objectFit:"contain", margin:"0 auto 12px", display:"block", background:"transparent" }} alt="logo"/>
          </div>
          <div style={{ fontSize:20, fontWeight:700 }}>Mirinho Tribuna</div>
          <div style={{ fontSize:12, color:"#999", marginTop:4 }}>Sistema de pesquisas políticas</div>
        </div>
        <FI label="Login" value={l} onChange={setL} placeholder="seu usuário"/>
        <FI label="Senha" value={s} onChange={setS} type="password" placeholder="••••••"/>
        {err&&<div style={{ fontSize:12, color:"#A32D2D", marginBottom:10, textAlign:"center" }}>{err}</div>}
        <button onClick={go} disabled={loading} style={{ width:"100%", padding:10, background:"#1a1a1a", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:500, cursor:loading?"not-allowed":"pointer", fontFamily:"inherit", opacity:loading?0.7:1 }}>{loading?"Entrando...":"Entrar"}</button>
        
      </div>
    </div>
  );
};

// ─── FORM PESQUISA (criar + editar) ──────────────────────────────────────────
const FormPesquisa = ({ inicial, users, onSalvar, onCancelar }) => {
  const isEdit = !!inicial?.id;
  const [step,setStep]=useState(1);
  const [d,setD]=useState(inicial||{ cidade:"", dataInicio:"", dataFim:"", totalEntrevistas:"", bairros:[{nome:"",cota:""}], perguntas:[], entrevistadoras:[], status:"agendada", resultados:{} });
  const [showMacros,setShowMacros]=useState(false);
  const upd = (ch) => setD(x=>({...x,...ch}));

  // Step 1
  const S1 = () => (
    <Card>
      <FI label="Cidade" value={d.cidade} onChange={v=>upd({cidade:v})} placeholder="Ex: Tanabi"/>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <FI label="Data início" value={d.dataInicio} onChange={v=>upd({dataInicio:v})} type="date"/>
        <FI label="Data fim" value={d.dataFim} onChange={v=>upd({dataFim:v})} type="date"/>
      </div>
      <FI label="Total de entrevistas" value={d.totalEntrevistas} onChange={v=>upd({totalEntrevistas:v})} type="number" placeholder="200"/>
      <div style={{ display:"flex", justifyContent:"flex-end" }}><Btn onClick={()=>setStep(2)}>Próximo →</Btn></div>
    </Card>
  );

  // Step 2
  const S2 = () => {
    const total=Number(d.totalEntrevistas)||0;
    const dist=d.bairros.reduce((a,b)=>a+Number(b.cota||0),0);
    const rest=total-dist; const ok=rest===0; const ac=rest<0;
    return (
      <Card>
        <div style={{ background:ac?"#FBEAE8":ok?"#E1F5EE":"#F7F5EF", border:`1px solid ${ac?"#F09595":ok?"#A8DFC8":"#E8E6DF"}`, borderRadius:10, padding:"12px 16px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:11, color:ac?"#A32D2D":ok?"#0F6E56":"#888", fontWeight:600, marginBottom:2 }}>{ok?"✓ Todas distribuídas!":ac?"⚠ Passou do total!":"Entrevistas para distribuir"}</div>
            <div style={{ fontSize:12, color:"#666" }}>{dist} de {total} distribuídas</div>
          </div>
          <div style={{ fontSize:28, fontWeight:700, color:ac?"#A32D2D":ok?"#1D9E75":"#1a1a1a", textAlign:"center" }}>
            {ac?`+${Math.abs(rest)}`:rest}
            <div style={{ fontSize:11, fontWeight:400, color:"#aaa" }}>{ok?"pronto":ac?"a mais":"faltando"}</div>
          </div>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 28px", gap:8, marginBottom:6 }}>
          {["Bairro","Entrevistas",""].map(h=><span key={h} style={{ fontSize:11, color:"#aaa" }}>{h}</span>)}
        </div>
        {d.bairros.map((b,i)=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 90px 28px", gap:8, marginBottom:6, alignItems:"center" }}>
            <input value={b.nome} onChange={e=>{const bs=[...d.bairros];bs[i]={...bs[i],nome:e.target.value};upd({bairros:bs});}} placeholder="Nome do bairro" style={{ fontSize:13, padding:"8px 10px", border:"1px solid #DDD", borderRadius:8, fontFamily:"inherit" }}/>
            <input type="number" value={b.cota} onChange={e=>{const bs=[...d.bairros];bs[i]={...bs[i],cota:e.target.value};upd({bairros:bs});}} placeholder="Qtd" style={{ fontSize:13, padding:"8px 10px", border:"1px solid #DDD", borderRadius:8 }}/>
            <button onClick={()=>{if(d.bairros.length>1)upd({bairros:d.bairros.filter((_,j)=>j!==i)});}} style={{ width:28, height:28, border:"1px solid #DDD", borderRadius:6, background:"transparent", cursor:"pointer", fontSize:14, color:"#aaa" }}>×</button>
          </div>
        ))}
        <button onClick={()=>upd({bairros:[...d.bairros,{nome:"",cota:""}]})} style={{ width:"100%", padding:8, border:"1px dashed #DDD", borderRadius:8, background:"transparent", fontSize:12, color:"#888", cursor:"pointer", marginBottom:12, fontFamily:"inherit" }}>+ Adicionar bairro</button>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <Btn v="secondary" onClick={()=>setStep(1)}>← Voltar</Btn>
          <Btn onClick={()=>setStep(3)} disabled={ac}>Próximo →</Btn>
        </div>
      </Card>
    );
  };

  // Step 3
  const S3 = () => {
    const updQ=(i,ch)=>{const qs=[...d.perguntas];qs[i]={...qs[i],...ch};upd({perguntas:qs});};
    const addOp=(i)=>updQ(i,{opcoes:[...(d.perguntas[i].opcoes||[]),""]});
    const updOp=(i,oi,val)=>{const ops=[...(d.perguntas[i].opcoes||[])];ops[oi]=val;updQ(i,{opcoes:ops});};
    const delOp=(i,oi)=>updQ(i,{opcoes:(d.perguntas[i].opcoes||[]).filter((_,j)=>j!==oi)});
    const delQ=(i)=>upd({perguntas:d.perguntas.filter((_,j)=>j!==i)});
    const addQ=(q)=>upd({perguntas:[...d.perguntas,{...q}]});
    const tipoCor={nota:"#E6F1FB",multipla:"#FAEEDA",aberta:"#E1F5EE",confronto:"#F3E6FB"};
    return (
      <Card>
        {/* Macros */}
        <button onClick={()=>setShowMacros(v=>!v)} style={{ width:"100%", padding:"10px 14px", background:"#F0FBF6", border:"1px solid #A8DFC8", borderRadius:10, fontSize:13, color:"#0F6E56", cursor:"pointer", fontWeight:600, textAlign:"left", fontFamily:"inherit", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:showMacros?0:14 }}>
          <span>⚡ Inserir pergunta pré-definida</span><span>{showMacros?"▲":"▼"}</span>
        </button>
        {showMacros&&(
          <div style={{ border:"1px solid #A8DFC8", borderTop:"none", borderRadius:"0 0 10px 10px", background:"#fff", padding:8, marginBottom:14 }}>
            {MACROS.map((m,i)=>(
              <button key={i} onClick={()=>{addQ({...m.q});setShowMacros(false);}} style={{ display:"block", width:"100%", textAlign:"left", padding:"9px 12px", background:"transparent", border:"none", borderRadius:8, fontSize:13, cursor:"pointer", fontFamily:"inherit", borderBottom:"1px solid #F1EFE8" }}>
                <span style={{ fontSize:12, color:"#aaa", marginRight:8 }}>{m.q.tipo==="nota"?"🔢":m.q.tipo==="confronto"?"⚔️":m.q.tipo==="aberta"?"✏️":"☑️"}</span>{m.label}
              </button>
            ))}
          </div>
        )}
        <ST>Perguntas do formulário</ST>
        {d.perguntas.length===0&&<div style={{ fontSize:13, color:"#aaa", textAlign:"center", padding:"16px 0" }}>Nenhuma pergunta. Use as pré-definidas ou crie abaixo.</div>}
        {d.perguntas.map((p,i)=>(
          <div key={i} style={{ background:"#F7F5EF", borderRadius:10, padding:12, marginBottom:10, border:"1px solid #E8E6DF" }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <div style={{ width:24, height:24, borderRadius:"50%", background:"#1a1a1a", color:"#fff", fontSize:11, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, flexShrink:0 }}>{i+1}</div>
              <select value={p.tipo} onChange={e=>updQ(i,{tipo:e.target.value,opcoes:[]})} style={{ fontSize:12, padding:"5px 8px", border:"1px solid #DDD", borderRadius:6, background:tipoCor[p.tipo]||"#fff", fontFamily:"inherit" }}>
                <option value="nota">🔢 Nota 0–10</option>
                <option value="multipla">☑️ Múltipla escolha</option>
                <option value="aberta">✏️ Aberta</option>
                <option value="confronto">⚔️ Confronto</option>
              </select>
              <button onClick={()=>delQ(i)} style={{ width:28, height:28, border:"1px solid #DDD", borderRadius:6, background:"#fff", cursor:"pointer", fontSize:15, color:"#aaa", marginLeft:"auto" }}>×</button>
            </div>
            <input value={p.texto} onChange={e=>updQ(i,{texto:e.target.value})} placeholder="Texto da pergunta..." style={{ width:"100%", fontSize:13, padding:"9px 10px", border:"1px solid #DDD", borderRadius:8, boxSizing:"border-box", marginBottom:8, fontFamily:"inherit" }}/>
            {p.tipo==="nota"&&<div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>{[0,1,2,3,4,5,6,7,8,9,10].map(n=><div key={n} style={{ width:30, height:30, borderRadius:6, border:"1px solid #DDD", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, color:"#aaa" }}>{n}</div>)}</div>}
            {p.tipo==="aberta"&&<div style={{ fontSize:12, color:"#aaa", padding:"8px 10px", background:"#fff", border:"1px dashed #DDD", borderRadius:8 }}>A entrevistadora digita livremente.</div>}
            {p.tipo==="multipla"&&(
              <div>
                {(p.opcoes||[]).map((op,oi)=>(
                  <div key={oi} style={{ display:"flex", gap:6, marginBottom:6, alignItems:"center" }}>
                    <div style={{ width:20, height:20, borderRadius:4, border:"2px solid #DDD", flexShrink:0 }}/>
                    <input value={op} onChange={e=>updOp(i,oi,e.target.value)} placeholder={`Opção ${oi+1}`} style={{ flex:1, fontSize:13, padding:"8px 10px", border:"1px solid #DDD", borderRadius:8, fontFamily:"inherit" }}/>
                    <button onClick={()=>delOp(i,oi)} style={{ width:28, height:28, border:"1px solid #DDD", borderRadius:6, background:"#fff", cursor:"pointer", fontSize:14, color:"#aaa", flexShrink:0 }}>×</button>
                  </div>
                ))}
                <div style={{ display:"flex", gap:6, alignItems:"center", opacity:0.5, marginBottom:6 }}>
                  <div style={{ width:20, height:20, borderRadius:4, border:"2px solid #DDD", flexShrink:0 }}/>
                  <div style={{ flex:1, fontSize:13, padding:"8px 10px", border:"1px dashed #DDD", borderRadius:8, color:"#aaa" }}>B/NU/IND (automático)</div>
                </div>
                <button onClick={()=>addOp(i)} style={{ width:"100%", padding:10, border:"1px dashed #1D9E75", borderRadius:8, background:"#F0FBF6", fontSize:13, color:"#1D9E75", cursor:"pointer", fontWeight:500, fontFamily:"inherit" }}>+ Adicionar opção</button>
              </div>
            )}
            {p.tipo==="confronto"&&(
              <div>
                <div style={{ fontSize:11, color:"#888", marginBottom:8 }}>Cada linha = um par (Chapa A × Chapa B)</div>
                {(p.opcoes||[]).map((op,oi)=>(
                  <div key={oi} style={{ display:"flex", gap:6, marginBottom:6, alignItems:"center" }}>
                    <div style={{ flex:1, display:"flex", alignItems:"center", background:"#fff", border:"1px solid #DDD", borderRadius:8, padding:"4px 8px", gap:4 }}>
                      <input value={op.split(" x ")[0]||""} onChange={e=>updOp(i,oi,`${e.target.value} x ${op.split(" x ")[1]||""}`)} placeholder="Chapa A" style={{ flex:1, fontSize:12, border:"none", outline:"none", fontFamily:"inherit" }}/>
                      <span style={{ color:"#aaa", fontWeight:700, padding:"0 4px" }}>×</span>
                      <input value={op.split(" x ")[1]||""} onChange={e=>updOp(i,oi,`${op.split(" x ")[0]||""} x ${e.target.value}`)} placeholder="Chapa B" style={{ flex:1, fontSize:12, border:"none", outline:"none", fontFamily:"inherit" }}/>
                    </div>
                    <button onClick={()=>delOp(i,oi)} style={{ width:28, height:28, border:"1px solid #DDD", borderRadius:6, background:"#fff", cursor:"pointer", fontSize:14, color:"#aaa", flexShrink:0 }}>×</button>
                  </div>
                ))}
                <div style={{ fontSize:13, padding:8, border:"1px dashed #DDD", borderRadius:8, color:"#aaa", opacity:0.5, marginBottom:6 }}>B/NU/IND (automático)</div>
                <button onClick={()=>addOp(i)} style={{ width:"100%", padding:10, border:"1px dashed #8338ec", borderRadius:8, background:"#F9F0FF", fontSize:13, color:"#8338ec", cursor:"pointer", fontWeight:500, fontFamily:"inherit" }}>+ Adicionar par de candidatos</button>
              </div>
            )}
          </div>
        ))}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginTop:4 }}>
          {[["nota","🔢 Nota 0–10"],["multipla","☑️ Múltipla escolha"],["aberta","✏️ Aberta"],["confronto","⚔️ Confronto"]].map(([tipo,label])=>(
            <button key={tipo} onClick={()=>addQ({texto:"",tipo,opcoes:[]})} style={{ padding:10, border:"1px dashed #DDD", borderRadius:8, background:"transparent", fontSize:12, color:"#888", cursor:"pointer", fontFamily:"inherit" }}>+ {label}</button>
          ))}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:14 }}>
          <Btn v="secondary" onClick={()=>setStep(2)}>← Voltar</Btn>
          <Btn onClick={()=>setStep(4)}>Próximo →</Btn>
        </div>
      </Card>
    );
  };

  // Step 4
  const S4 = () => {
    const toggle=(uid)=>{
      const tem=d.entrevistadoras.find(e=>e.userId===uid);
      if(tem) upd({entrevistadoras:d.entrevistadoras.filter(e=>e.userId!==uid)});
      else upd({entrevistadoras:[...d.entrevistadoras,{userId:uid,bairros:[]}]});
    };
    const togB=(uid,bi)=>{
      upd({entrevistadoras:d.entrevistadoras.map(e=>{
        if(e.userId!==uid) return e;
        const tem=e.bairros.find(b=>b.idx===bi);
        return {...e,bairros:tem?e.bairros.filter(b=>b.idx!==bi):[...e.bairros,{idx:bi,qtd:""}]};
      })});
    };
    const setQ=(uid,bi,qtd)=>{
      upd({entrevistadoras:d.entrevistadoras.map(e=>e.userId!==uid?e:{...e,bairros:e.bairros.map(b=>b.idx===bi?{...b,qtd}:b)})});
    };
    const evs=users.filter(u=>u.role==="entrevistadora");
    return (
      <Card>
        <ST>Entrevistadoras</ST>
        <div style={{ fontSize:12, color:"#888", marginBottom:14 }}>Selecione quem vai trabalhar. Marque os bairros de cada uma e opcionalmente a quantidade.</div>
        {evs.length===0&&<div style={{ fontSize:13, color:"#aaa", textAlign:"center", padding:"20px 0" }}>Nenhuma entrevistadora cadastrada. Vá em Equipe para adicionar.</div>}
        {evs.map(u=>{
          const ev=d.entrevistadoras.find(e=>e.userId===u.id); const sel=!!ev;
          return (
            <div key={u.id} style={{ marginBottom:10, border:"1px solid #E8E6DF", borderRadius:10, overflow:"hidden" }}>
              <div onClick={()=>toggle(u.id)} style={{ display:"flex", alignItems:"center", gap:10, padding:12, background:sel?"#F0FBF6":"#F7F5EF", cursor:"pointer" }}>
                <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${sel?"#1D9E75":"#DDD"}`, background:sel?"#1D9E75":"transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  {sel&&<span style={{ color:"#fff", fontSize:13, fontWeight:700 }}>✓</span>}
                </div>
                <Av nome={u.nome} bg={u.avatar?.bg} cor={u.avatar?.cor} size={30}/>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{u.nome}</div>
                  {sel&&ev.bairros.length>0&&<div style={{ fontSize:11, color:"#1D9E75" }}>{ev.bairros.map(b=>d.bairros[b.idx]?.nome||`B${b.idx+1}`).join(", ")}</div>}
                </div>
                {sel&&<span style={{ fontSize:12, color:"#1D9E75" }}>▼</span>}
              </div>
              {sel&&(
                <div style={{ padding:"10px 12px", background:"#fff", borderTop:"1px solid #E8E6DF" }}>
                  <div style={{ fontSize:11, color:"#888", marginBottom:8 }}>Bairros (quantidade é opcional):</div>
                  {d.bairros.map((b,bi)=>{
                    const ba=ev.bairros.find(x=>x.idx===bi); const marc=!!ba;
                    return (
                      <div key={bi} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <div onClick={()=>togB(u.id,bi)} style={{ width:20, height:20, borderRadius:4, border:`2px solid ${marc?"#185FA5":"#DDD"}`, background:marc?"#185FA5":"transparent", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                          {marc&&<span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>✓</span>}
                        </div>
                        <span style={{ fontSize:13, flex:1 }}>{b.nome||`Bairro ${bi+1}`}</span>
                        <span style={{ fontSize:11, color:"#aaa" }}>cota:{b.cota||"?"}</span>
                        {marc&&<input type="number" value={ba.qtd} onChange={e=>setQ(u.id,bi,e.target.value)} placeholder="Qtd (opcional)" style={{ width:110, fontSize:12, padding:"5px 8px", border:"1px solid #DDD", borderRadius:6, fontFamily:"inherit" }}/>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:14 }}>
          <Btn v="secondary" onClick={()=>setStep(3)}>← Voltar</Btn>
          <Btn v="green" onClick={()=>onSalvar(d)}>✓ {isEdit?"Salvar alterações":"Criar pesquisa"}</Btn>
        </div>
      </Card>
    );
  };

  const steps=["Dados gerais","Bairros","Perguntas","Entrevistadoras"];
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <Btn v="secondary" onClick={onCancelar}>← Cancelar</Btn>
        <div style={{ fontSize:16, fontWeight:600 }}>{isEdit?"Editar pesquisa":"Nova pesquisa"}</div>
      </div>
      <div style={{ display:"flex", gap:0, marginBottom:16, border:"1px solid #E8E6DF", borderRadius:10, overflow:"hidden" }}>
        {steps.map((s,i)=>(
          <div key={s} onClick={()=>setStep(i+1)} style={{ flex:1, padding:"9px 4px", textAlign:"center", fontSize:11, cursor:"pointer", background:step===i+1?"#1a1a1a":step>i+1?"#E1F5EE":"#F7F5EF", color:step===i+1?"#fff":step>i+1?"#0F6E56":"#888", borderRight:i<3?"1px solid #E8E6DF":"none", fontWeight:step===i+1?600:400 }}>
            {step>i+1?"✓ ":""}{s}
          </div>
        ))}
      </div>
      {step===1&&S1()}{step===2&&S2()}{step===3&&S3()}{step===4&&S4()}
    </div>
  );
};

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
const Dashboard = ({ pesquisas, users }) => {
  const totalF=pesquisas.reduce((a,p)=>a+p.bairros.reduce((b,x)=>b+(x.feitas||0),0),0);
  const totalC=pesquisas.reduce((a,p)=>a+p.bairros.reduce((b,x)=>b+Number(x.cota||0),0),0);
  return (
    <div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:16 }}>
        {[
          {l:"Pesquisas ativas",v:pesquisas.filter(p=>p.status==="em_andamento").length,s:"em campo"},
          {l:"Entrevistas feitas",v:totalF,s:`de ${totalC}`},
          {l:"Equipe",v:users.filter(u=>u.role==="entrevistadora").length,s:"entrevistadoras"},
          {l:"Concluídas",v:pesquisas.filter(p=>p.status==="concluida").length,s:"este período"},
        ].map(m=>(
          <div key={m.l} style={{ background:"#F7F5EF", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, color:"#888", marginBottom:4 }}>{m.l}</div>
            <div style={{ fontSize:26, fontWeight:600 }}>{m.v}</div>
            <div style={{ fontSize:11, color:"#aaa" }}>{m.s}</div>
          </div>
        ))}
      </div>
      {pesquisas.length===0&&<Card><div style={{ textAlign:"center", color:"#aaa", fontSize:13, padding:"20px 0" }}>Nenhuma pesquisa cadastrada ainda.</div></Card>}
      {pesquisas.map(p=>{
        const feitas=p.bairros.reduce((a,b)=>a+(b.feitas||0),0);
        const pct=Number(p.totalEntrevistas)>0?Math.round((feitas/Number(p.totalEntrevistas))*100):0;
        const sc=p.status==="concluida"?"green":p.status==="em_andamento"?"blue":"gray";
        return (
          <Card key={p.id}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <div>
                <div style={{ fontSize:15, fontWeight:600 }}>{p.cidade}</div>
                <div style={{ fontSize:11, color:"#888" }}>{feitas} de {p.totalEntrevistas} · {pct}%</div>
              </div>
              <Tag color={sc}>{p.status==="concluida"?"Concluída":p.status==="em_andamento"?"Em andamento":"Agendada"}</Tag>
            </div>
            <PBar value={feitas} max={Number(p.totalEntrevistas)} color={p.status==="concluida"?"#1D9E75":"#185FA5"} height={7}/>
            <div style={{ marginTop:12 }}>
              <div style={{ fontSize:11, color:"#aaa", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.05em" }}>Por setor</div>
              {p.bairros.map((b,bi)=>{
                const evsAqui=(p.entrevistadoras||[]).filter(e=>e.bairros&&e.bairros.some(x=>x.idx===bi));
                return (
                  <div key={bi} style={{ marginBottom:8, padding:"8px 10px", background:"#F7F5EF", borderRadius:8 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                      <span style={{ fontSize:12, fontWeight:500, flex:1 }}>{b.nome}</span>
                      <span style={{ fontSize:11, color:"#888" }}>{b.feitas||0}/{b.cota}</span>
                      {(b.feitas||0)>=Number(b.cota)?<Tag color="green">✓ Concluído</Tag>:<Tag color="blue">{Number(b.cota)-(b.feitas||0)} faltando</Tag>}
                    </div>
                    <PBar value={b.feitas||0} max={Number(b.cota)} color={(b.feitas||0)>=Number(b.cota)?"#1D9E75":"#185FA5"} height={4}/>
                    {evsAqui.length>0&&(
                      <div style={{ display:"flex", gap:6, marginTop:6, flexWrap:"wrap" }}>
                        {evsAqui.map(ev=>{
                          const u=users.find(x=>x.id===ev.userId); if(!u) return null;
                          const qtd=ev.bairros.find(x=>x.idx===bi)?.qtd;
                          return (
                            <div key={ev.userId} style={{ display:"flex", alignItems:"center", gap:4, background:"#fff", borderRadius:20, padding:"3px 8px", fontSize:11 }}>
                              <Av nome={u.nome} bg={u.avatar?.bg} cor={u.avatar?.cor} size={16}/>
                              <span>{u.nome.split(" ")[0]}</span>
                              {qtd&&<span style={{ color:"#aaa" }}>· {qtd}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ─── PESQUISAS ────────────────────────────────────────────────────────────────
const Pesquisas = ({ pesquisas, setPesquisas, users, onNova, onEditar }) => {
  const [det,setDet]=useState(null);
  const [editRes,setEditRes]=useState(null);
  if(editRes) return <EditRes pesquisa={editRes} setPesquisas={setPesquisas} pesquisas={pesquisas} onBack={()=>setEditRes(null)}/>;
  if(det) {
    const p=pesquisas.find(x=>x.id===det); if(!p){setDet(null);return null;}
    const feitas=p.bairros.reduce((a,b)=>a+(b.feitas||0),0);
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16, flexWrap:"wrap" }}>
          <Btn v="secondary" onClick={()=>setDet(null)}>← Voltar</Btn>
          <div style={{ fontSize:16, fontWeight:600, flex:1 }}>{p.cidade}</div>
          <Btn v="secondary" onClick={()=>onEditar(p)}>✏ Editar</Btn>
          {p.status==="concluida"&&<Btn v="green" onClick={()=>setEditRes(p)}>Ver resultados</Btn>}
          {p.status!=="cancelada"&&p.status!=="concluida"&&(
            <Btn v="danger" onClick={async()=>{
              if(!window.confirm("Cancelar esta pesquisa?")) return;
              await sb.patch("pesquisas",p.id,{status:"cancelada"});
              setPesquisas(ps=>ps.map(x=>x.id===p.id?{...x,status:"cancelada"}:x));
              setDet(null);
            }}>✕ Cancelar</Btn>
          )}
          {p.status==="concluida"&&(
            <Btn v="danger" onClick={async()=>{
              if(!window.confirm(`Excluir permanentemente a pesquisa de ${p.cidade}? Isso libera espaço no banco mas não pode ser desfeito.`)) return;
              await sb.delete("pesquisas", p.id);
              setPesquisas(ps=>ps.filter(x=>x.id!==p.id));
              setDet(null);
            }}>🗑 Excluir</Btn>
          )}
        </div>
        <Card>
          <ST>Informações</ST>
          <div style={{ fontSize:13 }}><b>Período:</b> {fmtD(p.dataInicio)} a {fmtD(p.dataFim)}</div>
          <div style={{ fontSize:13, marginTop:4 }}><b>Progresso:</b> {feitas}/{p.totalEntrevistas}</div>
          <div style={{ fontSize:13, marginTop:4 }}><b>Status:</b> {p.status}</div>
        </Card>
        <Card>
          <ST>Bairros</ST>
          {p.bairros.map((b,i)=>(
            <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #F1EFE8" }}>
              <div style={{ flex:1, fontSize:13, fontWeight:500 }}>{b.nome}</div>
              <PBar value={b.feitas||0} max={Number(b.cota)}/>
              <span style={{ fontSize:12, color:"#666", width:55, textAlign:"right" }}>{b.feitas||0}/{b.cota}</span>
            </div>
          ))}
        </Card>
        <Card>
          <ST>Perguntas ({p.perguntas.length})</ST>
          {p.perguntas.map((q,i)=>(
            <div key={i} style={{ padding:"7px 0", borderBottom:"1px solid #F1EFE8", fontSize:13, display:"flex", gap:8, alignItems:"center" }}>
              <span style={{ color:"#aaa" }}>{i+1}.</span>
              <span style={{ flex:1 }}>{q.texto||<span style={{ color:"#aaa" }}>sem texto</span>}</span>
              <Tag color={q.tipo==="nota"?"blue":q.tipo==="confronto"?"purple":q.tipo==="aberta"?"green":"amber"}>{q.tipo}</Tag>
            </div>
          ))}
        </Card>
      </div>
    );
  }
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:600 }}>Pesquisas</div>
        <Btn v="green" onClick={onNova}>+ Nova pesquisa</Btn>
      </div>
      {pesquisas.length===0&&<Card><div style={{ textAlign:"center", color:"#aaa", fontSize:13, padding:"20px 0" }}>Nenhuma pesquisa ainda.</div></Card>}
      <Card>
        {pesquisas.map(p=>{
          const feitas=p.bairros.reduce((a,b)=>a+(b.feitas||0),0);
          const sc=p.status==="concluida"?"green":p.status==="em_andamento"?"blue":"gray";
          return (
            <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid #F1EFE8", cursor:"pointer" }} onClick={()=>setDet(p.id)}>
              <div style={{ width:34, height:34, background:"#E6F1FB", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, flexShrink:0 }}>📍</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, fontWeight:500 }}>{p.cidade}</div>
                <div style={{ fontSize:11, color:"#888" }}>{fmtD(p.dataInicio)} · {feitas}/{p.totalEntrevistas}</div>
              </div>
              <Tag color={sc}>{p.status==="concluida"?"Concluída":p.status==="em_andamento"?"Em andamento":"Agendada"}</Tag>
              <Btn v="secondary" style={{ fontSize:11, padding:"4px 10px" }} onClick={e=>{e.stopPropagation();onEditar(p);}}>✏</Btn>
            </div>
          );
        })}
      </Card>
    </div>
  );
};

// ─── EDITAR RESULTADOS ────────────────────────────────────────────────────────
const EditRes = ({ pesquisa, setPesquisas, pesquisas, onBack }) => {
  const [res,setRes]=useState(pesquisa.resultados||{});
  const [saved,setSaved]=useState(false);
  const salvar=()=>{setPesquisas(pesquisas.map(p=>p.id===pesquisa.id?{...p,resultados:res}:p));setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <Btn v="secondary" onClick={onBack}>← Voltar</Btn>
        <div style={{ fontSize:16, fontWeight:600, flex:1 }}>Resultados — {pesquisa.cidade}</div>
        <Btn v="green" onClick={salvar}>{saved?"✓ Salvo!":"Salvar"}</Btn>
      </div>
      {pesquisa.perguntas.map((perg,idx)=>{
        const r=res[perg.id||idx];
        return (
          <PergResult key={idx} perg={perg} idx={idx} r={r} onChange={(nr)=>setRes({...res,[perg.id||idx]:nr})}/>
        );
      })}
    </div>
  );
};

const PergResult = ({ perg, idx, r, onChange }) => {
  const [edit,setEdit]=useState(false);
  return (
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
        <div style={{ fontSize:13, fontWeight:600, flex:1, paddingRight:8 }}>{idx+1}. {perg.texto}</div>
        <button onClick={()=>setEdit(v=>!v)} style={{ fontSize:11, padding:"3px 10px", border:"1px solid #DDD", borderRadius:6, background:edit?"#1a1a1a":"transparent", color:edit?"#fff":"#888", cursor:"pointer", flexShrink:0 }}>{edit?"✓ Fechar":"✏ Editar"}</button>
      </div>
      {perg.tipo==="nota"&&r&&<GRosca nota={r.media}/>}
      {(perg.tipo==="multipla"||perg.tipo==="confronto"||perg.tipo==="aberta")&&r?.votos&&<GBarras dados={r.votos}/>}
      {!r&&<div style={{ fontSize:12, color:"#aaa", padding:"12px 0" }}>Sem resultados. Clique em Editar para inserir.</div>}
      {edit&&(
        <div style={{ marginTop:12, padding:12, background:"#F7F5EF", borderRadius:8 }}>
          {perg.tipo==="nota"&&(
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <label style={{ fontSize:12, color:"#666" }}>Nota média:</label>
              <input type="number" min="0" max="10" step="0.1" value={r?.media??""} onChange={e=>onChange({...r,media:Number(e.target.value)})} style={{ width:80, fontSize:13, padding:"6px 8px", border:"1px solid #DDD", borderRadius:6 }}/>
            </div>
          )}
          {(perg.tipo==="multipla"||perg.tipo==="confronto"||perg.tipo==="aberta")&&(
            <div>
              {Object.entries(r?.votos||{}).map(([nome,pct])=>(
                <div key={nome} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                  <span style={{ flex:1, fontSize:12 }}>{nome}</span>
                  <input type="number" min="0" max="100" step="0.1" value={pct} onChange={e=>onChange({...r,votos:{...r.votos,[nome]:Number(e.target.value)}})} style={{ width:70, fontSize:13, padding:"6px 8px", border:"1px solid #DDD", borderRadius:6 }}/>
                  <span style={{ fontSize:12, color:"#888" }}>%</span>
                </div>
              ))}
              <button onClick={()=>{const n=window.prompt("Nome do candidato:");if(!n)return;onChange({...r,votos:{...(r?.votos||{}),[n]:0}});}} style={{ fontSize:12, padding:"6px 12px", border:"1px dashed #DDD", borderRadius:6, background:"transparent", cursor:"pointer", marginTop:4, fontFamily:"inherit" }}>+ Candidato</button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ─── EQUIPE ───────────────────────────────────────────────────────────────────
const Equipe = ({ users, setUsers, onAddUser }) => {
  const [show,setShow]=useState(false);
  const [nova,setNova]=useState({nome:"",login:"",senha:"",whatsapp:"",pix:"",role:"entrevistadora",pesquisa_id:""});
  const [ci,setCi]=useState(0);
  const [saving,setSaving]=useState(false);
  const [editando,setEditando]=useState(null); // usuário sendo editado

  const salvar=async()=>{
    if(!nova.nome||!nova.login.trim()) return;
    setSaving(true);
    const novoUser = {...nova, nome: nova.nome.trim(), login: nova.login.trim().toLowerCase(), avatar: CORES_AVATAR[ci], pesquisa_id: nova.pesquisa_id||null};
    if(onAddUser) await onAddUser(novoUser);
    else setUsers(us=>[...us,{id:Date.now(),...novoUser}]);
    setNova({nome:"",login:"",senha:"",whatsapp:"",pix:"",role:"entrevistadora",pesquisa_id:""});
    setShow(false); setSaving(false);
  };

  const salvarEdicao=async()=>{
    if(!editando) return;
    setSaving(true);
    try {
      const patch = { nome:editando.nome, login:editando.login.trim().toLowerCase(), role:editando.role, whatsapp:editando.whatsapp||"", pix:editando.pix||"" };
      if(editando.novaSenha) patch.senha = editando.novaSenha;
      await sb.patch("usuarios", editando.id, patch);
      setUsers(us=>us.map(u=>u.id===editando.id?{...u,...patch,senha:patch.senha||u.senha}:u));
      setEditando(null);
    } catch(e){ alert("Erro: "+e.message); }
    setSaving(false);
  };

  const remover=async(id)=>{
    if(!window.confirm("Remover este usuário?")) return;
    try { await sb.delete("usuarios",id); } catch(e){}
    setUsers(us=>us.filter(u=>u.id!==id));
  };

  const admins = users.filter(u=>u.role==="admin");
  const entrevistadoras = users.filter(u=>u.role==="entrevistadora");
  const mirinhos = users.filter(u=>u.role==="mirinho");
  const clientes = users.filter(u=>u.role==="cliente");

  const UserRow = ({u}) => (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:"1px solid #F1EFE8" }}>
      <Av nome={u.nome} bg={u.avatar?.bg||CORES_AVATAR[0].bg} cor={u.avatar?.cor||CORES_AVATAR[0].cor} size={36}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:13, fontWeight:600 }}>{u.nome}</div>
        <div style={{ fontSize:11, color:"#888" }}>@{u.login}{u.whatsapp?` · ${u.whatsapp}`:""}</div>
      </div>
      <Tag color={u.role==="admin"?"gray":u.role==="mirinho"?"blue":u.role==="cliente"?"amber":"green"}>
        {u.role==="admin"?"Admin":u.role==="mirinho"?"Mirinho":u.role==="cliente"?"Cliente":"Entrevistadora"}
      </Tag>
      <button onClick={()=>setEditando({...u,novaSenha:""})} style={{ background:"transparent", border:"1px solid #DDD", borderRadius:6, cursor:"pointer", color:"#666", fontSize:12, padding:"3px 8px" }}>✏</button>
      <button onClick={()=>remover(u.id)} style={{ background:"transparent", border:"none", cursor:"pointer", color:"#ccc", fontSize:16, padding:"2px 6px" }}>×</button>
    </div>
  );

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:600 }}>Equipe</div>
        <Btn v="green" onClick={()=>{setShow(v=>!v);setEditando(null);}}>+ Novo usuário</Btn>
      </div>

      {/* Modal de edição */}
      {editando&&(
        <Card style={{ border:"2px solid #185FA5" }}>
          <ST>Editando — {editando.nome}</ST>
          <div style={{ marginBottom:14 }}>
            <div style={{ fontSize:12, color:"#666", marginBottom:8, fontWeight:500 }}>Nível de acesso</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div onClick={()=>setEditando({...editando,role:"admin"})} style={{ padding:"10px", borderRadius:10, cursor:"pointer", textAlign:"center", border:`2px solid ${editando.role==="admin"?"#1a1a1a":"#E8E6DF"}`, background:editando.role==="admin"?"#1a1a1a":"#F7F5EF" }}>
                <div style={{ fontSize:18, marginBottom:2 }}>👑</div>
                <div style={{ fontSize:12, fontWeight:600, color:editando.role==="admin"?"#fff":"#1a1a1a" }}>Admin</div>
              </div>
              <div onClick={()=>setEditando({...editando,role:"entrevistadora"})} style={{ padding:"10px", borderRadius:10, cursor:"pointer", textAlign:"center", border:`2px solid ${editando.role==="entrevistadora"?"#1D9E75":"#E8E6DF"}`, background:editando.role==="entrevistadora"?"#E1F5EE":"#F7F5EF" }}>
                <div style={{ fontSize:18, marginBottom:2 }}>📋</div>
                <div style={{ fontSize:12, fontWeight:600, color:editando.role==="entrevistadora"?"#0F6E56":"#1a1a1a" }}>Entrevistadora</div>
              </div>
            </div>
          </div>
          <FI label="Nome" value={editando.nome} onChange={v=>setEditando({...editando,nome:v})}/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <FI label="Login" value={editando.login} onChange={v=>setEditando({...editando,login:v})}/>
            <FI label="Nova senha (deixe vazio para manter)" value={editando.novaSenha||""} onChange={v=>setEditando({...editando,novaSenha:v})} placeholder="nova senha..."/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <FI label="WhatsApp" value={editando.whatsapp||""} onChange={v=>setEditando({...editando,whatsapp:v})}/>
            <FI label="Chave Pix" value={editando.pix||""} onChange={v=>setEditando({...editando,pix:v})}/>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn v="secondary" onClick={()=>setEditando(null)}>Cancelar</Btn>
            <Btn v="green" onClick={salvarEdicao} disabled={saving}>{saving?"Salvando...":"Salvar alterações"}</Btn>
          </div>
        </Card>
      )}

      {/* Formulário de novo usuário */}
      {show&&!editando&&(
        <Card>
          <ST>Cadastrar usuário</ST>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, color:"#666", marginBottom:8, fontWeight:500 }}>Nível de acesso</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <div onClick={()=>setNova({...nova,role:"admin"})} style={{ padding:"12px", borderRadius:10, cursor:"pointer", textAlign:"center", border:`2px solid ${nova.role==="admin"?"#1a1a1a":"#E8E6DF"}`, background:nova.role==="admin"?"#1a1a1a":"#F7F5EF" }}>
                <div style={{ fontSize:20, marginBottom:4 }}>👑</div>
                <div style={{ fontSize:13, fontWeight:600, color:nova.role==="admin"?"#fff":"#1a1a1a" }}>Admin</div>
                <div style={{ fontSize:10, color:nova.role==="admin"?"#aaa":"#888", marginTop:2 }}>Acesso total ao sistema</div>
              </div>
              <div onClick={()=>setNova({...nova,role:"entrevistadora"})} style={{ padding:"12px", borderRadius:10, cursor:"pointer", textAlign:"center", border:`2px solid ${nova.role==="entrevistadora"?"#1D9E75":"#E8E6DF"}`, background:nova.role==="entrevistadora"?"#E1F5EE":"#F7F5EF" }}>
                <div style={{ fontSize:20, marginBottom:4 }}>📋</div>
                <div style={{ fontSize:13, fontWeight:600, color:nova.role==="entrevistadora"?"#0F6E56":"#1a1a1a" }}>Entrevistadora</div>
                <div style={{ fontSize:10, color:nova.role==="entrevistadora"?"#1D9E75":"#888", marginTop:2 }}>Só acessa as pesquisas</div>
              </div>
              <div onClick={()=>setNova({...nova,role:"mirinho"})} style={{ padding:"12px", borderRadius:10, cursor:"pointer", textAlign:"center", border:`2px solid ${nova.role==="mirinho"?"#185FA5":"#E8E6DF"}`, background:nova.role==="mirinho"?"#E6F1FB":"#F7F5EF" }}>
                <div style={{ fontSize:20, marginBottom:4 }}>👁</div>
                <div style={{ fontSize:13, fontWeight:600, color:nova.role==="mirinho"?"#185FA5":"#1a1a1a" }}>Mirinho</div>
                <div style={{ fontSize:10, color:nova.role==="mirinho"?"#185FA5":"#888", marginTop:2 }}>Vê todas as pesquisas</div>
              </div>
              <div onClick={()=>setNova({...nova,role:"cliente"})} style={{ padding:"12px", borderRadius:10, cursor:"pointer", textAlign:"center", border:`2px solid ${nova.role==="cliente"?"#854F0B":"#E8E6DF"}`, background:nova.role==="cliente"?"#FAEEDA":"#F7F5EF" }}>
                <div style={{ fontSize:20, marginBottom:4 }}>🏛</div>
                <div style={{ fontSize:13, fontWeight:600, color:nova.role==="cliente"?"#854F0B":"#1a1a1a" }}>Cliente</div>
                <div style={{ fontSize:10, color:nova.role==="cliente"?"#854F0B":"#888", marginTop:2 }}>Vê só a pesquisa dele</div>
              </div>
            </div>
          </div>
          <FI label="Nome completo" value={nova.nome} onChange={v=>setNova({...nova,nome:v})} placeholder="Ex: Bruna Ferreira"/>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <FI label="Login" value={nova.login} onChange={v=>setNova({...nova,login:v})} placeholder="bruna"/>
            <FI label="Senha inicial" value={nova.senha} onChange={v=>setNova({...nova,senha:v})} placeholder="bruna123"/>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <FI label="WhatsApp" value={nova.whatsapp} onChange={v=>setNova({...nova,whatsapp:v})} placeholder="(17) 99999-0000"/>
            <FI label="Chave Pix" value={nova.pix} onChange={v=>setNova({...nova,pix:v})} placeholder="CPF ou telefone"/>
          </div>
          {nova.role==="cliente"&&(
            <FI label="ID da pesquisa (cole o ID do Supabase)" value={nova.pesquisa_id} onChange={v=>setNova({...nova,pesquisa_id:v})} placeholder="Ex: 1, 2, 3..."/>
          )}
          <div style={{ fontSize:12, color:"#666", marginBottom:8, fontWeight:500 }}>Cor do avatar</div>
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {CORES_AVATAR.map((c,i)=>(
              <div key={i} onClick={()=>setCi(i)} style={{ width:36, height:36, borderRadius:"50%", background:c.bg, color:c.cor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:600, cursor:"pointer", border:ci===i?`2px solid ${c.cor}`:"2px solid transparent" }}>{ini(nova.nome||"?")}</div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <Btn v="secondary" onClick={()=>setShow(false)}>Cancelar</Btn>
            <Btn v="green" onClick={salvar} disabled={saving}>{saving?"Salvando...":"Cadastrar"}</Btn>
          </div>
        </Card>
      )}

      <div style={{ fontSize:12, fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8 }}>👑 Admins</div>
      <Card>
        {admins.length===0&&<div style={{ fontSize:13, color:"#aaa", textAlign:"center", padding:"12px 0" }}>Nenhum admin cadastrado.</div>}
        {admins.map(u=><UserRow key={u.id} u={u}/>)}
      </Card>

      <div style={{ fontSize:12, fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8, marginTop:8 }}>📋 Entrevistadoras</div>
      <Card>
        {entrevistadoras.length===0&&<div style={{ fontSize:13, color:"#aaa", textAlign:"center", padding:"12px 0" }}>Nenhuma entrevistadora cadastrada.</div>}
        {entrevistadoras.map(u=><UserRow key={u.id} u={u}/>)}
      </Card>

      {mirinhos.length>0&&(
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8, marginTop:8 }}>👁 Mirinho</div>
          <Card>{mirinhos.map(u=><UserRow key={u.id} u={u}/>)}</Card>
        </div>
      )}

      {clientes.length>0&&(
        <div>
          <div style={{ fontSize:12, fontWeight:600, color:"#888", textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:8, marginTop:8 }}>🏛 Clientes</div>
          <Card>{clientes.map(u=><UserRow key={u.id} u={u}/>)}</Card>
        </div>
      )}
    </div>
  );
};

// ─── FINANCEIRO ───────────────────────────────────────────────────────────────
const fmtBRL = (v) => `R$ ${Number(v||0).toLocaleString("pt-BR",{minimumFractionDigits:2})}`;

const Financeiro = ({ pesquisas, setPesquisas, users }) => {
  const admins = users.filter(u=>u.role==="admin");
  const [lanc, setLanc] = useState([]);
  const [loadingLanc, setLoadingLanc] = useState(true);

  useEffect(()=>{
    const carregar = async () => {
      setLoadingLanc(true);
      try {
        const data = await sb.get("financeiro","order=created_at.desc");
        setLanc(data);
      } catch(e) { console.error(e); }
      setLoadingLanc(false);
    };
    carregar();
  }, []);

  const getLanc = (pesquisaId, userId) => lanc.find(l=>l.pesquisa_id===pesquisaId&&l.user_id===userId) || { valor:"", status:"a_receber", data_pgto:"" };

  const updLanc = async (pesquisaId, userId, userName, changes) => {
    const existente = lanc.find(l=>l.pesquisa_id===pesquisaId&&l.user_id===userId);
    try {
      if(existente) {
        const updated = await sb.patch("financeiro", existente.id, changes);
        setLanc(ls=>ls.map(l=>l.id===existente.id?{...l,...changes}:l));
      } else {
        const novo = await sb.post("financeiro", { pesquisa_id:pesquisaId, user_id:userId, user_nome:userName, valor:0, status:"a_receber", ...changes });
        setLanc(ls=>[...ls, ...(Array.isArray(novo)?novo:[novo])]);
      }
    } catch(e) { alert("Erro ao salvar: "+e.message); }
  };

  const totalRecebido = (userId) => lanc.filter(l=>l.user_id===userId&&l.status==="recebido").reduce((a,l)=>a+Number(l.valor||0),0);
  const totalAReceber = (userId) => lanc.filter(l=>l.user_id===userId&&l.status==="a_receber"&&l.valor).reduce((a,l)=>a+Number(l.valor||0),0);
  const totalGeralRecebido = admins.reduce((a,u)=>a+totalRecebido(u.id),0);
  const totalGeralAReceber = admins.reduce((a,u)=>a+totalAReceber(u.id),0);

  return (
    <div>
      <div style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>Financeiro</div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10, marginBottom:16 }}>
        {admins.map(u=>(
          <div key={u.id} style={{ background:"#F7F5EF", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ fontSize:11, color:"#888", marginBottom:6 }}>{u.nome}</div>
            <div style={{ fontSize:18, fontWeight:700, color:"#1D9E75" }}>{fmtBRL(totalRecebido(u.id))}</div>
            <div style={{ fontSize:11, color:"#1D9E75", marginBottom:6 }}>✓ recebido</div>
            <div style={{ fontSize:16, fontWeight:600, color:"#854F0B" }}>{fmtBRL(totalAReceber(u.id))}</div>
            <div style={{ fontSize:11, color:"#854F0B" }}>⏳ a receber</div>
          </div>
        ))}
        <div style={{ background:"#1a1a1a", borderRadius:10, padding:"14px 16px" }}>
          <div style={{ fontSize:11, color:"#aaa", marginBottom:6 }}>Total geral</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#1D9E75" }}>{fmtBRL(totalGeralRecebido)}</div>
          <div style={{ fontSize:11, color:"#6EE7B7", marginBottom:6 }}>✓ recebido</div>
          <div style={{ fontSize:16, fontWeight:600, color:"#FCD34D" }}>{fmtBRL(totalGeralAReceber)}</div>
          <div style={{ fontSize:11, color:"#FCD34D" }}>⏳ a receber</div>
        </div>
      </div>

      {pesquisas.length===0&&<Card><div style={{ fontSize:13, color:"#aaa", textAlign:"center", padding:"20px 0" }}>Nenhuma pesquisa cadastrada ainda.</div></Card>}

      {pesquisas.map(p=>(
        <Card key={p.id}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div>
              <div style={{ fontSize:14, fontWeight:700 }}>{p.cidade}</div>
              <div style={{ fontSize:11, color:"#888" }}>{fmtD(p.dataInicio)}{p.dataFim&&p.dataFim!==p.dataInicio?` a ${fmtD(p.dataFim)}`:""}</div>
            </div>
            <Tag color={p.status==="concluida"?"green":p.status==="em_andamento"?"blue":"gray"}>
              {p.status==="concluida"?"Concluída":p.status==="em_andamento"?"Em andamento":"Agendada"}
            </Tag>
          </div>
          {admins.map(u=>{
            const l = getLanc(p.id, u.id);
            return (
              <div key={u.id} style={{ background:"#F7F5EF", borderRadius:10, padding:"12px", marginBottom:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <Av nome={u.nome} bg={u.avatar?.bg||CORES_AVATAR[0].bg} cor={u.avatar?.cor||CORES_AVATAR[0].cor} size={26}/>
                  <span style={{ fontSize:13, fontWeight:600, flex:1 }}>{u.nome}</span>
                  <Tag color={l.status==="recebido"?"green":"amber"}>{l.status==="recebido"?"✓ Recebido":"⏳ A receber"}</Tag>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:8 }}>
                  <div>
                    <div style={{ fontSize:11, color:"#666", marginBottom:4, fontWeight:500 }}>Valor (R$)</div>
                    <input type="number" defaultValue={l.valor} placeholder="0,00"
                      onBlur={e=>updLanc(p.id,u.id,u.nome,{valor:e.target.value})}
                      style={{ width:"100%", fontSize:13, padding:"8px 10px", border:"1px solid #DDD", borderRadius:8, fontFamily:"inherit", boxSizing:"border-box" }}/>
                  </div>
                  <div>
                    <div style={{ fontSize:11, color:"#666", marginBottom:4, fontWeight:500 }}>Data do pagamento</div>
                    <input type="date" defaultValue={l.data_pgto||""}
                      onBlur={e=>updLanc(p.id,u.id,u.nome,{data_pgto:e.target.value||null})}
                      style={{ width:"100%", fontSize:13, padding:"8px 10px", border:"1px solid #DDD", borderRadius:8, fontFamily:"inherit", boxSizing:"border-box" }}/>
                  </div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                  <button onClick={()=>updLanc(p.id,u.id,u.nome,{status:"a_receber"})}
                    style={{ flex:1, padding:"8px", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", border:"1px solid #DDD", background:l.status==="a_receber"?"#FAEEDA":"transparent", color:l.status==="a_receber"?"#854F0B":"#888" }}>
                    ⏳ A receber
                  </button>
                  <button onClick={()=>updLanc(p.id,u.id,u.nome,{status:"recebido"})}
                    style={{ flex:1, padding:"8px", borderRadius:8, fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", border:"1px solid #DDD", background:l.status==="recebido"?"#E1F5EE":"transparent", color:l.status==="recebido"?"#0F6E56":"#888" }}>
                    ✓ Recebido
                  </button>
                </div>
              </div>
            );
          })}
        </Card>
      ))}
    </div>
  );
};

// ─── PDF ──────────────────────────────────────────────────────────────────────
const RODAPE = "A empresa Mirinho Tribuna não autoriza o contratante ou qualquer pessoa a levar este trabalho ao conhecimento público, seja qual for a forma, de acordo com a lei eleitoral.";

const buildPdfHtml = (p, fmtD) => {
  const CORES_G = ["#00b4d8","#4a4e69","#f4a261","#2ec4b6","#e63946","#8338ec","#06d6a0","#ffb703"];
  const paginas = [];

  // CAPA
  const LOGO_B64 = "data:image/png;base64,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";
  paginas.push(`
    <div class="page capa">
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
      <div class="cidade-title">${p.cidade.toUpperCase()}</div>
      <div class="data-title">Realizada em: ${fmtD(p.dataInicio)}${p.dataFim&&p.dataFim!==p.dataInicio?` e ${fmtD(p.dataFim)}`:""}. (${p.totalEntrevistas} entrevistas)</div>
      ${p.bairros&&p.bairros.length>0?`
      <div style="margin-top:40px;text-align:center;">
        ${p.bairros.map((b,i)=>`<div style="font-size:11pt;margin-bottom:6px;"><b>Setor ${i+1}:</b> ${b.nome}</div>`).join("")}
      </div>`:"" }
      <div class="rodape">${RODAPE}</div>
    </div>
  `);

  // PÁGINAS DE PERGUNTAS
  p.perguntas.forEach((perg, i) => {
    const r = p.resultados?.[perg.id||i];
    let grafico = '<p style="color:#aaa;text-align:center;margin:40px 0;">Sem resultados para esta pergunta.</p>';

    if (perg.tipo === "nota" && r?.media !== undefined) {
      const pct = r.media / 10;
      const radius = 70, circ = 2 * Math.PI * radius;
      const filled = circ * pct;
      grafico = `
        <div style="text-align:center;margin:20px 0;">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;">Geral</div>
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
          <div style="width:160px;font-size:12px;text-align:right;font-weight:500;">${nome}</div>
          <div style="flex:1;background:#F1EFE8;border-radius:4px;height:24px;overflow:hidden;">
            <div style="width:${(pct/max)*100}%;height:100%;background:${CORES_G[ci%CORES_G.length]};border-radius:4px;"></div>
          </div>
          <div style="width:50px;font-size:12px;font-weight:600;">${pct}%</div>
        </div>`).join("");
      grafico = `<div style="margin:20px 0;"><div style="font-size:16px;font-weight:700;text-align:center;margin-bottom:16px;">Geral</div>${bars}</div>`;
    }

    paginas.push(`
      <div class="page">
        <div class="pergunta-titulo">${i+1}- ${perg.texto}</div>
        ${grafico}
        <div class="rodape">${RODAPE}</div>
      </div>
    `);
  });

  return `<!DOCTYPE html><html><head><meta charset="utf-8">
  <style>
    *{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:Arial,sans-serif;background:#fff;}
    .page{width:210mm;min-height:297mm;padding:30mm 25mm;position:relative;page-break-after:always;display:flex;flex-direction:column;}
    .capa{align-items:center;justify-content:center;text-align:center;}
    .logo-title{font-size:28pt;font-weight:900;letter-spacing:2px;color:#003399;text-decoration:underline;margin-bottom:4px;}
    .subtitulo{font-size:13pt;color:#333;margin-bottom:60px;font-weight:500;}
    .cidade-title{font-size:72pt;font-weight:900;margin:20px 0;color:#000;}
    .data-title{font-size:14pt;font-weight:700;margin-top:30px;}
    .pergunta-titulo{font-size:14pt;font-weight:700;margin-bottom:20px;line-height:1.4;}
    .rodape{position:absolute;bottom:15mm;left:25mm;right:25mm;font-size:8pt;color:#aaa;text-align:center;font-style:italic;border-top:1px solid #eee;padding-top:8px;}
    @media print{.page{page-break-after:always;}}
  </style>
  </head><body>${paginas.join("")}</body></html>`;
};

const PDFGerador = ({ pesquisas }) => {
  const [sel,setSel]=useState("");
  const [gerado,setGerado]=useState(false);
  const p=pesquisas.find(x=>x.id===Number(sel));

  const baixarPDF = () => {
    if(!p) return;
    const html = buildPdfHtml(p, fmtD);
    const win = window.open("","_blank");
    if(!win) { alert("Permita pop-ups para baixar o PDF."); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(()=>{ win.print(); }, 800);
  };

  return (
    <div>
      <div style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>Gerador de PDF</div>
      <Card>
        <ST>Selecione a pesquisa</ST>
        <select value={sel} onChange={e=>{setSel(e.target.value);setGerado(false);}} style={{ width:"100%", fontSize:13, padding:"9px 10px", border:"1px solid #DDD", borderRadius:8, fontFamily:"inherit", marginBottom:14 }}>
          <option value="">Escolha uma pesquisa...</option>
          {pesquisas.map(x=><option key={x.id} value={x.id}>{x.cidade} — {fmtD(x.dataInicio)}</option>)}
        </select>
        {pesquisas.length===0&&<div style={{ fontSize:12, color:"#aaa", marginBottom:10 }}>Nenhuma pesquisa cadastrada ainda.</div>}
        {p&&(
          <div style={{ background:"#F7F5EF", borderRadius:10, padding:14, marginBottom:14 }}>
            <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>{p.cidade}</div>
            <div style={{ fontSize:12, color:"#666", marginBottom:4 }}>📅 {fmtD(p.dataInicio)}{p.dataFim&&p.dataFim!==p.dataInicio?` a ${fmtD(p.dataFim)}`:""}</div>
            <div style={{ fontSize:12, color:"#666", marginBottom:4 }}>📋 {p.perguntas.length} perguntas</div>
            <div style={{ fontSize:12, color:"#666" }}>📍 {p.bairros.length} bairros · {p.totalEntrevistas} entrevistas</div>
          </div>
        )}
        <div style={{ display:"flex", gap:8 }}>
          <Btn v="secondary" onClick={()=>setGerado(true)} disabled={!p} style={{ flex:1 }}>👁 Ver prévia</Btn>
          <Btn v="green" onClick={baixarPDF} disabled={!p} style={{ flex:1 }}>⬇ Baixar PDF</Btn>
        </div>
        {p&&<div style={{ fontSize:11, color:"#888", marginTop:8, textAlign:"center" }}>O PDF abre numa nova aba — use Ctrl+P (ou Cmd+P) para salvar como PDF.</div>}
      </Card>

      {gerado&&p&&(
        <div>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#1D9E75" }}>✓ Prévia — {p.cidade}</div>
            <Btn v="green" onClick={baixarPDF}>⬇ Baixar PDF</Btn>
          </div>
          {/* CAPA */}
          <div style={{ background:"#fff", border:"1px solid #E8E6DF", borderRadius:12, padding:"36px 32px", marginBottom:12, textAlign:"center" }}>
            <div style={{ fontSize:26, fontWeight:900, letterSpacing:2, marginBottom:6 }}>MIRINHO TRIBUNA</div>
            <div style={{ fontSize:12, color:"#666", marginBottom:32 }}>Pesquisas – Enquetes – Sondagens</div>
            <div style={{ fontSize:48, fontWeight:900, margin:"20px 0" }}>{p.cidade.toUpperCase()}</div>
            <div style={{ fontSize:14, fontWeight:600, marginTop:24 }}>Realizada em: {fmtD(p.dataInicio)}{p.dataFim&&p.dataFim!==p.dataInicio?` e ${fmtD(p.dataFim)}`:""} ({p.totalEntrevistas} entrevistas)</div>
            <div style={{ fontSize:10, color:"#aaa", marginTop:32, borderTop:"1px solid #eee", paddingTop:12, fontStyle:"italic" }}>{RODAPE}</div>
          </div>
          {/* PÁGINAS */}
          {p.perguntas.map((perg,i)=>{
            const r=p.resultados?.[perg.id||i];
            return (
              <div key={i} style={{ background:"#fff", border:"1px solid #E8E6DF", borderRadius:12, padding:"24px 28px", marginBottom:12 }}>
                <div style={{ fontSize:14, fontWeight:700, marginBottom:16 }}>{i+1}- {perg.texto}</div>
                {perg.tipo==="nota"&&r&&<div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}><div style={{ fontSize:13, fontWeight:600, marginBottom:4 }}>Geral</div><GRosca nota={r.media}/></div>}
                {(perg.tipo==="multipla"||perg.tipo==="confronto"||perg.tipo==="aberta")&&r?.votos&&<div><div style={{ fontSize:13, fontWeight:600, marginBottom:8, textAlign:"center" }}>Geral</div><GBarras dados={r.votos}/></div>}
                {!r&&<div style={{ fontSize:12, color:"#aaa", textAlign:"center", padding:"20px 0" }}>Sem resultados para esta pergunta.</div>}
                <div style={{ fontSize:10, color:"#aaa", marginTop:16, borderTop:"1px solid #eee", paddingTop:10, textAlign:"center", fontStyle:"italic" }}>{RODAPE}</div>
              </div>
            );
          })}
          <Btn v="green" onClick={baixarPDF} style={{ width:"100%", padding:12, fontSize:14, marginBottom:16 }}>⬇ Baixar PDF</Btn>
        </div>
      )}
    </div>
  );
};

// ─── PAINEL ADMIN ─────────────────────────────────────────────────────────────
const PainelAdmin = ({ user, onLogout }) => {
  const [aba,setAba]=useState("dashboard");
  const [pesquisas,setPesquisas]=useState([]);
  const [users,setUsers]=useState([user]);
  const [form,setForm]=useState(null);
  const [loading,setLoading]=useState(true);

  // Carregar dados do Supabase
  const carregar = useCallback(async () => {
    setLoading(true);
    try {
      const timeout = new Promise((_,rej) => setTimeout(()=>rej(new Error("timeout")), 5000));
      const [ps, us] = await Promise.race([
        Promise.all([
          sb.get("pesquisas", "order=created_at.desc"),
          sb.get("usuarios", "order=created_at.asc"),
        ]),
        timeout.then(()=>{ throw new Error("timeout"); })
      ]);
      setPesquisas(ps.map(p=>({
        ...p,
        dataInicio: p.data_inicio,
        dataFim: p.data_fim,
        totalEntrevistas: p.total_entrevistas,
        bairros: p.bairros||[],
        perguntas: p.perguntas||[],
        entrevistadoras: p.entrevistadoras||[],
        resultados: p.resultados||{},
      })));
      if(us.length>0) setUsers(us.map(u=>({...u, avatar:{bg:u.avatar_bg,cor:u.avatar_cor}})));
    } catch(e) {
      console.error("Erro ao carregar:", e);
    }
    setLoading(false);
  }, []);

  useEffect(()=>{ carregar(); }, []);

  const salvar = async (dados) => {
    const payload = {
      cidade: dados.cidade,
      data_inicio: dados.dataInicio||null,
      data_fim: dados.dataFim||null,
      total_entrevistas: Number(dados.totalEntrevistas)||0,
      status: dados.status||"agendada",
      bairros: dados.bairros.map((b,i)=>({...b,id:i+1,feitas:b.feitas||0,cota:Number(b.cota)})),
      perguntas: dados.perguntas,
      entrevistadoras: dados.entrevistadoras,
      resultados: dados.resultados||{},
    };
    try {
      if(dados.id) {
        await sb.patch("pesquisas", dados.id, payload);
      } else {
        await sb.post("pesquisas", payload);
      }
      await carregar();
    } catch(e) {
      alert("Erro ao salvar: "+e.message);
    }
    setForm(null);
  };

  const adicionarUser = async (novoUser) => {
    try {
      const result = await sb.post("usuarios", {
        nome: novoUser.nome.trim(),
        login: novoUser.login.trim().toLowerCase(),
        senha: novoUser.senha,
        role: novoUser.role || "entrevistadora",
        avatar_bg: novoUser.avatar?.bg||"#E1F5EE",
        avatar_cor: novoUser.avatar?.cor||"#0F6E56",
        whatsapp: novoUser.whatsapp||"",
        pix: novoUser.pix||"",
        pesquisa_id: novoUser.pesquisa_id ? Number(novoUser.pesquisa_id) : null,
      });
      console.log("Usuário salvo:", result);
      await carregar();
    } catch(e) {
      console.error("Erro completo:", e);
      if(e.message && e.message.includes("duplicate key")) {
        alert("Esse login já existe. Escolha outro login.");
      } else {
        alert("Erro ao salvar: "+JSON.stringify(e.message));
      }
    }
  };

  const Header = () => (
    <div style={{ background:"#1a1a1a", color:"#fff", padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
      <div style={{ width:28, height:28, background:"#fff", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1a1a", fontSize:11, fontWeight:700 }}>MT</div>
      <div style={{ flex:1, fontSize:14, fontWeight:600 }}>Mirinho Tribuna</div>
      <button onClick={carregar} title="Atualizar dados" style={{ fontSize:16, color:"#aaa", background:"transparent", border:"none", cursor:"pointer", padding:"2px 6px" }}>↻</button>
      <div style={{ fontSize:12, color:"#aaa" }}>{user.nome}</div>
      <button onClick={onLogout} style={{ fontSize:11, color:"#888", background:"transparent", border:"none", cursor:"pointer" }}>Sair</button>
    </div>
  );
  const Nav = () => (
    <div style={{ background:"#fff", borderBottom:"1px solid #E8E6DF", display:"flex", overflowX:"auto" }}>
      {[["dashboard","📊 Dashboard"],["pesquisas","📍 Pesquisas"],["equipe","👥 Equipe"],["financeiro","💰 Financeiro"],["pdf","📄 PDF"]].map(([id,label])=>(
        <button key={id} onClick={()=>setAba(id)} style={{ padding:"10px 14px", fontSize:12, fontWeight:aba===id?600:400, color:aba===id?"#1a1a1a":"#888", background:"transparent", border:"none", cursor:"pointer", borderBottom:aba===id?"2px solid #1a1a1a":"2px solid transparent", whiteSpace:"nowrap", fontFamily:"inherit" }}>{label}</button>
      ))}
    </div>
  );

  if(loading) return (
    <div style={{ minHeight:"100vh", background:"#F7F5EF", fontFamily:"Georgia,serif" }}>
      <Header/><Nav/>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:60, flexDirection:"column", gap:12 }}>
        <div style={{ width:32, height:32, border:"3px solid #E8E6DF", borderTopColor:"#1a1a1a", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
        <div style={{ fontSize:13, color:"#888" }}>Carregando...</div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F7F5EF", fontFamily:"Georgia,serif" }}>
      <Header/><Nav/>
      <div style={{ padding:16, maxWidth:700, margin:"0 auto" }}>
        {form ? (
          <FormPesquisa inicial={form==="nova"?null:form} users={users} onSalvar={salvar} onCancelar={()=>setForm(null)}/>
        ) : (
          <>
            {aba==="dashboard"&&<Dashboard pesquisas={pesquisas} users={users}/>}
            {aba==="pesquisas"&&<Pesquisas pesquisas={pesquisas} setPesquisas={setPesquisas} users={users} onNova={()=>setForm("nova")} onEditar={(p)=>setForm(p)}/>}
            {aba==="equipe"&&<Equipe users={users} setUsers={setUsers} onAddUser={adicionarUser}/>}
            {aba==="financeiro"&&<Financeiro pesquisas={pesquisas} setPesquisas={setPesquisas} users={users}/>}
            {aba==="pdf"&&<PDFGerador pesquisas={pesquisas}/>}
          </>
        )}
      </div>
    </div>
  );
};

// ─── APP ENTREVISTADORA ───────────────────────────────────────────────────────
const AppEntrevistadora = ({ user, onLogout, pesquisas }) => {
  const minhas=pesquisas.filter(p=>
    (p.status==="em_andamento"||p.status==="agendada") &&
    (p.entrevistadoras||[]).some(e=>String(e.userId)===String(user.id))
  );
  const [tela,setTela]=useState("home");
  const [pSel,setPSel]=useState(null);
  const [bSel,setBSel]=useState(null);
  const [resp,setResp]=useState({});
  const [env,setEnv]=useState([]);
  const [ok,setOk]=useState(false);

  const enviar=async()=>{
    // Busca a pesquisa atualizada do banco
    try {
      const [pesquisaAtual] = await sb.get("pesquisas", `id=eq.${pSel.id}`);
      const resultados = pesquisaAtual.resultados || {};
      const bairros = pesquisaAtual.bairros || [];

      // Processa cada resposta e atualiza resultados
      pSel.perguntas.forEach((perg, i) => {
        const key = perg.id || i;
        const resposta = resp[key];
        if (resposta === undefined || resposta === "") return;

        if (perg.tipo === "nota") {
          const atual = resultados[key] || { media: 0, total: 0, soma: 0 };
          const soma = (atual.soma || atual.media * atual.total || 0) + Number(resposta);
          const total = (atual.total || 0) + 1;
          resultados[key] = { media: Math.round((soma / total) * 10) / 10, soma, total };
        } else {
          const atual = resultados[key] || { votos: {}, total: 0 };
          const votos = { ...atual.votos };
          votos[resposta] = (votos[resposta] || 0) + 1;
          const total = (atual.total || 0) + 1;
          // Recalcula percentuais
          const novosVotos = {};
          Object.entries(votos).forEach(([k, v]) => {
            novosVotos[k] = Math.round((v / total) * 1000) / 10;
          });
          resultados[key] = { votos: novosVotos, contagem: votos, total };
        }
      });

      // Atualiza bairros com feitas+1
      const bairrosAtualizados = bairros.map(b => {
        if (b.nome === bSel.nome || b.id === bSel.id) {
          return { ...b, feitas: (b.feitas || 0) + 1 };
        }
        return b;
      });

      // Salva no banco
      await sb.patch("pesquisas", pSel.id, {
        resultados,
        bairros: bairrosAtualizados,
        status: "em_andamento"
      });

    } catch(e) {
      console.error("Erro ao salvar resposta:", e);
    }

    setEnv(v=>[...v,{bairroId:bSel.id,resp}]);
    setResp({});
    setOk(true);
    setTimeout(()=>{setOk(false);setTela("bairro");},1800);
  };

  if(ok) return (
    <div style={{ minHeight:"100vh", background:"#F7F5EF", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"Georgia,serif" }}>
      <div style={{ textAlign:"center", padding:32 }}>
        <div style={{ width:56, height:56, borderRadius:"50%", background:"#E1F5EE", display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 12px" }}>✓</div>
        <div style={{ fontSize:18, fontWeight:600, color:"#0F6E56" }}>Entrevista enviada!</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"#F7F5EF", fontFamily:"Georgia,serif", maxWidth:420, margin:"0 auto" }}>
      <div style={{ background:"#1a1a1a", color:"#fff", padding:"14px 20px", display:"flex", alignItems:"center", gap:10 }}>
        {tela!=="home"&&<button onClick={()=>setTela(tela==="formulario"?"bairro":"home")} style={{ background:"transparent", border:"none", color:"#fff", fontSize:18, cursor:"pointer", padding:0 }}>←</button>}
        <Av nome={user.nome} bg={user.avatar?.bg||"#E1F5EE"} cor={user.avatar?.cor||"#0F6E56"} size={28}/>
        <div style={{ flex:1 }}><div style={{ fontSize:13, fontWeight:600 }}>{user.nome.split(" ")[0]}</div></div>
        <button onClick={onLogout} style={{ fontSize:11, color:"#888", background:"transparent", border:"none", cursor:"pointer" }}>Sair</button>
      </div>
      <div style={{ padding:16 }}>
        {tela==="home"&&(
          <div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>Minhas pesquisas</div>
            {minhas.length===0&&<Card><div style={{ fontSize:13, color:"#aaa", textAlign:"center" }}>Nenhuma pesquisa ativa.</div></Card>}
            {minhas.map(p=>{
              const feitas=p.bairros.reduce((a,b)=>a+(b.feitas||0),0);
              return <Card key={p.id} style={{ cursor:"pointer" }} onClick={()=>{setPSel(p);setTela("bairro");}}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div><div style={{ fontSize:15, fontWeight:600 }}>{p.cidade}</div><div style={{ fontSize:11, color:"#888" }}>{feitas}/{p.totalEntrevistas}</div></div>
                  <button style={{ background:"#1D9E75", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer" }}>Iniciar →</button>
                </div>
                <PBar value={feitas} max={Number(p.totalEntrevistas)} color="#185FA5" height={4}/>
              </Card>;
            })}
          </div>
        )}
        {tela==="bairro"&&pSel&&(
          <div>
            <div style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>{pSel.cidade}</div>
            {pSel.bairros.map(b=>{
              const feitas=(b.feitas||0)+env.filter(e=>e.bairroId===b.id).length;
              const completo=feitas>=Number(b.cota);
              return <Card key={b.id||b.nome} style={{ cursor:completo?"default":"pointer",opacity:completo?0.7:1 }} onClick={()=>{if(!completo){setBSel(b);setTela("formulario");}}}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <div style={{ fontSize:14, fontWeight:600 }}>{b.nome}</div>
                  {completo?<Tag color="green">✓ Completo</Tag>:<Tag color="blue">{Number(b.cota)-feitas} faltando</Tag>}
                </div>
                <PBar value={feitas} max={Number(b.cota)} color={completo?"#1D9E75":"#185FA5"} height={6}/>
                <div style={{ fontSize:11, color:"#888", marginTop:4 }}>{feitas} de {b.cota}</div>
              </Card>;
            })}

            {/* Botão finalizar — aparece quando todos bairros completos */}
            {pSel.bairros.every(b=>{
              const feitas=(b.feitas||0)+env.filter(e=>e.bairroId===b.id).length;
              return feitas>=Number(b.cota) && Number(b.cota)>0;
            }) && (
              <div style={{ marginTop:8 }}>
                <div style={{ background:"#E1F5EE", borderRadius:10, padding:"12px 16px", marginBottom:12, fontSize:13, color:"#0F6E56", textAlign:"center", fontWeight:500 }}>
                  🎉 Todos os bairros concluídos!
                </div>
                <button onClick={async()=>{
                  try {
                    await sb.patch("pesquisas", pSel.id, { status:"concluida" });
                    setTela("home");
                    alert("Pesquisa finalizada com sucesso!");
                  } catch(e){ alert("Erro ao finalizar: "+e.message); }
                }} style={{ width:"100%", padding:"14px", background:"#1a1a1a", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer" }}>
                  ✓ Finalizar pesquisa
                </button>
              </div>
            )}
          </div>
        )}
        {tela==="formulario"&&pSel&&bSel&&(
          <div>
            <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>{bSel.nome}</div>
            <div style={{ fontSize:11, color:"#888", marginBottom:16 }}>Preencha e envie cada entrevista individualmente.</div>
            {pSel.perguntas.map((perg,i)=>{
              const key=perg.id||i;
              return <Card key={i}>
                <div style={{ fontSize:11, color:"#aaa", marginBottom:4 }}>Pergunta {i+1}</div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:10 }}>{perg.texto}</div>
                {perg.tipo==="nota"&&<div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>{[0,1,2,3,4,5,6,7,8,9,10].map(n=><button key={n} onClick={()=>setResp({...resp,[key]:n})} style={{ width:38, height:38, borderRadius:8, fontSize:13, fontWeight:500, border:resp[key]===n?"none":"1px solid #DDD", background:resp[key]===n?"#1D9E75":"#fff", color:resp[key]===n?"#fff":"#555", cursor:"pointer" }}>{n}</button>)}<button onClick={()=>setResp({...resp,[key]:"B/NU/IND"})} style={{ padding:"0 12px", height:38, borderRadius:8, fontSize:12, fontWeight:500, border:resp[key]==="B/NU/IND"?"none":"1px solid #DDD", background:resp[key]==="B/NU/IND"?"#4a4e69":"#fff", color:resp[key]==="B/NU/IND"?"#fff":"#555", cursor:"pointer" }}>B/NU/IND</button></div>}
                {(perg.tipo==="multipla"||perg.tipo==="confronto")&&<div style={{ display:"flex", flexDirection:"column", gap:6 }}>{[...(perg.opcoes||[]),"B/NU/IND"].map(op=><button key={op} onClick={()=>setResp({...resp,[key]:op})} style={{ padding:"10px 14px", borderRadius:8, fontSize:13, textAlign:"left", border:resp[key]===op?"none":"1px solid #DDD", background:resp[key]===op?"#1D9E75":"#fff", color:resp[key]===op?"#fff":"#555", cursor:"pointer", fontFamily:"inherit" }}>{op}</button>)}</div>}
                {perg.tipo==="aberta"&&<input value={resp[key]||""} onChange={e=>setResp({...resp,[key]:e.target.value})} placeholder="Escreva a resposta..." style={{ width:"100%", fontSize:13, padding:"9px 10px", border:"1px solid #DDD", borderRadius:8, boxSizing:"border-box", fontFamily:"inherit" }}/>}
              </Card>;
            })}
            <Btn v="green" onClick={enviar} style={{ width:"100%", padding:12, fontSize:14, marginBottom:16 }}>Enviar entrevista ↗</Btn>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PAINEL MIRINHO (visualização geral) ─────────────────────────────────────
const PainelMirinho = ({ user, onLogout }) => {
  const [pesquisas,setPesquisas]=useState([]);
  const [loading,setLoading]=useState(true);
  const [sel,setSel]=useState(null);

  useEffect(()=>{
    sb.get("pesquisas","order=created_at.desc")
      .then(ps=>{ setPesquisas(ps.map(p=>({...p,dataInicio:p.data_inicio,dataFim:p.data_fim,totalEntrevistas:p.total_entrevistas,bairros:p.bairros||[],perguntas:p.perguntas||[],resultados:p.resultados||{}}))); setLoading(false); })
      .catch(()=>setLoading(false));
  },[]);

  const CORES_G=["#00b4d8","#4a4e69","#f4a261","#2ec4b6","#e63946","#8338ec","#06d6a0","#ffb703"];

  return (
    <div style={{ minHeight:"100vh", background:"#F7F5EF", fontFamily:"Georgia,serif" }}>
      <div style={{ background:"#1a1a1a", color:"#fff", padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:28, height:28, background:"#fff", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1a1a", fontSize:11, fontWeight:700 }}>MT</div>
        <div style={{ flex:1, fontSize:14, fontWeight:600 }}>Mirinho Tribuna</div>
        <div style={{ fontSize:12, color:"#aaa" }}>{user.nome}</div>
        <button onClick={onLogout} style={{ fontSize:11, color:"#888", background:"transparent", border:"none", cursor:"pointer" }}>Sair</button>
      </div>
      <div style={{ padding:16, maxWidth:700, margin:"0 auto" }}>
        {sel ? (
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <button onClick={()=>setSel(null)} style={{ background:"transparent", border:"1px solid #DDD", borderRadius:8, padding:"6px 12px", fontSize:13, cursor:"pointer" }}>← Voltar</button>
              <div style={{ fontSize:16, fontWeight:600 }}>{sel.cidade}</div>
              <Tag color={sel.status==="concluida"?"green":sel.status==="em_andamento"?"blue":"gray"}>{sel.status==="concluida"?"Concluída":sel.status==="em_andamento"?"Em andamento":"Agendada"}</Tag>
            </div>
            <Card>
              <ST>Progresso geral</ST>
              {sel.bairros.map((b,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #F1EFE8" }}>
                  <div style={{ flex:1, fontSize:13 }}>{b.nome}</div>
                  <PBar value={b.feitas||0} max={Number(b.cota)} height={5}/>
                  <span style={{ fontSize:12, color:"#666", width:55, textAlign:"right" }}>{b.feitas||0}/{b.cota}</span>
                </div>
              ))}
            </Card>
            {sel.perguntas.map((perg,i)=>{
              const r=sel.resultados?.[perg.id||i];
              return (
                <Card key={i}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>{i+1}. {perg.texto}</div>
                  {perg.tipo==="nota"&&r?.media!==undefined&&(
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:32, fontWeight:900 }}>{r.media}</div>
                      <div style={{ fontSize:11, color:"#aaa" }}>nota média</div>
                    </div>
                  )}
                  {r?.votos&&(
                    <div>{Object.entries(r.votos).sort((a,b)=>b[1]-a[1]).map(([nome,pct],ci)=>(
                      <div key={nome} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                        <div style={{ width:120, fontSize:11, textAlign:"right" }}>{nome}</div>
                        <div style={{ flex:1, background:"#F1EFE8", borderRadius:4, height:18, overflow:"hidden" }}>
                          <div style={{ width:`${pct}%`, height:"100%", background:CORES_G[ci%CORES_G.length], borderRadius:4 }}/>
                        </div>
                        <div style={{ width:40, fontSize:11, fontWeight:600 }}>{pct}%</div>
                      </div>
                    ))}</div>
                  )}
                  {!r&&<div style={{ fontSize:12, color:"#aaa", textAlign:"center", padding:"12px 0" }}>Sem resultados ainda.</div>}
                </Card>
              );
            })}
          </div>
        ) : (
          <div>
            <div style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>Todas as pesquisas</div>
            {loading&&<div style={{ textAlign:"center", padding:40, color:"#aaa" }}>Carregando...</div>}
            {pesquisas.map(p=>{
              const feitas=p.bairros.reduce((a,b)=>a+(b.feitas||0),0);
              const pct=Number(p.totalEntrevistas)>0?Math.round((feitas/Number(p.totalEntrevistas))*100):0;
              return (
                <Card key={p.id} style={{ cursor:"pointer" }} onClick={()=>setSel(p)}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                    <div><div style={{ fontSize:14, fontWeight:600 }}>{p.cidade}</div><div style={{ fontSize:11, color:"#888" }}>{feitas}/{p.totalEntrevistas} · {pct}%</div></div>
                    <Tag color={p.status==="concluida"?"green":p.status==="em_andamento"?"blue":"gray"}>{p.status==="concluida"?"Concluída":p.status==="em_andamento"?"Em andamento":"Agendada"}</Tag>
                  </div>
                  <PBar value={feitas} max={Number(p.totalEntrevistas)} color={p.status==="concluida"?"#1D9E75":"#185FA5"} height={5}/>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PAINEL CLIENTE (prefeito) ────────────────────────────────────────────────
const PainelCliente = ({ user, onLogout }) => {
  const [pesquisa,setPesquisa]=useState(null);
  const [loading,setLoading]=useState(true);
  const CORES_G=["#00b4d8","#4a4e69","#f4a261","#2ec4b6","#e63946","#8338ec","#06d6a0","#ffb703"];

  useEffect(()=>{
    if(!user.pesquisa_id) { setLoading(false); return; }
    sb.get("pesquisas",`id=eq.${user.pesquisa_id}`)
      .then(ps=>{
        if(ps.length>0) setPesquisa({...ps[0],dataInicio:ps[0].data_inicio,dataFim:ps[0].data_fim,totalEntrevistas:ps[0].total_entrevistas,bairros:ps[0].bairros||[],perguntas:ps[0].perguntas||[],resultados:ps[0].resultados||{}});
        setLoading(false);
      })
      .catch(()=>setLoading(false));
  },[user]);

  return (
    <div style={{ minHeight:"100vh", background:"#F7F5EF", fontFamily:"Georgia,serif" }}>
      <div style={{ background:"#1a1a1a", color:"#fff", padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
        <div style={{ width:28, height:28, background:"#fff", borderRadius:6, display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1a1a", fontSize:11, fontWeight:700 }}>MT</div>
        <div style={{ flex:1, fontSize:14, fontWeight:600 }}>{pesquisa?.cidade||"Minha pesquisa"}</div>
        <div style={{ fontSize:12, color:"#aaa" }}>{user.nome}</div>
        <button onClick={onLogout} style={{ fontSize:11, color:"#888", background:"transparent", border:"none", cursor:"pointer" }}>Sair</button>
      </div>
      <div style={{ padding:16, maxWidth:700, margin:"0 auto" }}>
        {loading&&<div style={{ textAlign:"center", padding:40, color:"#aaa" }}>Carregando...</div>}
        {!loading&&!pesquisa&&<Card><div style={{ textAlign:"center", color:"#aaa", padding:20 }}>Nenhuma pesquisa vinculada a este acesso.</div></Card>}
        {pesquisa&&(
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
              {[
                { label:"Total de entrevistas", value:pesquisa.totalEntrevistas, sub:"previstas" },
                { label:"Realizadas", value:pesquisa.bairros.reduce((a,b)=>a+(b.feitas||0),0), sub:"até agora" },
              ].map(m=>(
                <div key={m.label} style={{ background:"#fff", borderRadius:10, padding:"14px 16px", border:"1px solid #E8E6DF" }}>
                  <div style={{ fontSize:11, color:"#888" }}>{m.label}</div>
                  <div style={{ fontSize:26, fontWeight:700 }}>{m.value}</div>
                  <div style={{ fontSize:11, color:"#aaa" }}>{m.sub}</div>
                </div>
              ))}
            </div>
            <Card>
              <ST>Progresso por bairro</ST>
              {pesquisa.bairros.map((b,i)=>(
                <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:"1px solid #F1EFE8" }}>
                  <div style={{ flex:1, fontSize:13 }}>{b.nome}</div>
                  <PBar value={b.feitas||0} max={Number(b.cota)} height={5}/>
                  <span style={{ fontSize:12, color:"#666", width:55, textAlign:"right" }}>{b.feitas||0}/{b.cota}</span>
                </div>
              ))}
            </Card>
            {pesquisa.perguntas.map((perg,i)=>{
              const r=pesquisa.resultados?.[perg.id||i];
              return (
                <Card key={i}>
                  <div style={{ fontSize:13, fontWeight:600, marginBottom:12 }}>{i+1}. {perg.texto}</div>
                  {perg.tipo==="nota"&&r?.media!==undefined&&(
                    <div style={{ textAlign:"center", padding:"12px 0" }}>
                      <div style={{ fontSize:40, fontWeight:900, color:"#1D9E75" }}>{r.media}</div>
                      <div style={{ fontSize:12, color:"#aaa" }}>nota média</div>
                    </div>
                  )}
                  {r?.votos&&(
                    <div>{Object.entries(r.votos).sort((a,b)=>b[1]-a[1]).map(([nome,pct],ci)=>(
                      <div key={nome} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                        <div style={{ width:130, fontSize:12, textAlign:"right", fontWeight:500 }}>{nome}</div>
                        <div style={{ flex:1, background:"#F1EFE8", borderRadius:4, height:22, overflow:"hidden" }}>
                          <div style={{ width:`${pct}%`, height:"100%", background:CORES_G[ci%CORES_G.length], borderRadius:4 }}/>
                        </div>
                        <div style={{ width:45, fontSize:12, fontWeight:700 }}>{pct}%</div>
                      </div>
                    ))}</div>
                  )}
                  {!r&&<div style={{ fontSize:12, color:"#aaa", textAlign:"center", padding:"12px 0" }}>Sem resultados ainda.</div>}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [pesquisas,setPesquisas]=useState([]);

  useEffect(()=>{
    if(!user || user.role==="admin" || user.role==="mirinho" || user.role==="cliente") return;
    sb.get("pesquisas","order=created_at.desc")
      .then(ps=>setPesquisas(ps.map(p=>({
        ...p,
        dataInicio:p.data_inicio, dataFim:p.data_fim,
        totalEntrevistas:p.total_entrevistas,
        bairros:p.bairros||[], perguntas:p.perguntas||[],
        entrevistadoras:p.entrevistadoras||[], resultados:p.resultados||{},
      }))))
      .catch(e=>console.error("Erro ao carregar pesquisas:",e));
  },[user]);

  if(!user) return <Login onLogin={setUser}/>;
  if(user.role==="admin") return <PainelAdmin user={user} onLogout={()=>setUser(null)}/>;
  if(user.role==="mirinho") return <PainelMirinho user={user} onLogout={()=>setUser(null)}/>;
  if(user.role==="cliente") return <PainelCliente user={user} onLogout={()=>setUser(null)}/>;
  return <AppEntrevistadora user={user} onLogout={()=>setUser(null)} pesquisas={pesquisas}/>;
}
