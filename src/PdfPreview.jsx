import { useRef } from 'react';

export default function PdfPreview({ html }) {
  const dialog = useRef(null);
  return <div style={{ marginTop:20 }}>
    <button type="button" className="imp-secondary" style={{ padding:'10px 16px', borderRadius:8, cursor:'pointer', marginBottom:12 }} onClick={() => dialog.current.showModal()}>Ampliar prévia</button>
    <iframe title="Prévia do PDF Mirinho Tribuna" sandbox="" srcDoc={html} style={{ display:'block', width:'100%', height:'80vh', minHeight:500, border:'1px solid #ddd', background:'white' }}/>
    <dialog ref={dialog} aria-label="Prévia ampliada do PDF" style={{ width:'calc(100vw - 32px)', maxWidth:'none', height:'calc(100dvh - 32px)', maxHeight:'none', padding:0, border:'1px solid #ccc', borderRadius:12, background:'#f4f5f1' }}>
      <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:16, padding:'12px 20px', fontFamily:'Arial,sans-serif', borderBottom:'1px solid #ddd' }}>
          <strong>Prévia ampliada do PDF</strong>
          <button autoFocus type="button" className="imp-secondary" style={{ padding:'9px 16px', borderRadius:8, cursor:'pointer' }} onClick={() => dialog.current.close()}>Fechar prévia</button>
        </div>
        <iframe title="PDF ampliado" sandbox="" srcDoc={html} style={{ flex:1, minHeight:0, width:'100%', border:0, background:'white' }}/>
      </div>
    </dialog>
  </div>;
}
